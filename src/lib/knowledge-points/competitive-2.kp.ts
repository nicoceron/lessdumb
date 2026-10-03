import {
  choose,
  predictOutput,
  typeNumber,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

/** Joins program lines so multi-line Python stays readable in source. */
const lines = (...source: string[]) => source.join('\n');

// Shared program fragments. Each question still prints a complete program.
const replayLoop = (commands: string) =>
  lines(
    'history = []',
    `for command in ${commands}:`,
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '    else:',
    '        history.append(command)',
  );

const countedReplay = (commands: string) =>
  lines(
    'history = []',
    'ignored = 0',
    `for command in ${commands}:`,
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '        else:',
    '            ignored += 1',
    '    else:',
    '        history.append(command)',
  );

const operationReplay = (commands: string) =>
  lines(
    `commands = ${commands}`,
    'history = []',
    'operations = 0',
    'for command in commands:',
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '            operations += 1',
    '    else:',
    '        history.append(command)',
    '        operations += 1',
  );

const nextGreater = (values: string) =>
  lines(
    `values = ${values}`,
    'answer = [None] * len(values)',
    'pending = []',
    'for index in range(len(values)):',
    '    while pending and values[pending[-1]] < values[index]:',
    '        answer[pending.pop()] = values[index]',
    '    pending.append(index)',
  );

const budgetScan = (values: string) =>
  lines(
    `values = ${values}`,
    'pending = []',
    'pops = 0',
    'for index in range(len(values)):',
    '    while pending and values[pending[-1]] < values[index]:',
    '        pending.pop()',
    '        pops += 1',
    '    pending.append(index)',
  );

const isMinHeap = lines(
  'def is_min_heap(values):',
  '    for child in range(1, len(values)):',
  '        parent = (child - 1) // 2',
  '        if values[parent] > values[child]:',
  '            return False',
  '    return True',
  '',
);

const hasPath = lines(
  'def has_path(root, text):',
  '    node = root',
  '    for letter in text:',
  '        if letter not in node:',
  '            return False',
  '        node = node[letter]',
  '    return True',
  '',
);

const containsWord = lines(
  'def contains_word(root, word):',
  '    node = root',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            return False',
  '        node = node["children"][letter]',
  '    return node["end"]',
  '',
);

const insertWord = lines(
  'def insert(root, word):',
  '    node = root',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            node["children"][letter] = {"end": False, "children": {}}',
  '        node = node["children"][letter]',
  '    node["end"] = True',
  '',
  'root = {"end": False, "children": {}}',
);

const prefixCount = lines(
  'def prefix_count(root, prefix):',
  '    node = root',
  '    for letter in prefix:',
  '        if letter not in node["children"]:',
  '            return 0',
  '        node = node["children"][letter]',
  '    return node["count"]',
  '',
);

const countingInsert = lines(
  'def insert(root, word):',
  '    node = root',
  '    node["count"] += 1',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            node["children"][letter] = {"count": 0, "children": {}}',
  '        node = node["children"][letter]',
  '        node["count"] += 1',
  '',
  'root = {"count": 0, "children": {}}',
);

const trieBuilder = (words: string) =>
  lines(
    'root = {"end": False, "children": {}}',
    'created = 0',
    `for word in ${words}:`,
    '    node = root',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"end": False, "children": {}}',
    '            created += 1',
    '        node = node["children"][letter]',
    '    node["end"] = True',
  );

const wordTrie = (words: string) =>
  lines(
    'root = {"end": False, "children": {}}',
    `for word in ${words}:`,
    '    node = root',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"end": False, "children": {}}',
    '        node = node["children"][letter]',
    '    node["end"] = True',
    '',
    'def walk(text):',
    '    node = root',
    '    for letter in text:',
    '        if letter not in node["children"]:',
    '            return None',
    '        node = node["children"][letter]',
    '    return node',
    '',
  );

const countTrie = (words: string) =>
  lines(
    'root = {"count": 0, "children": {}}',
    `for word in ${words}:`,
    '    node = root',
    '    node["count"] += 1',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"count": 0, "children": {}}',
    '        node = node["children"][letter]',
    '        node["count"] += 1',
    '',
    'def starts_with(prefix):',
    '    node = root',
    '    for letter in prefix:',
    '        if letter not in node["children"]:',
    '            return 0',
    '        node = node["children"][letter]',
    '    return node["count"]',
    '',
  );

const baseAnswer = lines(
  'def base_answer(exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    return None',
  '',
);

const halvingSteps = lines(
  'def halving_steps(exponent):',
  '    steps = 0',
  '    while exponent > 0:',
  '        exponent = exponent // 2',
  '        steps += 1',
  '    return steps',
  '',
);

const combinePower = lines(
  'def combine_power(base, exponent, half):',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    return result',
  '',
);

const powerFunction = lines(
  'def power(base, exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    half = power(base, exponent // 2)',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    return result',
  '',
);

const tracedPower = lines(
  'def power(base, exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    half = power(base, exponent // 2)',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    print(exponent, result)',
  '    return result',
  '',
);

const callDepth = lines(
  'def depth(exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    return 1 + depth(exponent // 2)',
  '',
);

const canComplete = lines(
  'def can_complete(n, start, chosen, k):',
  '    return k - chosen <= n - start',
  '',
);

const combinations = (save: string) =>
  lines(
    'def combinations(n, k):',
    '    result = []',
    '    path = []',
    '',
    '    def visit(start):',
    '        if len(path) == k:',
    `            result.append(${save})`,
    '            return',
    '        for index in range(start, n):',
    '            path.append(index)',
    '            visit(index + 1)',
    '            path.pop()',
    '',
    '    visit(0)',
    '    return result',
    '',
  );

const countVisits = lines(
  'def visits(n, k, prune):',
  '    count = [0]',
  '    path = []',
  '',
  '    def visit(start):',
  '        count[0] += 1',
  '        if len(path) == k:',
  '            return',
  '        stop = n',
  '        if prune:',
  '            stop = n - (k - len(path)) + 1',
  '        for index in range(start, stop):',
  '            path.append(index)',
  '            visit(index + 1)',
  '            path.pop()',
  '',
  '    visit(0)',
  '    return count[0]',
  '',
);

const insideBounds = lines(
  'def inside(key, lower, upper):',
  '    if lower is not None and key <= lower:',
  '        return False',
  '    if upper is not None and key >= upper:',
  '        return False',
  '    return True',
  '',
);

const searchBranch = lines(
  'def branch(key, target):',
  '    if target == key:',
  '        return "found"',
  '    if target < key:',
  '        return "left"',
  '    return "right"',
  '',
);

const improveFloor = lines(
  'def improve_floor(best, key, limit):',
  '    if key <= limit and (best is None or key > best):',
  '        return key',
  '    return best',
  '',
);

const sampleTree =
  'tree = (20, (10, (5, None, None), (15, None, None)), (30, None, (40, None, None)))';

const treeContains = lines(
  'def contains(node, target):',
  '    while node is not None:',
  '        key, left, right = node',
  '        if target == key:',
  '            return True',
  '        if target < key:',
  '            node = left',
  '        else:',
  '            node = right',
  '    return False',
  '',
);

const treeFloor = lines(
  'def floor(node, limit):',
  '    best = None',
  '    while node is not None:',
  '        key, left, right = node',
  '        if key <= limit:',
  '            best = key',
  '            node = right',
  '        else:',
  '            node = left',
  '    return best',
  '',
);

const searchSteps = lines(
  'def steps(node, target):',
  '    count = 0',
  '    while node is not None:',
  '        key, left, right = node',
  '        count += 1',
  '        if target == key:',
  '            return count',
  '        if target < key:',
  '            node = left',
  '        else:',
  '            node = right',
  '    return count',
  '',
);

const existingChildren = lines(
  'def existing_children(node):',
  '    if node is None:',
  '        return []',
  '    key, left, right = node',
  '    return [child for child in (left, right) if child is not None]',
  '',
);

const preorderLoop = (tree: string) =>
  lines(
    `tree = ${tree}`,
    'order = []',
    'stack = [tree]',
    'while stack:',
    '    key, left, right = stack.pop()',
    '    order.append(key)',
    '    if right is not None:',
    '        stack.append(right)',
    '    if left is not None:',
    '        stack.append(left)',
  );

const combineHeight = lines(
  'def combine_height(left_height, right_height):',
  '    return 1 + max(left_height, right_height)',
  '',
);

/** Iterative postorder over children lists; `onReady` runs after a size is set. */
const eventSizes = (children: string, onReady = '', onPop = '') =>
  lines(
    `children = ${children}`,
    'sizes = [0] * len(children)',
    'stack = [(0, False)]',
    ...(onPop ? ['events = 0'] : []),
    'while stack:',
    '    vertex, ready = stack.pop()',
    ...(onPop ? [`    ${onPop}`] : []),
    '    if ready:',
    '        total = 1',
    '        for child in children[vertex]:',
    '            total += sizes[child]',
    '        sizes[vertex] = total',
    ...(onReady ? [`        ${onReady}`] : []),
    '    else:',
    '        stack.append((vertex, True))',
    '        for child in children[vertex]:',
    '            stack.append((child, False))',
  );

const addDirected = lines(
  'def add_directed(graph, u, v):',
  '    result = [neighbors.copy() for neighbors in graph]',
  '    result[u].append(v)',
  '    return result',
  '',
);

const addUndirected = lines(
  'def add_undirected(graph, u, v):',
  '    result = [neighbors.copy() for neighbors in graph]',
  '    result[u].append(v)',
  '    result[v].append(u)',
  '    return result',
  '',
);

const undirectedBuild = (n: number, edges: string) =>
  lines(
    `graph = [[] for _ in range(${n})]`,
    `for u, v in ${edges}:`,
    '    graph[u].append(v)',
    '    graph[v].append(u)',
  );

const makeNeighbors = lines(
  'def make_neighbors(n, edges, directed):',
  '    neighbors = [[] for _ in range(n)]',
  '    for u, v in edges:',
  '        neighbors[u].append(v)',
  '        if not directed:',
  '            neighbors[v].append(u)',
  '    return neighbors',
  '',
);

const discoverLoop = (seen: string, pending: string, vertices: string) =>
  lines(
    `seen = ${seen}`,
    `pending = ${pending}`,
    `for vertex in ${vertices}:`,
    '    if vertex not in seen:',
    '        seen.add(vertex)',
    '        pending.append(vertex)',
  );

/** Marks only when a vertex is popped, so pending can hold duplicates. */
const popTimeMarking = (graph: string) =>
  lines(
    `graph = ${graph}`,
    'seen = set()',
    'pending = [0]',
    'pushed = []',
    'while pending:',
    '    vertex = pending.pop()',
    '    if vertex not in seen:',
    '        seen.add(vertex)',
    '        for neighbor in graph[vertex]:',
    '            if neighbor not in seen:',
    '                pending.append(neighbor)',
    '                pushed.append(neighbor)',
  );

const takeDepthFirst = lines(
  'def take_depth_first(pending):',
  '    remaining = pending.copy()',
  '    if not remaining:',
  '        return None, remaining',
  '    return remaining.pop(), remaining',
  '',
);

const depthLabels = (graph: string) =>
  lines(
    `graph = ${graph}`,
    'depth = [-1] * len(graph)',
    'depth[0] = 0',
    'stack = [0]',
    'while stack:',
    '    vertex = stack.pop()',
    '    for neighbor in graph[vertex]:',
    '        if depth[neighbor] == -1:',
    '            depth[neighbor] = depth[vertex] + 1',
    '            stack.append(neighbor)',
  );

const unseenNeighbors = lines(
  'def unseen_neighbors(neighbors, seen):',
  '    discovered = seen.copy()',
  '    result = []',
  '    for vertex in neighbors:',
  '        if vertex not in discovered:',
  '            discovered.add(vertex)',
  '            result.append(vertex)',
  '    return result',
  '',
);

/** Iterative DFS from `start`; `onPop` and `onScan` add trace lines. */
const dfsLoop = (graph: string, start = 0, onPop = '', onScan = '') =>
  lines(
    `graph = ${graph}`,
    `seen = {${start}}`,
    `stack = [${start}]`,
    'while stack:',
    '    vertex = stack.pop()',
    ...(onPop ? [`    ${onPop}`] : []),
    '    for neighbor in graph[vertex]:',
    ...(onScan ? [`        ${onScan}`] : []),
    '        if neighbor not in seen:',
    '            seen.add(neighbor)',
    '            stack.append(neighbor)',
  );

const takeBreadthFirst = lines(
  'from collections import deque',
  '',
  'def take_breadth_first(pending):',
  '    queue = deque(pending)',
  '    if not queue:',
  '        return None, []',
  '    vertex = queue.popleft()',
  '    return vertex, list(queue)',
  '',
);

const queueNeighbors = lines(
  'def queue_neighbors(pending, seen, neighbors):',
  '    queue = pending.copy()',
  '    discovered = seen.copy()',
  '    for vertex in neighbors:',
  '        if vertex not in discovered:',
  '            discovered.add(vertex)',
  '            queue.append(vertex)',
  '    return queue, discovered',
  '',
);

const bfsOrder = (graph: string) =>
  lines(
    'from collections import deque',
    `graph = ${graph}`,
    'seen = {0}',
    'queue = deque([0])',
    'order = []',
    'while queue:',
    '    vertex = queue.popleft()',
    '    order.append(vertex)',
    '    for neighbor in graph[vertex]:',
    '        if neighbor not in seen:',
    '            seen.add(neighbor)',
    '            queue.append(neighbor)',
  );

const assignNextLayer = lines(
  'def assign_next_layer(distances, vertex, neighbors):',
  '    result = distances.copy()',
  '    for neighbor in neighbors:',
  '        if result[neighbor] == -1:',
  '            result[neighbor] = result[vertex] + 1',
  '    return result',
  '',
);

/** Breadth-first distances; `onPop` and `onScan` add trace lines. */
const bfsDistances = (graph: string, source = 0, onPop = '', onScan = '') =>
  lines(
    'from collections import deque',
    `graph = ${graph}`,
    'distance = [-1] * len(graph)',
    `distance[${source}] = 0`,
    `queue = deque([${source}])`,
    'while queue:',
    '    vertex = queue.popleft()',
    ...(onPop ? [`    ${onPop}`] : []),
    '    for neighbor in graph[vertex]:',
    ...(onScan ? [`        ${onScan}`] : []),
    '        if distance[neighbor] == -1:',
    '            distance[neighbor] = distance[vertex] + 1',
    '            queue.append(neighbor)',
  );

const incomingCounts = lines(
  'def incoming_counts(graph):',
  '    counts = [0] * len(graph)',
  '    for neighbors in graph:',
  '        for vertex in neighbors:',
  '            counts[vertex] += 1',
  '    return counts',
  '',
);

const readyVertices = lines(
  'def ready_vertices(indegrees):',
  '    return [vertex for vertex in range(len(indegrees)) if indegrees[vertex] == 0]',
  '',
);

const releaseEdges = lines(
  'def release_edges(indegrees, outgoing):',
  '    counts = indegrees.copy()',
  '    ready = []',
  '    for vertex in outgoing:',
  '        counts[vertex] -= 1',
  '        if counts[vertex] == 0:',
  '            ready.append(vertex)',
  '    return counts, ready',
  '',
);

/** Kahn’s algorithm; `seed` builds the initial queue, `finish` prints. */
const kahn = (
  n: number,
  edges: string,
  finish = 'print(order)',
  seed = 'deque([vertex for vertex in range(n) if indegree[vertex] == 0])',
) =>
  lines(
    'from collections import deque',
    `n = ${n}`,
    `edges = ${edges}`,
    'graph = [[] for _ in range(n)]',
    'indegree = [0] * n',
    'for source, target in edges:',
    '    graph[source].append(target)',
    '    indegree[target] += 1',
    `queue = ${seed}`,
    'order = []',
    'while queue:',
    '    vertex = queue.popleft()',
    '    order.append(vertex)',
    '    for neighbor in graph[vertex]:',
    '        indegree[neighbor] -= 1',
    '        if indegree[neighbor] == 0:',
    '            queue.append(neighbor)',
    finish,
  );

const completeOrNone = lines(
  'print(order)',
  'if len(order) == n:',
  '    print(order)',
  'else:',
  '    print(None)',
);

const relaxDistance = lines(
  'def relax(current, source_distance, weight):',
  '    candidate = source_distance + weight',
  '    if current is None or candidate < current:',
  '        return candidate',
  '    return current',
  '',
);

const isCurrent = lines(
  'def is_current(entry, distances):',
  '    queued_distance, vertex = entry',
  '    return queued_distance == distances[vertex]',
  '',
);

const nextEntry = lines(
  'import heapq',
  '',
  'def next_entry(entries, distances):',
  '    heap = entries.copy()',
  '    heapq.heapify(heap)',
  '    while heap:',
  '        distance, vertex = heapq.heappop(heap)',
  '        if distance == distances[vertex]:',
  '            return distance, vertex',
  '    return None',
  '',
);

/** Lazy-heap Dijkstra from vertex 0; `onPop` runs before the stale check. */
const dijkstra = (graph: string, onPop = '') =>
  lines(
    'import heapq',
    `graph = ${graph}`,
    'distance = [None] * len(graph)',
    'distance[0] = 0',
    'heap = [(0, 0)]',
    'while heap:',
    '    cost, vertex = heapq.heappop(heap)',
    ...(onPop ? [`    ${onPop}`] : []),
    '    if cost == distance[vertex]:',
    '        for neighbor, weight in graph[vertex]:',
    '            candidate = cost + weight',
    '            if distance[neighbor] is None or candidate < distance[neighbor]:',
    '                distance[neighbor] = candidate',
    '                heapq.heappush(heap, (candidate, neighbor))',
  );

const shortestCosts = lines(
  'import heapq',
  '',
  'def shortest_costs(n, edges, source):',
  '    graph = [[] for _ in range(n)]',
  '    for u, v, weight in edges:',
  '        if weight < 0:',
  '            raise ValueError("negative weight")',
  '        graph[u].append((v, weight))',
  '    distance = [None] * n',
  '    distance[source] = 0',
  '    heap = [(0, source)]',
  '    while heap:',
  '        cost, vertex = heapq.heappop(heap)',
  '        if cost == distance[vertex]:',
  '            for neighbor, weight in graph[vertex]:',
  '                candidate = cost + weight',
  '                if distance[neighbor] is None or candidate < distance[neighbor]:',
  '                    distance[neighbor] = candidate',
  '                    heapq.heappush(heap, (candidate, neighbor))',
  '    return distance',
  '',
);

const findRoot = lines(
  'def find_root(parent, vertex):',
  '    while parent[vertex] != vertex:',
  '        vertex = parent[vertex]',
  '    return vertex',
  '',
);

const countHops = lines(
  'def hops(parent, vertex):',
  '    count = 0',
  '    while parent[vertex] != vertex:',
  '        vertex = parent[vertex]',
  '        count += 1',
  '    return count',
  '',
);

const compressPath = lines(
  'def compress(parent, vertex):',
  '    result = parent.copy()',
  '    root = vertex',
  '    while result[root] != root:',
  '        root = result[root]',
  '    while result[vertex] != vertex:',
  '        next_vertex = result[vertex]',
  '        result[vertex] = root',
  '        vertex = next_vertex',
  '    return result',
  '',
);

const joinRoots = lines(
  'def join_roots(parent, sizes, first, second):',
  '    new_parent = parent.copy()',
  '    new_sizes = sizes.copy()',
  '    if first == second:',
  '        return new_parent, new_sizes',
  '    if new_sizes[first] < new_sizes[second]:',
  '        first, second = second, first',
  '    new_parent[second] = first',
  '    new_sizes[first] += new_sizes[second]',
  '    return new_parent, new_sizes',
  '',
);

/** DSU with path halving and union by size; records the count per edge. */
const dsuRun = (n: number, edges: string) =>
  lines(
    `n = ${n}`,
    'parent = list(range(n))',
    'size = [1] * n',
    'components = n',
    '',
    'def find(vertex):',
    '    while parent[vertex] != vertex:',
    '        parent[vertex] = parent[parent[vertex]]',
    '        vertex = parent[vertex]',
    '    return vertex',
    '',
    'counts = []',
    `for first, second in ${edges}:`,
    '    a, b = find(first), find(second)',
    '    if a != b:',
    '        if size[a] < size[b]:',
    '            a, b = b, a',
    '        parent[b] = a',
    '        size[a] += size[b]',
    '        components -= 1',
    '    counts.append(components)',
  );

/** Union by size without compression, to show the depth bound alone. */
const sizeOnlyUnions = (n: number, pairs: string) =>
  lines(
    countHops,
    `parent = list(range(${n}))`,
    `size = [1] * ${n}`,
    `for first, second in ${pairs}:`,
    '    a, b = first, second',
    '    while parent[a] != a:',
    '        a = parent[a]',
    '    while parent[b] != b:',
    '        b = parent[b]',
    '    if a != b:',
    '        if size[a] < size[b]:',
    '            a, b = b, a',
    '        parent[b] = a',
    '        size[a] += size[b]',
    `print([hops(parent, v) for v in range(${n})])`,
  );

const acceptEdge = lines(
  'def accept(labels, u, v):',
  '    first, second = labels[u], labels[v]',
  '    if first == second:',
  '        return False, labels.copy()',
  '    merged = []',
  '    for label in labels:',
  '        if label == second:',
  '            merged.append(first)',
  '        else:',
  '            merged.append(label)',
  '    return True, merged',
  '',
);

const acceptedCount = (n: number, edges: string) =>
  lines(
    acceptEdge,
    `labels = list(range(${n}))`,
    'accepted = 0',
    `for u, v in ${edges}:`,
    '    ok, labels = accept(labels, u, v)',
    '    if ok:',
    '        accepted += 1',
    `print(accepted, accepted == ${n} - 1)`,
  );

const completedCost = lines(
  'def completed_cost(n, selected_weights):',
  '    if len(selected_weights) != max(0, n - 1):',
  '        return None',
  '    return sum(selected_weights)',
  '',
);

const weightKey = 'key=lambda edge: edge[2]';

/** Kruskal with DSU; prints accepted weights and the total. */
const kruskal = (n: number, edges: string) =>
  lines(
    `n = ${n}`,
    `edges = ${edges}`,
    'parent = list(range(n))',
    'size = [1] * n',
    '',
    'def find(vertex):',
    '    while parent[vertex] != vertex:',
    '        parent[vertex] = parent[parent[vertex]]',
    '        vertex = parent[vertex]',
    '    return vertex',
    '',
    'total = 0',
    'chosen = []',
    `for u, v, weight in sorted(edges, ${weightKey}):`,
    '    a, b = find(u), find(v)',
    '    if a != b:',
    '        if size[a] < size[b]:',
    '            a, b = b, a',
    '        parent[b] = a',
    '        size[a] += size[b]',
    '        total += weight',
    '        chosen.append(weight)',
    'print(chosen, total)',
  );

const minimumLinkCost = lines(
  'def minimum_link_cost(n, edges):',
  '    if n <= 1:',
  '        return 0',
  '    parent = list(range(n))',
  '    size = [1] * n',
  '',
  '    def find(vertex):',
  '        while parent[vertex] != vertex:',
  '            parent[vertex] = parent[parent[vertex]]',
  '            vertex = parent[vertex]',
  '        return vertex',
  '',
  '    total = 0',
  '    chosen = 0',
  `    for u, v, weight in sorted(edges, ${weightKey}):`,
  '        a, b = find(u), find(v)',
  '        if a != b:',
  '            if size[a] < size[b]:',
  '                a, b = b, a',
  '            parent[b] = a',
  '            size[a] += size[b]',
  '            total += weight',
  '            chosen += 1',
  '    if chosen != n - 1:',
  '        return None',
  '    return total',
  '',
);

/** Reports after how many sorted edges Kruskal’s tree was complete. */
const kruskalCompletion = (n: number, edges: string) =>
  lines(
    `n = ${n}`,
    `edges = ${edges}`,
    'parent = list(range(n))',
    '',
    'def find(vertex):',
    '    while parent[vertex] != vertex:',
    '        parent[vertex] = parent[parent[vertex]]',
    '        vertex = parent[vertex]',
    '    return vertex',
    '',
    `order = sorted(edges, ${weightKey})`,
    'chosen = 0',
    'complete_after = 0',
    'for index in range(len(order)):',
    '    u, v, weight = order[index]',
    '    a, b = find(u), find(v)',
    '    if a != b:',
    '        parent[b] = a',
    '        chosen += 1',
    '        if chosen == n - 1:',
    '            complete_after = index + 1',
    'print(complete_after, len(order))',
  );

export const knowledgePoints: KnowledgePointModule = {
  // ---------------------------------------------------------------- stacks
  'cp-stack-push': [
    {
      title: 'Push a value onto the right end',
      explanation: [
        'A list used as a stack keeps its oldest entry at the left and its newest at the right. Pushing calls append, which adds exactly one entry at the right end and leaves every earlier entry where it was.',
        'A push never replaces or merges an equal value: pushing "dry" twice records two separate actions.',
      ],
      example: {
        code: lines(
          'stack = ["wash", "dry"]',
          'stack.append("fold")',
          'stack.append("dry")',
          'print(stack)',
          'print(len(stack))',
        ),
        output: "['wash', 'dry', 'fold', 'dry']\n4",
        explanation:
          'Each append adds one entry at the right. The second "dry" is a new action, so the stack grows to four entries.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'stack = [3]',
            'stack.append(8)',
            'stack.append(3)',
            'print(stack)',
          ),
          '[3, 8, 3]',
          'Each append adds to the right end, and the repeated 3 is kept as its own entry.',
        ),
        choose(
          'The stack ["a", "b"] has "b" as its newest entry. Which list results from pushing "c"?',
          ['["c", "a", "b"]', '["a", "b", "c"]', '["a", "c"]', '["c", "b"]'],
          1,
          'A push appends at the newest end; the earlier entries keep their positions.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'moves = []',
            'for step in ["up", "up", "left"]:',
            '    moves.append(step)',
            'print(len(moves))',
            'print(moves)',
          ),
          "3\n['up', 'up', 'left']",
          'Three pushes add three entries in arrival order; equal values are not merged.',
        ),
        choose(
          'Which statement pushes value onto a list stack whose newest entry is at the right end?',
          [
            'stack[-1] = value',
            'stack[0] = value',
            'stack = [value]',
            'stack.append(value)',
          ],
          3,
          'append adds a new rightmost entry; the other statements overwrite an entry or discard the stack.',
        ),
      ],
    },
    {
      title: 'Push onto a copy when the caller keeps the original',
      explanation: [
        'A function that promises a new stack must not change the list it was given. Writing result = stack only creates a second name for the same list, so appending through either name changes both.',
        'stack.copy() makes a separate list with the same entries. Appending to the copy leaves the caller’s stack exactly as it was.',
      ],
      example: {
        code: lines(
          'def push_entry(stack, value):',
          '    result = stack.copy()',
          '    result.append(value)',
          '    return result',
          '',
          'before = [1, 2]',
          'after = push_entry(before, 5)',
          'print(before)',
          'print(after)',
        ),
        output: '[1, 2]\n[1, 2, 5]',
        explanation:
          'The append changes only the copy, so before keeps two entries while after has the new top 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'def push_entry(stack, value):',
            '    result = stack',
            '    result.append(value)',
            '    return result',
            '',
            'history = ["a"]',
            'newer = push_entry(history, "b")',
            'print(history)',
          ),
          "['a', 'b']",
          'result is another name for history, so the append changes the caller’s list too.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def push_entry(stack, value):',
            '    result = stack.copy()',
            '    result.append(value)',
            '    return result',
            '',
            'base = [4]',
            'first = push_entry(base, 4)',
            'second = push_entry(base, 9)',
            'print(first)',
            'print(second)',
          ),
          '[4, 4]\n[4, 9]',
          'Each call copies the unchanged base [4] before appending, so the two results are independent.',
        ),
        choose(
          'push_entry must return a new stack and leave its argument unchanged. Which first line inside it makes that possible?',
          [
            'result = stack.copy()',
            'result = stack',
            'result = []',
            'result = stack[-1]',
          ],
          0,
          'copy() keeps every existing entry in a separate list; plain assignment aliases, and [] loses the history.',
        ),
        choose(
          'What should push_entry([7, 7], 7) return?',
          ['[7]', '[7, 7]', '[7, 7, 7]', '[7, 7, 7, 7]'],
          2,
          'One push adds exactly one entry; repeated values are separate entries, not merged.',
        ),
      ],
    },
  ],
  'cp-stack-peek': [
    {
      title: 'Read the newest entry with stack[-1]',
      explanation: [
        'Peeking reads the top of the stack without removing it. With the newest entry at the right end of a list, that entry is stack[-1].',
        'Reading an index changes nothing, so peeking twice gives the same value and the stack keeps its length.',
      ],
      example: {
        code: lines(
          'stack = [4, 9, 2]',
          'top = stack[-1]',
          'print(top)',
          'print(stack)',
        ),
        output: '2\n[4, 9, 2]',
        explanation:
          'Index -1 names the rightmost entry, 2. The list is unchanged after the read.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'stack = ["x", "y", "z"]',
            'print(stack[-1])',
            'print(len(stack))',
          ),
          'z\n3',
          'stack[-1] is the newest entry z, and reading it leaves all three entries in place.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'stack = [5]',
            'stack.append(1)',
            'stack.append(8)',
            'print(stack[-1])',
            'print(stack[0])',
          ),
          '8\n5',
          '8 was pushed last, so it is at index -1; the oldest entry 5 stays at index 0.',
        ),
        choose(
          'Which expression reads a list stack’s newest entry without changing the list?',
          ['stack.pop()', 'stack[0]', 'stack[len(stack)]', 'stack[-1]'],
          3,
          'stack[-1] only reads the rightmost entry; pop() removes it, stack[0] is the oldest, and stack[len(stack)] is out of range.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'stack = [3, 6]',
            'first = stack[-1]',
            'second = stack[-1]',
            'print(first, second, len(stack))',
          ),
          '6 6 2',
          'Peeking does not remove anything, so both reads see 6 and the length stays 2.',
        ),
      ],
    },
    {
      title: 'Check for an empty stack before peeking',
      explanation: [
        'An empty stack has no top, and [][-1] raises IndexError. Test the stack first with if not stack: and return the contract’s empty result, such as None.',
        'Keep that empty result distinct from real entries. A stack whose top is 0 is not empty, so test the list itself rather than the value at its top.',
      ],
      example: {
        code: lines(
          'def peek_entry(stack):',
          '    if not stack:',
          '        return None',
          '    return stack[-1]',
          '',
          'print(peek_entry([0]))',
          'print(peek_entry([]))',
        ),
        output: '0\nNone',
        explanation:
          '[0] is nonempty, so its real top 0 is returned. Only the empty list reaches return None.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'def peek_entry(stack):',
            '    if not stack:',
            '        return None',
            '    return stack[-1]',
            '',
            'print(peek_entry([5, 0]))',
            'print(peek_entry([]))',
          ),
          '0\nNone',
          'The first stack is nonempty, so its top 0 is returned; only the empty list gives None.',
        ),
        choose(
          'What happens when a program evaluates [][-1]?',
          [
            'It returns None',
            'It returns 0',
            'It raises IndexError',
            'It returns []',
          ],
          2,
          'An empty list has no index -1, so Python raises IndexError; the emptiness check must come first.',
        ),
        choose(
          'Which test correctly decides that a list stack has no top?',
          [
            'if stack[-1] is None:',
            'if not stack:',
            'if stack[-1] == 0:',
            'if len(stack) == 1:',
          ],
          1,
          'An empty list is falsy. The other tests index an empty list or mistake a real entry for emptiness.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def peek_or(stack, default):',
            '    if not stack:',
            '        return default',
            '    return stack[-1]',
            '',
            'print(peek_or([], -1))',
            'print(peek_or([-1, 4], 0))',
          ),
          '-1\n4',
          'The empty stack returns the supplied default -1; the nonempty stack returns its top 4.',
        ),
      ],
    },
  ],
  'cp-stack-pop': [
    {
      title: 'Pop removes the newest entry',
      explanation: [
        'pop() removes the rightmost entry and returns it. Every earlier entry keeps its order, so the entry pushed last is the first to leave: last in, first out.',
        'Each pop removes exactly one entry, even when equal values sit beneath it.',
      ],
      example: {
        code: lines(
          'stack = ["open", "type", "save"]',
          'last = stack.pop()',
          'print(last)',
          'print(stack)',
        ),
        output: "save\n['open', 'type']",
        explanation:
          'save was pushed last, so pop() removes and returns it; open and type stay in order.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'stack = [1, 2, 3]',
            'stack.pop()',
            'stack.append(9)',
            'print(stack)',
          ),
          '[1, 2, 9]',
          'pop() removes 3 from the right end, then append puts 9 in that position.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'stack = ["a", "b", "c"]',
            'print(stack.pop())',
            'print(stack.pop())',
          ),
          'c\nb',
          'Each pop removes the current newest entry: first c, then b.',
        ),
        choose(
          'Values were pushed in the order 4, 7, 1. In what order do three pops return them?',
          ['4, 7, 1', '7, 1, 4', '1, 4, 7', '1, 7, 4'],
          3,
          'Last in, first out: 1 leaves first, then 7, then 4.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'stack = [6, 6, 2]',
            'stack.pop()',
            'stack.pop()',
            'print(stack)',
          ),
          '[6]',
          'The first pop removes 2 and the second removes one 6; the bottom 6 remains.',
        ),
      ],
    },
    {
      title: 'Undo only when an entry exists',
      explanation: [
        'Calling pop() on an empty list raises IndexError. When an undo with nothing to undo should be ignored, pop only inside if stack:.',
        'If the function returns a new remainder, copy first and pop the copy. The caller’s history then stays intact.',
      ],
      example: {
        code: lines(
          'def undo_one(stack):',
          '    result = stack.copy()',
          '    if result:',
          '        result.pop()',
          '    return result',
          '',
          'print(undo_one([3, 8]))',
          'print(undo_one([]))',
        ),
        output: '[3]\n[]',
        explanation:
          'The nonempty copy loses its top 8. The empty copy fails the check and is returned unchanged instead of raising.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'def undo_one(stack):',
            '    result = stack.copy()',
            '    if result:',
            '        result.pop()',
            '    return result',
            '',
            'steps = ["cut"]',
            'once = undo_one(steps)',
            'twice = undo_one(once)',
            'print(once, twice, steps)',
          ),
          "[] [] ['cut']",
          'The first undo empties a copy; the second sees an empty list and returns it. steps itself is never changed.',
        ),
        choose(
          'Which statement ignores an undo when there is nothing to remove?',
          [
            'if stack: stack.pop()',
            'if not stack: stack.pop()',
            'while stack: stack.pop()',
            'stack.pop() or None',
          ],
          0,
          'It pops only a nonempty stack. The second pops only an empty one, the loop removes every entry, and the last still pops an empty list.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'stack = [1, 2]',
            'removed = 0',
            'for _ in range(4):',
            '    if stack:',
            '        stack.pop()',
            '        removed += 1',
            'print(removed, stack)',
          ),
          '2 []',
          'Only two entries exist; the last two undos find an empty stack and are skipped.',
        ),
        choose(
          'undo_one([]) must ignore the undo. What should it return?',
          ['None', '[None]', '[]', '[0]'],
          2,
          'Ignoring the undo means the remainder is the same empty stack, not a placeholder value.',
        ),
      ],
    },
  ],
  'cp-stacks': [
    {
      title: 'Replay commands so undo removes the latest action',
      explanation: [
        'An undo history is a stack: each ordinary command is pushed, and UNDO pops the most recent action that is still active. After every command, the stack holds exactly the active actions in the order they were made.',
        'Trace a command list by keeping the stack on paper. An undo never reaches past the top, so older actions survive until everything newer has been undone.',
      ],
      example: {
        code: lines(
          replayLoop(
            '["red", "blue", "UNDO", "green", "UNDO", "UNDO", "black"]',
          ),
          'print(history)',
        ),
        output: "['black']",
        explanation:
          'blue is undone first, then green, then red. black is the only action still active.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            replayLoop('["a", "b", "c", "UNDO", "UNDO", "d"]'),
            'print(history)',
          ),
          "['a', 'd']",
          'The two undos remove c and then b, the newest active actions; d is pushed onto the remaining a.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            replayLoop('["x", "y", "UNDO", "z", "UNDO"]'),
            'print(history)',
            'print(len(history))',
          ),
          "['x']\n1",
          'Each undo removes the action pushed just before it, y and then z, leaving only x.',
        ),
        choose(
          'Active actions are ["draft", "review"], oldest first. If undo removed from the front like a queue, what would wrongly remain?',
          ['["draft"]', '[]', '["review"]', '["draft", "review"]'],
          2,
          'A front removal deletes draft, the oldest action, instead of the latest action review.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            replayLoop('["cut", "paste", "UNDO", "bold"]'),
            'print(len(history))',
            'print(history[-1])',
          ),
          '2\nbold',
          'The undo removes paste, so the active actions are cut and bold, with bold on top.',
        ),
      ],
    },
    {
      title: 'Ignore an undo when no action is active',
      explanation: [
        'An undo can arrive before any action or after every action has been undone. Decide the rule before coding; here such an undo is ignored, and the program counts how often that happens.',
        'The check if history: must come before pop(), because popping an empty list raises IndexError. Tests should include an undo as the very first command.',
      ],
      example: {
        code: lines(
          countedReplay('["UNDO", "plant", "UNDO", "UNDO", "water"]'),
          'print(history)',
          'print(ignored)',
        ),
        output: "['water']\n2",
        explanation:
          'The first undo and the third find an empty history and are ignored; plant is undone, and water is the only active action.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            countedReplay('["a", "UNDO", "UNDO", "b", "UNDO", "UNDO"]'),
            'print(history, ignored)',
          ),
          '[] 2',
          'a and b are each undone once; the undo right after each of those finds nothing, so two are ignored.',
        ),
        choose(
          'The if history: check is deleted and the first command is UNDO. What happens?',
          [
            'pop() returns None and the loop continues',
            'pop() raises IndexError on the empty list',
            'The next push is cancelled instead',
            'The UNDO is skipped automatically',
          ],
          1,
          'Popping an empty list is an error in Python; nothing skips it unless the program checks first.',
        ),
        choose(
          'An undo with nothing active must be ignored. Which test input exposes a program that forgot that rule?',
          [
            '["a", "UNDO"]',
            '["a", "b"]',
            '["UNDO", "a"]',
            '["a", "b", "UNDO"]',
          ],
          2,
          'Only that input undoes while the history is empty; the others always have an action to remove.',
        ),
        typeOutput(
          'This history must never lose its base entry. What is printed?',
          lines(
            'history = ["base"]',
            'for command in ["UNDO", "UNDO", "top"]:',
            '    if command == "UNDO":',
            '        if len(history) > 1:',
            '            history.pop()',
            '    else:',
            '        history.append(command)',
            'print(history)',
          ),
          "['base', 'top']",
          'The check refuses to pop the last remaining entry, so both undos are ignored and top is pushed onto base.',
        ),
      ],
    },
    {
      title: 'Bound the replay at one stack operation per command',
      explanation: [
        'Each command causes at most one push or one pop, and both work at the right end of the list in amortized O(1) time. Replaying n commands therefore takes O(n) time.',
        'The history can hold up to n entries when no undo occurs, so it needs O(n) space. Removing from the front with pop(0) would instead shift every remaining entry and undo the wrong action.',
      ],
      example: {
        code: lines(
          operationReplay('["a", "b", "UNDO", "c", "UNDO", "UNDO", "UNDO"]'),
          'print(len(commands), operations)',
        ),
        output: '7 6',
        explanation:
          'Six commands each did one end operation and the last undo found nothing, so the work never exceeds the number of commands.',
      },
      questions: [
        choose(
          'A replay processes n commands, each a push or a checked undo. What is its total running time?',
          ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
          2,
          'Every command does constant work at the list’s right end, so the total is linear.',
        ),
        choose(
          'Why should undo call history.pop() rather than history.pop(0) on a list kept oldest first?',
          [
            'pop(0) removes the oldest action and shifts the rest',
            'pop(0) raises an error on every list',
            'pop() sorts the remaining history first',
            'pop(0) is faster on long histories',
          ],
          0,
          'Index 0 holds the oldest action, and removing it moves every later entry; pop() removes the newest in amortized O(1).',
        ),
        choose(
          'At most how many entries can the history hold after n commands?',
          ['1', 'n / 2', 'n²', 'n'],
          3,
          'If no command is an undo, every command adds one entry, so the stack needs O(n) space.',
        ),
        predictOutput(
          'How many stack operations does this replay perform?',
          lines(
            operationReplay('["x", "UNDO", "UNDO", "y", "z", "UNDO"]'),
            'print(operations, len(history))',
          ),
          ['6 1', '5 1', '5 2', '3 1'],
          1,
          'Three pushes and two successful pops make five operations; the ignored undo costs no stack work, leaving y.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------ monotonic stack
  'cp-pending-indices': [
    {
      title: 'Store indices, not values, for answers still owed',
      explanation: [
        'When a scan must later write an answer for an earlier position, the pending stack stores that position’s index. values[index] recovers the measurement, and answer[index] is where the result goes.',
        'A stack of bare values cannot tell where an answer belongs, especially when two positions hold the same value.',
      ],
      example: {
        code: lines(
          'values = [6, 2, 6, 1]',
          'pending = [0, 2, 3]',
          'print([values[index] for index in pending])',
        ),
        output: '[6, 6, 1]',
        explanation:
          'Indices 0 and 2 both hold 6, yet they remain separate pending positions with separate answer slots.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'values = [4, 9, 2]',
            'pending = [0, 2]',
            'print([values[index] for index in pending])',
          ),
          '[4, 2]',
          'Each stored index is looked up in values: index 0 gives 4 and index 2 gives 2.',
        ),
        choose(
          'values = [5, 5]. Can indices 0 and 1 both be pending at once?',
          [
            'No, equal values share one entry',
            'Yes, each has its own answer slot',
            'Only index 1, the newer one',
            'Only index 0, the older one',
          ],
          1,
          'Pending entries are positions; equal measurements at different positions still need separate answers.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'values = [7, 3, 7]',
            'answer = [None, None, None]',
            'pending = [0, 1]',
            'answer[pending.pop()] = 10',
            'print(answer)',
          ),
          '[None, 10, None]',
          'pop() removes index 1, the newest pending position, so the answer is written into slot 1.',
        ),
        choose(
          'A pending stack stores values instead of indices. What can the scan no longer do?',
          [
            'Write each answer into its original slot',
            'Compare pending values with the current value',
            'Push a new entry onto the stack',
            'Pop the newest pending entry',
          ],
          0,
          'Values still compare, push and pop normally, but without the index there is no way to know which answer slot to fill.',
        ),
      ],
    },
    {
      title: 'Read pending values in stack order',
      explanation: [
        '[values[index] for index in pending] lists the pending measurements in the same order as the stack, from bottom to top. Repeated values stay in the result, one per index.',
        'Because a left-to-right scan pushes each index when it reaches it, and pops only from the top, the indices on the stack increase from bottom to top. The top is always the most recently scanned pending position.',
      ],
      example: {
        code: lines(
          'def pending_values(values, pending):',
          '    return [values[index] for index in pending]',
          '',
          'print(pending_values([8, 1, 5, 1], [0, 2, 3]))',
          'print(pending_values([8, 1, 5, 1], []))',
        ),
        output: '[8, 5, 1]\n[]',
        explanation:
          'The comprehension visits indices 0, 2 and 3 in stack order and reads their values. An empty stack has no pending values.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'def pending_values(values, pending):',
            '    return [values[index] for index in pending]',
            '',
            'print(pending_values([3, 9, 4, 9], [1, 3]))',
          ),
          '[9, 9]',
          'Both pending positions hold 9; the comprehension keeps one value per index, so 9 appears twice.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'values = [2, 6, 1]',
            'pending = []',
            'for index in range(len(values)):',
            '    pending.append(index)',
            'print(pending[-1], values[pending[-1]])',
          ),
          '2 1',
          'The scan pushes indices 0, 1, 2 in order, so the top is index 2, whose value is 1.',
        ),
        choose(
          'A left-to-right scan pushes each index when it reaches it and pops only from the top. How are the indices on the stack arranged?',
          [
            'Increasing from bottom to top',
            'Decreasing from bottom to top',
            'In order of their values',
            'In no particular order',
          ],
          0,
          'Later indices are pushed later and removals happen only at the top, so the remaining indices stay increasing.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'def pending_values(values, pending):',
            '    return [values[index] for index in pending]',
            '',
            'print(pending_values(["a", "b", "c"], [0, 2]))',
          ),
          "['a', 'c']",
          'Index 0 reads "a" and index 2 reads "c"; index 1 is not pending, so "b" is skipped.',
        ),
      ],
    },
  ],
  'cp-strict-stack-pop': [
    {
      title: 'Pop while the top is strictly smaller',
      explanation: [
        'Pending values sit on the stack in nonincreasing order from bottom to top. A new value current resolves entries from the top: while the stack is nonempty and values[pending[-1]] < current, pop.',
        'The loop stops at the first top that is at least current. Every entry below it is at least as large, so none of them could be resolved either.',
      ],
      example: {
        code: lines(
          'values = [9, 6, 3, 1]',
          'pending = [0, 1, 2, 3]',
          'current = 5',
          'popped = []',
          'while pending and values[pending[-1]] < current:',
          '    popped.append(pending.pop())',
          'print(popped)',
          'print(pending)',
        ),
        output: '[3, 2]\n[0, 1]',
        explanation:
          'Values 1 and 3 are below 5 and leave from the top. The top value 6 is not smaller, so the loop stops before it.',
      },
      questions: [
        predictOutput(
          'Which values are popped, in order?',
          lines(
            'values = [9, 6, 3]',
            'pending = [0, 1, 2]',
            'popped = []',
            'while pending and values[pending[-1]] < 7:',
            '    popped.append(values[pending.pop()])',
            'print(popped)',
          ),
          ['[9, 6]', '[3]', '[6, 3]', '[3, 6]'],
          3,
          'The top 3 leaves first, then 6; 9 is not below 7, so popping stops.',
        ),
        choose(
          'The stack’s top value is 8 and current is 5. What does the loop do?',
          [
            'Stops without popping',
            'Pops 8 and keeps checking',
            'Pops every entry below 8',
            'Pushes 5 under 8',
          ],
          0,
          'The top is not smaller than 5, and the stack is nonincreasing, so nothing below can be smaller.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'values = [4, 2, 2]',
            'pending = [0, 1, 2]',
            'while pending and values[pending[-1]] < 3:',
            '    pending.pop()',
            'print(pending)',
          ),
          '[0]',
          'Both 2s are below 3 and are popped; 4 is not, so only index 0 remains.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'values = [5, 2]',
            'pending = [0, 1]',
            'count = 0',
            'while pending and values[pending[-1]] < 10:',
            '    pending.pop()',
            '    count += 1',
            'print(count, pending)',
          ),
          '2 []',
          'Both values are below 10, so both entries pop; the pending check then stops the loop on the empty stack.',
        ),
      ],
    },
    {
      title: 'Leave equal values pending',
      explanation: [
        'For a strictly greater answer, an equal value is not an answer. The popping test must be old < current; using <= would resolve equal entries with a value that is not larger.',
        'The emptiness check must come first in the condition: pending and values[pending[-1]] < current. Because and stops at a false left side, an empty stack is never indexed.',
      ],
      example: {
        code: lines(
          'values = [8, 4, 4, 1]',
          'pending = [0, 1, 2, 3]',
          'while pending and values[pending[-1]] < 4:',
          '    pending.pop()',
          'print(pending)',
        ),
        output: '[0, 1, 2]',
        explanation:
          'Only the 1 is strictly below 4. Both 4s stay pending because 4 < 4 is false.',
      },
      questions: [
        typeOutput(
          'This loop uses <= instead of <. What does it print?',
          lines(
            'values = [8, 4, 4, 1]',
            'pending = [0, 1, 2, 3]',
            'while pending and values[pending[-1]] <= 4:',
            '    pending.pop()',
            'print(pending)',
          ),
          '[0]',
          'With <=, both equal 4s also pop, wrongly treating 4 as greater than 4.',
        ),
        choose(
          'Each answer must be the first strictly greater value. Which loop condition is correct?',
          [
            'while values[pending[-1]] < current and pending:',
            'while pending and values[pending[-1]] <= current:',
            'while pending and values[pending[-1]] > current:',
            'while pending and values[pending[-1]] < current:',
          ],
          3,
          'It checks emptiness before indexing and pops only strictly smaller values.',
        ),
        choose(
          'Why must pending appear before values[pending[-1]] in the condition?',
          [
            'and skips the comparison when the stack is empty',
            'Python evaluates and from right to left',
            'An empty list compares as smaller',
            'It makes the loop run at least once',
          ],
          0,
          'and stops at a false left operand, so an empty stack is never indexed.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'values = [3, 3, 3]',
            'pending = [0, 1]',
            'while pending and values[pending[-1]] < values[2]:',
            '    pending.pop()',
            'pending.append(2)',
            'print(pending)',
          ),
          '[0, 1, 2]',
          'No pending 3 is strictly below the new 3, so nothing pops and index 2 joins the stack.',
        ),
      ],
    },
  ],
  'cp-stack-operation-budget': [
    {
      title: 'Charge each pop to the index it removes',
      explanation: [
        'A while loop inside a for loop looks quadratic, but in a one-pass monotonic scan every index is pushed once. Once popped, it is never pushed again, so it can be popped at most once.',
        'Count the work by index rather than by loop iteration: n pushes plus p pops, where p ≤ n. The total is at most 2n.',
      ],
      example: {
        code: lines(
          budgetScan('[3, 1, 2, 5, 4]'),
          'print(len(values), pops, len(values) + pops)',
        ),
        output: '5 3 8',
        explanation:
          'Five indices are pushed once each, and three of them are later popped once each: eight stack operations, below 2 × 5.',
      },
      questions: [
        choose(
          'How many times can a single index be popped during one left-to-right monotonic scan?',
          [
            'At most once',
            'Once per later value',
            'Exactly n times',
            'Once per loop iteration',
          ],
          0,
          'An index is pushed only when the scan reaches it, so after one pop it is gone for good.',
        ),
        typeNumber(
          'A scan over 6 values performs 4 pops in total. How many push and pop operations happened altogether?',
          10,
          'Each of the 6 indices is pushed once, and 4 pops are added: 6 + 4 = 10.',
        ),
        predictOutput(
          'How many pops does this scan make?',
          lines(budgetScan('[1, 2, 3, 4]'), 'print(len(values), pops)'),
          ['4 6', '4 0', '4 3', '4 4'],
          2,
          'Each new value pops only the single previous index, so there are three pops, not 1 + 2 + 3.',
        ),
        choose(
          'Why is the nested while loop not O(n²) in total?',
          [
            'The while loop runs at most once per value',
            'The values must already be sorted',
            'Python stops nested loops after n steps',
            'Total pops cannot exceed total pushes, which is n',
          ],
          3,
          'One value may pop many entries, but each entry was pushed once, so all pops together are at most n.',
        ),
      ],
    },
    {
      title: 'Relate pushes, pops and what remains',
      explanation: [
        'Every pushed index is either popped later or still pending at the end. With n pushes and p pops, exactly n − p indices remain on the stack.',
        'Those remaining indices never met a value that resolved them. Checking pushes − pops against the final stack length is a quick way to verify a trace.',
      ],
      example: {
        code: lines(
          budgetScan('[6, 1, 4, 4, 2]'),
          'print(len(values), pops, len(pending))',
        ),
        output: '5 1 4',
        explanation:
          'Only the 1 is ever resolved. Five pushes minus one pop leaves four pending indices, including both 4s.',
      },
      questions: [
        typeNumber(
          'A scan pushes 8 indices and pops 5 of them. How many indices are still pending at the end?',
          3,
          'Every push not matched by a pop remains: 8 − 5 = 3.',
        ),
        typeOutput(
          'What does this program print?',
          lines(budgetScan('[2, 2, 2]'), 'print(pops, len(pending))'),
          '0 3',
          'Equal values never pop each other under <, so all three indices stay pending.',
        ),
        typeOutput(
          'What is printed?',
          lines(budgetScan('[9, 7, 8, 1, 10]'), 'print(pops, len(pending))'),
          '4 1',
          '8 resolves 7, and 10 resolves 1, 8 and 9; four pops leave only index 4 pending.',
        ),
        typeNumber(
          'At the end of a scan the stack holds 2 indices, and 7 pops happened. How many values were scanned?',
          9,
          'Each scanned index is pushed once, so n = pops + remaining = 7 + 2 = 9.',
        ),
      ],
    },
  ],
  'cp-monotonic-stack': [
    {
      title: 'Find each first strictly greater value to the right',
      explanation: [
        'Scan left to right, keeping indices whose answer is unknown. When the current value is strictly greater than the value at the top index, it is that index’s answer: pop the index and write the value into its slot. Then push the current index.',
        'An index popped by current gets current as its first greater value because every value between them was not greater; otherwise that value would already have popped it.',
      ],
      example: {
        code: lines(nextGreater('[2, 7, 3, 1, 5]'), 'print(answer)'),
        output: '[7, None, 5, 5, None]',
        explanation:
          '7 resolves index 0 at once. 5 resolves the 1 and then the 3 but not 7, so 7 and the final 5 have no greater value to their right.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(nextGreater('[3, 3, 5]'), 'print(answer)'),
          '[5, 5, None]',
          'The equal 3 does not resolve the first 3; 5 later resolves both.',
        ),
        typeOutput(
          'What is printed?',
          lines(nextGreater('[1, 4, 2, 6]'), 'print(answer)'),
          '[4, 6, 6, None]',
          '4 answers index 0 immediately; 6 later answers both 2 and 4, which were waiting on the stack.',
        ),
        choose(
          'For [6, 1, 2, 9], why is 9 the answer for index 0 even though 1 and 2 come first?',
          [
            '9 is the largest value in the list',
            'Neither 1 nor 2 is greater than 6',
            'Index 0 is always popped last',
            'The stack is sorted before the scan',
          ],
          1,
          'The answer is the first later value above 6; 1 and 2 fail that test, so index 0 waits until 9.',
        ),
        predictOutput(
          'Which indices are still pending after the scan?',
          lines(nextGreater('[5, 3, 4, 1]'), 'print(pending)'),
          ['[3]', '[0, 2, 3]', '[0, 1, 2, 3]', '[0, 3]'],
          1,
          'Only index 1 is resolved (by 4). Indices 0, 2 and 3 never see a greater value later.',
        ),
      ],
    },
    {
      title: 'Keep the pending values nonincreasing',
      explanation: [
        'After each step, the values at the pending indices are nonincreasing from bottom to top. A new value removes every smaller top before it is pushed, so it never sits above something smaller than itself.',
        'Indices still on the stack after the scan have no strictly greater value to their right, so their answer stays None. Equal values remain pending together.',
      ],
      example: {
        code: lines(
          'values = [8, 3, 5, 5, 2]',
          'pending = []',
          'for index in range(len(values)):',
          '    while pending and values[pending[-1]] < values[index]:',
          '        pending.pop()',
          '    pending.append(index)',
          '    print([values[i] for i in pending])',
        ),
        output: '[8]\n[8, 3]\n[8, 5]\n[8, 5, 5]\n[8, 5, 5, 2]',
        explanation:
          'Each printed stack is nonincreasing. The first 5 removes the smaller 3, but the second 5 stays above the first because it is not strictly greater.',
      },
      questions: [
        choose(
          'Pending values are [9, 6, 6, 2] from bottom to top, and 6 arrives. What are the pending values after it is pushed?',
          ['[9, 6, 6, 6]', '[9, 6]', '[9, 6, 6, 2, 6]', '[6]'],
          0,
          '6 removes the smaller 2, stops at the equal 6, and then joins the stack.',
        ),
        predictOutput(
          'Which values are still pending at the end?',
          lines(
            'values = [1, 5, 2, 4, 3]',
            'pending = []',
            'for index in range(len(values)):',
            '    while pending and values[pending[-1]] < values[index]:',
            '        pending.pop()',
            '    pending.append(index)',
            'print([values[i] for i in pending])',
          ),
          ['[1, 5, 2, 4, 3]', '[5, 4, 3]', '[3]', '[5, 3]'],
          1,
          'Every value that later met a larger one was popped; 5, 4 and 3 never did.',
        ),
        choose(
          'Which pending stack, listed bottom to top by value, can never occur in this scan?',
          ['[7, 7, 1]', '[9, 4, 2]', '[3, 8]', '[5]'],
          2,
          '8 would have popped the smaller 3 before being pushed, so a smaller value never sits below a larger one.',
        ),
        typeOutput(
          'What does this program print?',
          lines(nextGreater('[2, 2, 2]'), 'print(answer)'),
          '[None, None, None]',
          'No value is strictly greater than an equal 2, so every index stays pending and keeps None.',
        ),
      ],
    },
    {
      title: 'Count the scan as linear work',
      explanation: [
        'Each index is pushed once and popped at most once, so the whole scan does at most 2n stack operations: O(n) time. The answer list and the stack use O(n) space.',
        'Checking every later value for every index would take O(n²) comparisons. The stack avoids that because a resolved index is never examined again.',
      ],
      example: {
        code: lines(
          'values = [5, 4, 3, 2, 1, 6]',
          'pending = []',
          'operations = 0',
          'for index in range(len(values)):',
          '    while pending and values[pending[-1]] < values[index]:',
          '        pending.pop()',
          '        operations += 1',
          '    pending.append(index)',
          '    operations += 1',
          'print(operations)',
        ),
        output: '11',
        explanation:
          'Six pushes and five pops make 11 operations, within 2 × 6, even though the final 6 alone pops five entries.',
      },
      questions: [
        choose(
          'What is the running time of the monotonic-stack scan over n values?',
          ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
          2,
          'At most n pushes and n pops happen in total, so the scan is linear.',
        ),
        choose(
          'The last value of a 1,000-value list pops 999 entries in one step. Why is the scan still linear overall?',
          [
            'Those entries were each pushed once and leave only once',
            'One step can never pop more than two entries',
            'Python runs the while loop in constant time',
            'The list must have been sorted beforehand',
          ],
          0,
          'The 999 pops are paid for by 999 earlier pushes; no index can be popped again later.',
        ),
        choose(
          'A brute-force solution checks every later value for every index. How many comparisons can it make on n values?',
          ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
          3,
          'Index i may scan up to n − i − 1 later values, which sums to about n²/2.',
        ),
        predictOutput(
          'How many stack operations does this scan perform?',
          lines(
            'values = [1, 2, 3]',
            'pending = []',
            'operations = 0',
            'for index in range(len(values)):',
            '    while pending and values[pending[-1]] < values[index]:',
            '        pending.pop()',
            '        operations += 1',
            '    pending.append(index)',
            '    operations += 1',
            'print(operations)',
          ),
          ['3', '5', '6', '9'],
          1,
          'Each new value pops the single previous index: three pushes and two pops make five operations.',
        ),
      ],
    },
  ],
  // ----------------------------------------------------------------- heaps
  'cp-heap-invariant': [
    {
      title: 'Locate a heap node’s parent and children',
      explanation: [
        'A minimum heap is stored in an ordinary list. The entry at index i has children at 2*i+1 and 2*i+2 when those indices exist, and every index c > 0 has its parent at (c-1)//2.',
        'Index 0 is the root. No links are stored: positions alone determine the tree, so a child index past the end of the list means that child does not exist.',
      ],
      example: {
        code: lines(
          'heap = [1, 4, 2, 9, 5]',
          'i = 1',
          'print(heap[2 * i + 1], heap[2 * i + 2])',
          'print(heap[(4 - 1) // 2])',
        ),
        output: '9 5\n4',
        explanation:
          'Index 1 has children at 3 and 4 (values 9 and 5). Index 4’s parent is (4 − 1) // 2 = 1, which holds 4.',
      },
      questions: [
        typeNumber(
          'What is the parent index of index 5?',
          2,
          '(5 − 1) // 2 = 2.',
        ),
        choose(
          'In a 6-entry heap, which indices are the children of index 2?',
          ['3 and 4', '5 only', '4 and 5', '5 and 6'],
          1,
          'The formulas give 5 and 6, but index 6 does not exist in a 6-entry list, so only 5 is a child.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'heap = [2, 6, 3, 8, 7, 4]',
            'child = 5',
            'print(heap[(child - 1) // 2])',
          ),
          '3',
          'Index 5’s parent is (5 − 1) // 2 = 2, which holds 3.',
        ),
        predictOutput(
          'Which indices have no children?',
          lines(
            'heap = [1, 3, 5, 4, 8]',
            'for i in range(len(heap)):',
            '    if 2 * i + 1 >= len(heap):',
            '        print(i)',
          ),
          ['3\n4', '4', '1\n2\n3\n4', '2\n3\n4'],
          3,
          'An index has no children when its left child 2*i+1 is past the end; that holds for 2, 3 and 4.',
        ),
      ],
    },
    {
      title: 'Check only parent–child pairs',
      explanation: [
        'A list is a minimum heap when every parent is no larger than each of its existing children. Checking each index c from 1 upward against its parent (c-1)//2 covers every pair once.',
        'The rule is local. Siblings can appear in any order and the list need not be sorted, yet the smallest value is always at index 0.',
      ],
      example: {
        code: lines(
          isMinHeap,
          'print(is_min_heap([2, 9, 3, 10]))',
          'print(is_min_heap([2, 9, 3, 8, 1]))',
        ),
        output: 'True\nFalse',
        explanation:
          'The first list is not sorted, but every child is at least its parent. In the second, 8 sits below its parent 9.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            isMinHeap,
            'print(is_min_heap([1, 5, 2]))',
            'print(is_min_heap([3, 1, 4]))',
          ),
          'True\nFalse',
          '[1, 5, 2] keeps both children at least 1 even though it is unsorted; in [3, 1, 4] the child 1 is below its parent 3.',
        ),
        choose(
          'Which list is a valid minimum heap?',
          ['[4, 2, 6]', '[1, 7, 3, 2]', '[0, 5, 1, 6, 9]', '[3, 3, 1]'],
          2,
          'Every child of 0 and of 5 is at least its parent; each other list has a child smaller than its parent.',
        ),
        choose(
          'A heap check compares every element with the next one and rejects any decrease. What goes wrong?',
          [
            'It accepts heaps with a small leaf',
            'It rejects valid heaps whose siblings are out of order',
            'It never looks at the root',
            'It needs a sorted copy first',
          ],
          1,
          'A heap such as [1, 5, 2] decreases from 5 to 2 between siblings, yet satisfies every parent–child rule.',
        ),
        typeOutput(
          'What is printed?',
          lines(isMinHeap, 'print(is_min_heap([7]))', 'print(is_min_heap([]))'),
          'True\nTrue',
          'With fewer than two entries the loop has no child to check, so both lists are valid heaps.',
        ),
      ],
    },
  ],
  'cp-heap-build': [
    {
      title: 'heapify rearranges the list in place',
      explanation: [
        'heapq.heapify(heap) reorders an existing list into a minimum heap. It changes that list in place and returns None, so the result must be read from the list itself.',
        'After heapify, heap[0] is a smallest value, but the rest of the list is usually not sorted. Building the heap this way takes O(n) time.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [8, 3, 7, 2]',
          'result = heapq.heapify(heap)',
          'print(result)',
          'print(heap[0])',
        ),
        output: 'None\n2',
        explanation:
          'heapify returns None; the list itself now has its minimum 2 at index 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'values = [5, 1, 4]',
            'print(heapq.heapify(values))',
          ),
          'None',
          'heapify works in place and returns None, so printing its return value prints None.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = [9, 4, 6, 1]',
            'heapq.heapify(heap)',
            'print(heap[0], len(heap))',
          ),
          '1 4',
          'heapify moves the minimum 1 to index 0 and keeps all four entries.',
        ),
        choose(
          'After heapq.heapify(heap) on a list of n numbers, what is guaranteed?',
          [
            'heap[0] is a smallest value',
            'The whole list is sorted ascending',
            'heap[-1] is the largest value',
            'Duplicate values are removed',
          ],
          0,
          'heapify establishes only the heap rule, which puts a minimum at the root.',
        ),
        choose(
          'What does heapify cost on an existing list of n values?',
          ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
          3,
          'Building a heap in place takes linear time, cheaper than sorting the list.',
        ),
      ],
    },
    {
      title: 'Heapify a copy and handle the empty list',
      explanation: [
        'Because heapify reorders its argument, call it on values.copy() when the caller still needs the original order.',
        'An empty list has no root, and heap[0] would raise IndexError. Return the contract’s empty result, such as None, before reading the root.',
      ],
      example: {
        code: lines(
          'import heapq',
          '',
          'def heap_minimum(values):',
          '    if not values:',
          '        return None',
          '    heap = values.copy()',
          '    heapq.heapify(heap)',
          '    return heap[0]',
          '',
          'data = [6, 2, 9]',
          'print(heap_minimum(data))',
          'print(data)',
          'print(heap_minimum([]))',
        ),
        output: '2\n[6, 2, 9]\nNone',
        explanation:
          'The copy is reordered, so data keeps its order. The empty list returns None without reading an index.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'data = [7, 5, 3]',
            'heap = data',
            'heapq.heapify(heap)',
            'print(data[0])',
          ),
          '3',
          'heap and data name the same list, so heapify reorders data too and its first entry becomes 3.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'data = [7, 5, 3]',
            'heap = data.copy()',
            'heapq.heapify(heap)',
            'print(data[0], heap[0])',
          ),
          '7 3',
          'Only the copy is reordered, so data still starts with 7 while the heap’s root is 3.',
        ),
        choose(
          'A function must find the minimum of values without changing values. Which first steps are correct?',
          [
            'heap = values; heapq.heapify(heap)',
            'heap = heapq.heapify(values)',
            'heapq.heapify(values); heap = values.copy()',
            'heap = values.copy(); heapq.heapify(heap)',
          ],
          3,
          'Only copying before heapify leaves values untouched; the others reorder values or keep heapify’s None.',
        ),
        choose(
          'heap_minimum([]) must return None. What goes wrong if it skips the emptiness check?',
          [
            'heap[0] raises IndexError',
            'heapify raises an error',
            'It returns 0',
            'The copy raises an error',
          ],
          0,
          'heapify and copy both accept an empty list, but reading index 0 of an empty list raises IndexError.',
        ),
      ],
    },
  ],
  'cp-heap-updates': [
    {
      title: 'heappush keeps the heap rule',
      explanation: [
        'heapq.heappush(heap, value) adds one value and moves it up past larger parents, so the list remains a minimum heap. If the new value is the smallest, it becomes heap[0].',
        'heap.append(value) skips that repair and can leave a small value below a larger parent.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [3, 5, 4]',
          'heapq.heappush(heap, 1)',
          'print(heap[0])',
          'print(len(heap))',
        ),
        output: '1\n4',
        explanation:
          '1 is smaller than every existing value, so heappush moves it up to the root.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [2, 6, 8]',
            'heapq.heappush(heap, 7)',
            'print(heap[0])',
          ),
          '2',
          '7 is not smaller than the minimum 2, so 2 stays at the root.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'for value in [5, 9, 1, 3]:',
            '    heapq.heappush(heap, value)',
            'print(heap[0])',
          ),
          '1',
          'Each push keeps the heap rule, so the overall minimum 1 ends at the root.',
        ),
        choose(
          'Why use heapq.heappush instead of heap.append for a heap?',
          [
            'append raises an error on heaps',
            'heappush also sorts the entire list',
            'append removes the current minimum',
            'heappush restores the parent–child rule after adding',
          ],
          3,
          'heappush moves the new value up until its parent is no larger; append leaves it wherever it lands.',
        ),
        typeOutput(
          'What does this program print?',
          lines('heap = [2, 4, 3]', 'heap.append(1)', 'print(heap[0])'),
          '2',
          'append only adds 1 at the end; nothing moves it to the root, so heap[0] is still 2 and the heap rule is broken.',
        ),
      ],
    },
    {
      title: 'heappop removes the current minimum',
      explanation: [
        'heapq.heappop(heap) removes and returns heap[0], then repairs the heap so the next smallest value moves to the root.',
        'A value pushed a moment ago can leave first if it is the smallest. Popping an empty heap raises IndexError, so push first or check the length.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [8, 2, 5]',
          'heapq.heapify(heap)',
          'heapq.heappush(heap, 1)',
          'print(heapq.heappop(heap))',
          'print(heapq.heappop(heap))',
        ),
        output: '1\n2',
        explanation:
          'The pushed 1 is the minimum and leaves first; the repaired heap then gives up 2.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [4, 7, 9]',
            'heapq.heapify(heap)',
            'heapq.heappush(heap, 6)',
            'print(heapq.heappop(heap))',
            'print(heapq.heappop(heap))',
          ),
          '4\n6',
          'Pops return the two smallest values present, 4 and then the newly pushed 6.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'heapq.heappush(heap, 3)',
            'print(heapq.heappop(heap), len(heap))',
          ),
          '3 0',
          'The push supplies an entry, so the pop is safe; it returns 3 and leaves the heap empty.',
        ),
        typeNumber(
          'A heap holds 2 and 8. After pushing 1, what does the next heappop return?',
          1,
          'heappop always returns the current minimum, and the newly pushed 1 is smaller than 2.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [6, 1, 6, 3]',
            'heapq.heapify(heap)',
            'order = []',
            'while heap:',
            '    order.append(heapq.heappop(heap))',
            'print(order)',
          ),
          '[1, 3, 6, 6]',
          'Each pop takes the current minimum, so the values come out ascending and both 6s are kept.',
        ),
      ],
    },
  ],
  'cp-heaps': [
    {
      title: 'Take the cheapest item while work keeps arriving',
      explanation: [
        'A heap lets a program repeatedly take the cheapest available item even as new items arrive. Push each arrival with heappush and take the cheapest with heappop; nothing is ever fully sorted.',
        'To trace a heap program, track which values are in the heap rather than the exact list layout: each pop returns the smallest value currently present.',
      ],
      example: {
        code: lines(
          'import heapq',
          'jobs = [8, 2, 5]',
          'heapq.heapify(jobs)',
          'done = [heapq.heappop(jobs)]',
          'heapq.heappush(jobs, 1)',
          'heapq.heappush(jobs, 7)',
          'done.append(heapq.heappop(jobs))',
          'done.append(heapq.heappop(jobs))',
          'print(done)',
          'print(jobs[0])',
        ),
        output: '[2, 1, 5]\n7',
        explanation:
          '2 leaves first. After 1 and 7 arrive, the heap holds 8, 5, 1 and 7, so 1 and then 5 leave, and 7 becomes the minimum.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [4, 9]',
            'heapq.heapify(heap)',
            'taken = []',
            'for arrival in [6, 1, 8]:',
            '    heapq.heappush(heap, arrival)',
            '    taken.append(heapq.heappop(heap))',
            'print(taken)',
          ),
          '[4, 1, 6]',
          'After 6 arrives the minimum is 4; after 1 arrives it is 1; after 8 arrives the heap holds 9, 6, 8, so 6 leaves.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'for value in [5, 3, 9]:',
            '    heapq.heappush(heap, value)',
            'heapq.heappop(heap)',
            'heapq.heappush(heap, 4)',
            'print(heapq.heappop(heap), heap[0])',
          ),
          '4 5',
          '3 is removed first. Then 4 joins 5 and 9, so 4 is popped and 5 becomes the root.',
        ),
        choose(
          'A program must repeatedly remove the cheapest pending job while new jobs keep arriving. Why is a heap better than sorting after every arrival?',
          [
            'Each push and pop costs O(log n) instead of a full re-sort',
            'A heap keeps every job in ascending order',
            'Sorting cannot handle duplicate costs',
            'A heap removes the newest job first',
          ],
          0,
          'Re-sorting costs at least O(n) per change, even when only one item is new, while a heap update costs only O(log n).',
        ),
        typeNumber(
          'After several pushes and pops, heap is [2, 7, 3, 9]. Which value will the next heappop return?',
          2,
          'The root heap[0] is always a minimum, and heappop returns it.',
        ),
      ],
    },
    {
      title: 'Break ties with a tuple priority',
      explanation: [
        'Heap entries can be tuples such as (cost, name). Tuples compare by their first field and look at the next field only when the first fields tie, so the cheapest cost leaves first and ties fall to the second field.',
        'Every compared field must be orderable. If two entries tie on cost and their payloads cannot be compared, such as two dictionaries, heapq raises TypeError. Put a comparable tie-breaker, such as an arrival number, before the payload.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = []',
          'heapq.heappush(heap, (3, "paint"))',
          'heapq.heappush(heap, (1, "sand"))',
          'heapq.heappush(heap, (3, "dust"))',
          'while heap:',
          '    cost, task = heapq.heappop(heap)',
          '    print(cost, task)',
        ),
        output: '1 sand\n3 dust\n3 paint',
        explanation:
          'Cost 1 leaves first. The two cost-3 tasks tie, so their names decide: "dust" comes before "paint".',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = []',
            'for entry in [(2, "b"), (2, "a"), (1, "z")]:',
            '    heapq.heappush(heap, entry)',
            'names = []',
            'while heap:',
            '    names.append(heapq.heappop(heap)[1])',
            'print(names)',
          ),
          "['z', 'a', 'b']",
          'Cost 1 comes first; the cost-2 tie is broken by name, and "a" is smaller than "b".',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'arrival = 0',
            'for cost, name in [(5, "x"), (2, "y"), (5, "w")]:',
            '    heapq.heappush(heap, (cost, arrival, name))',
            '    arrival += 1',
            'names = []',
            'while heap:',
            '    names.append(heapq.heappop(heap)[2])',
            'print(names)',
          ),
          "['y', 'x', 'w']",
          'Arrival numbers are unique, so the equal costs leave in arrival order and the names are never compared.',
        ),
        choose(
          'A heap holds (4, {"id": 1}) and (4, {"id": 2}). What happens when Python must order them?',
          [
            'The first one pushed wins',
            'The smaller id is chosen',
            'They are merged into one entry',
            'TypeError: dictionaries cannot be compared',
          ],
          3,
          'The costs tie, so Python compares the dictionaries next, and dictionaries do not support <.',
        ),
        choose(
          'Jobs must leave by lowest cost and, among equal costs, by earliest arrival. Which heap entry achieves that?',
          [
            '(arrival, cost, job)',
            '(job, cost, arrival)',
            '(cost, arrival, job)',
            '(cost, job, arrival)',
          ],
          2,
          'Cost is compared first, and the unique arrival number settles ties before the job is ever compared.',
        ),
      ],
    },
    {
      title: 'Account for heap costs and empty pops',
      explanation: [
        'heapify costs O(n); each heappush and heappop costs O(log n). Building once and popping k times therefore costs O(n + k log n), far less than re-sorting after every change.',
        'Before each pop, make sure the heap is nonempty: popping an empty list raises IndexError. When k may exceed the number of items, stop as soon as the heap runs out.',
      ],
      example: {
        code: lines(
          'import heapq',
          '',
          'def smallest(values, k):',
          '    heap = values.copy()',
          '    heapq.heapify(heap)',
          '    result = []',
          '    while heap and len(result) < k:',
          '        result.append(heapq.heappop(heap))',
          '    return result',
          '',
          'print(smallest([7, 3, 9, 3], 3))',
          'print(smallest([4], 5))',
        ),
        output: '[3, 3, 7]\n[4]',
        explanation:
          'Three pops give the three smallest values, keeping both 3s. With one item and k = 5, the loop stops when the heap is empty.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            '',
            'def smallest(values, k):',
            '    heap = values.copy()',
            '    heapq.heapify(heap)',
            '    result = []',
            '    while heap and len(result) < k:',
            '        result.append(heapq.heappop(heap))',
            '    return result',
            '',
            'print(smallest([5, 1, 8], 0))',
            'print(smallest([], 2))',
          ),
          '[]\n[]',
          'k = 0 stops before any pop, and an empty heap stops at once; both return an empty list.',
        ),
        choose(
          'A heap of n items is built once and then popped k times. What is the total cost?',
          ['O(n log n + k)', 'O(n + k log n)', 'O(n · k)', 'O(k log k)'],
          1,
          'heapify is O(n), and each of the k pops is O(log n).',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'import heapq',
            '',
            'def smallest(values, k):',
            '    heap = values.copy()',
            '    heapq.heapify(heap)',
            '    result = []',
            '    while heap and len(result) < k:',
            '        result.append(heapq.heappop(heap))',
            '    return result',
            '',
            'print(smallest([6, 2, 6, 2], 3))',
          ),
          '[2, 2, 6]',
          'Duplicates are separate heap entries, so the three smallest are 2, 2 and 6.',
        ),
        choose(
          'What happens if a program calls heapq.heappop on an empty list?',
          [
            'It returns None',
            'It returns 0',
            'It returns an empty list',
            'It raises IndexError',
          ],
          3,
          'There is no minimum to remove, so heappop raises IndexError; check the heap first.',
        ),
      ],
    },
  ],
  // ----------------------------------------------------------------- tries
  'cp-trie-path': [
    {
      title: 'Follow one child per character',
      explanation: [
        'A trie stores strings as paths from a root. Here each node is a dictionary that maps a character to its child node, so the path for "pin" is root["p"]["i"]["n"].',
        'Following text takes one dictionary step per character. A length-4 string follows exactly 4 edges, whatever else the trie holds.',
      ],
      example: {
        code: lines(
          'root = {"p": {"i": {"n": {}, "t": {}}}}',
          'node = root',
          'for letter in "pi":',
          '    node = node[letter]',
          'print(list(node.keys()))',
        ),
        output: "['n', 't']",
        explanation:
          'p and then i are followed from the root. The node reached has two children, n and t, so "pin" and "pit" continue from here.',
      },
      questions: [
        typeNumber(
          'How many child steps does following "lake" from the root take?',
          4,
          'Each character is one edge, so a 4-letter string takes exactly 4 steps.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'root = {"c": {"a": {"t": {}, "r": {}}, "o": {}}}',
            'print(list(root["c"].keys()))',
          ),
          "['a', 'o']",
          'The node for "c" has only its direct children a and o; t and r sit one level deeper.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'root = {"d": {"o": {"g": {}}}}',
            'node = root',
            'for letter in "do":',
            '    node = node[letter]',
            'print("g" in node, "o" in node)',
          ),
          'True False',
          'After following d and o, the node’s only child is g; o was the edge used to get here, not a child of this node.',
        ),
        choose(
          'Which expression reaches the node for the path "ab"?',
          [
            'root["ab"]',
            'root["a"]["b"]',
            'root["b"]["a"]',
            'root["a"] + root["b"]',
          ],
          1,
          'Each character is a separate key, looked up in order from the root.',
        ),
      ],
    },
    {
      title: 'Report a missing child as a missing path',
      explanation: [
        'Before stepping, check letter in node. If the child is missing, the path does not exist and the search can stop at once.',
        'The empty string takes no steps, so its path exists even in an empty trie. A path existing only means some inserted string started this way; it does not yet say that this exact word was inserted.',
      ],
      example: {
        code: lines(
          hasPath,
          'trie = {"s": {"u": {"n": {}}}}',
          'print(has_path(trie, "su"))',
          'print(has_path(trie, "sum"))',
          'print(has_path(trie, ""))',
        ),
        output: 'True\nFalse\nTrue',
        explanation:
          '"su" follows two existing edges. "sum" fails at m because the u node has only n. The empty string takes no steps.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            hasPath,
            'print(has_path({"a": {"b": {}}}, "abc"))',
            'print(has_path({}, ""))',
          ),
          'False\nTrue',
          '"abc" fails at c because the b node is empty; the empty string needs no steps, even in an empty trie.',
        ),
        predictOutput(
          'How many steps succeed before the path breaks?',
          lines(
            'def steps_taken(root, text):',
            '    node = root',
            '    steps = 0',
            '    for letter in text:',
            '        if letter not in node:',
            '            return steps',
            '        node = node[letter]',
            '        steps += 1',
            '    return steps',
            '',
            'print(steps_taken({"r": {"e": {"d": {}}}}, "rest"))',
          ),
          ['4', '3', '2', '0'],
          2,
          'r and e exist, but the e node has no s child, so the walk stops after two steps.',
        ),
        choose(
          'The trie holds only "planet". Does the path for "plan" exist?',
          [
            'No, "plan" was never inserted',
            'Yes, it is a prefix of "planet"',
            'Only if "plan" ends at a leaf',
            'No, paths exist only for full words',
          ],
          1,
          'Inserting "planet" created every prefix path, including p-l-a-n; whether "plan" is a word is a separate question.',
        ),
        choose(
          'Why does a lookup check letter in node before node = node[letter]?',
          [
            'It sorts the children alphabetically',
            'Dictionaries cannot hold single letters',
            'It adds the missing child automatically',
            'Indexing a missing key raises KeyError',
          ],
          3,
          'Reading a missing dictionary key is an error, so the check turns a missing child into a clean False.',
        ),
      ],
    },
  ],
  'cp-trie-word-end': [
    {
      title: 'A path is not a word without an end mark',
      explanation: [
        'Inserting "cat" creates the paths c, ca and cat, but only cat was inserted. The trie needs a separate end mark at the final node of each inserted word.',
        'Give each node two fields: end, a boolean, and children, a dictionary of character edges. A word is stored exactly when its path exists and the final node has end set to True.',
      ],
      example: {
        code: lines(
          containsWord,
          'leaf = {"end": True, "children": {}}',
          'trie = {"end": False, "children": {"o": {"end": False, "children": {"x": leaf}}}}',
          'print(contains_word(trie, "ox"))',
          'print(contains_word(trie, "o"))',
        ),
        output: 'True\nFalse',
        explanation:
          'Both paths exist, but only the x node is marked as the end of a word, so "o" is just a prefix.',
      },
      questions: [
        choose(
          'Only "river" was inserted. What is "riv"?',
          [
            'A stored word, because its path exists',
            'A missing path',
            'A prefix path, but not a stored word',
            'A stored word whose end is False',
          ],
          2,
          'Inserting "river" created the path for "riv", but no end mark was set there.',
        ),
        typeOutput(
          'This trie holds "go" and "gone". What does the program print?',
          lines(
            containsWord,
            'e = {"end": True, "children": {}}',
            'n = {"end": False, "children": {"e": e}}',
            'o = {"end": True, "children": {"n": n}}',
            'trie = {"end": False, "children": {"g": {"end": False, "children": {"o": o}}}}',
            'print(contains_word(trie, "go"), contains_word(trie, "gon"), contains_word(trie, "gone"))',
          ),
          'True False True',
          '"go" and "gone" end at marked nodes. "gon" has a path but its final node is not marked.',
        ),
        choose(
          'Why keep end and children as separate fields instead of storing the end mark among the character keys?',
          [
            'So the mark cannot collide with a character edge',
            'So stored words are sorted automatically',
            'So every node becomes a leaf',
            'So one-letter words are forbidden',
          ],
          0,
          'Separate fields keep node data apart from the edges, so no character can be mistaken for the mark.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            containsWord,
            'root = {"end": True, "children": {}}',
            'print(contains_word(root, ""), contains_word(root, "a"))',
          ),
          'True False',
          'The empty word follows no edges, so its mark is the root’s end, which is True; "a" has no path.',
        ),
      ],
    },
    {
      title: 'Mark the end when inserting a word',
      explanation: [
        'Insertion walks the word one character at a time, creating any missing child as {"end": False, "children": {}}. After the last character it sets end to True on the node it reached.',
        'Shared prefixes reuse existing nodes, so inserting "tea" after "ten" adds only the a node. The empty word sets end on the root itself.',
      ],
      example: {
        code: lines(
          insertWord,
          'insert(root, "ten")',
          'insert(root, "tea")',
          'e = root["children"]["t"]["children"]["e"]',
          'print(list(e["children"].keys()))',
          'print(e["end"])',
        ),
        output: "['n', 'a']\nFalse",
        explanation:
          '"tea" reuses the t and e nodes and adds a beside n. "te" was never inserted, so the e node stays unmarked.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            insertWord,
            'insert(root, "an")',
            'insert(root, "a")',
            'a = root["children"]["a"]',
            'print(a["end"], len(a["children"]))',
          ),
          'True 1',
          'Inserting "a" reuses the existing a node and marks it; its child n is still there.',
        ),
        predictOutput(
          'How many children does the node for "ba" have?',
          lines(
            insertWord,
            'for word in ["bat", "bad", "ban"]:',
            '    insert(root, word)',
            'print(len(root["children"]["b"]["children"]["a"]["children"]))',
          ),
          ['1', '2', '9', '3'],
          3,
          'All three words share b and a, then branch into t, d and n.',
        ),
        choose(
          'insert(root, "") is called on a fresh trie. What changes?',
          [
            'Nothing, because the word is empty',
            'A child with key "" is created',
            'root["end"] becomes True',
            'An error is raised',
          ],
          2,
          'The loop runs zero times, so the node reached is the root, and its end is set.',
        ),
        choose(
          'The trie already holds "seat". Then "sea" is inserted. What does insertion do?',
          [
            'Sets end on the existing a node, adding no nodes',
            'Builds a second s, e, a path beside the first',
            'Adds a new leaf below t',
            'Creates three new nodes for s, e and a',
          ],
          0,
          'Every character of "sea" already has a node, so insertion only marks the a node as a word end.',
        ),
      ],
    },
  ],
  'cp-trie-prefix-count': [
    {
      title: 'Read a prefix count from the node reached',
      explanation: [
        'A node can store count: how many inserted word occurrences pass through it. Every word that starts with the node’s path passes through it, so count answers how many words start with that prefix.',
        'A prefix query follows the path and returns the reached node’s count. A missing child means no inserted word has that prefix, so the answer is 0. The empty prefix reaches the root, whose count is the total number of words.',
      ],
      example: {
        code: lines(
          prefixCount,
          'x = {"count": 1, "children": {}}',
          'a = {"count": 2, "children": {"x": x}}',
          'b = {"count": 1, "children": {}}',
          'trie = {"count": 3, "children": {"a": a, "b": b}}',
          'print(prefix_count(trie, "a"))',
          'print(prefix_count(trie, "ay"))',
          'print(prefix_count(trie, ""))',
        ),
        output: '2\n0\n3',
        explanation:
          'Two words pass through a. No node exists for "ay", so the answer is 0. The root counts all three words.',
      },
      questions: [
        typeNumber(
          '"go" is inserted twice and "gone" once. What count is stored at the node for "go"?',
          3,
          'All three occurrences pass through the go node: two end there and one continues to gone.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            prefixCount,
            'x = {"count": 1, "children": {}}',
            'a = {"count": 2, "children": {"x": x}}',
            'b = {"count": 1, "children": {}}',
            'trie = {"count": 3, "children": {"a": a, "b": b}}',
            'print(prefix_count(trie, "ax"), prefix_count(trie, "b"), prefix_count(trie, "c"))',
          ),
          '1 1 0',
          'The ax and b nodes each count one word; there is no c child, so that query returns 0.',
        ),
        choose(
          'Which node answers the query for the empty prefix?',
          [
            'The deepest node',
            'No node; the answer is 0',
            'The root’s first child',
            'The root',
          ],
          3,
          'The empty prefix follows no edges, so it ends at the root, which every insertion passes through.',
        ),
        typeNumber(
          'A prefix query hits a missing child halfway through the prefix. What should it return?',
          0,
          'No inserted word contains the full prefix, so the number of words starting with it is 0.',
        ),
      ],
    },
    {
      title: 'Count every occurrence during insertion',
      explanation: [
        'Insertion adds 1 to count at every node it passes through, root included. The root’s count therefore equals the number of insertions, and a repeated word adds to the same nodes again.',
        'Counting only at each word’s final node would answer a different question: how many times that exact word was inserted, not how many words start with a prefix.',
      ],
      example: {
        code: lines(
          countingInsert,
          'for word in ["ink", "in", "ice", "ink"]:',
          '    insert(root, word)',
          'print(root["count"])',
          'print(root["children"]["i"]["children"]["n"]["count"])',
        ),
        output: '4\n3',
        explanation:
          'All four insertions pass the root. Three of them, "ink" twice and "in", pass through the node for "in".',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            countingInsert,
            'for word in ["to", "tea", "to"]:',
            '    insert(root, word)',
            't = root["children"]["t"]',
            'print(t["count"], t["children"]["o"]["count"], t["children"]["e"]["count"])',
          ),
          '3 2 1',
          'All three words pass t; "to" twice passes o, and only "tea" passes e.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            countingInsert,
            'for word in ["", "a"]:',
            '    insert(root, word)',
            'print(root["count"], root["children"]["a"]["count"])',
          ),
          '2 1',
          'Both insertions add 1 at the root, including the empty word; only "a" reaches the a node.',
        ),
        choose(
          'Insertion increments count only at each word’s final node. What does the count at the node for "re" then measure?',
          [
            'How many words start with "re"',
            'How many children the node has',
            'How many times "re" itself was inserted',
            'How many letters "re" has',
          ],
          2,
          'Only insertions ending exactly at that node add to it, so it counts copies of "re" alone.',
        ),
        typeNumber(
          'After 50 insertions, some repeated and one of them empty, what is the root’s count?',
          50,
          'Every insertion, repeated or empty, adds 1 at the root.',
        ),
      ],
    },
  ],
  'cp-tries': [
    {
      title: 'Share prefixes while building the trie',
      explanation: [
        'Insert each word by walking its characters from the root and creating a child only when the character is missing. Words with a common prefix share that part of the path, so each distinct prefix is stored once.',
        'Counting the nodes created shows the sharing: every distinct nonempty prefix of the inserted words becomes exactly one node below the root.',
      ],
      example: {
        code: lines(trieBuilder('["car", "cat", "cart"]'), 'print(created)'),
        output: '5',
        explanation:
          '"car" creates c, a and r; "cat" shares ca and adds t; "cart" shares car and adds its own t. Five nodes hold ten letters.',
      },
      questions: [
        predictOutput(
          'How many nodes does this build create?',
          lines(trieBuilder('["dog", "dot", "do", "dig"]'), 'print(created)'),
          ['6', '11', '7', '4'],
          0,
          '"dog" adds 3 nodes, "dot" adds t, "do" adds none, and "dig" adds i and g: 6 in all.',
        ),
        typeOutput(
          'What is printed?',
          lines(trieBuilder('["a", "a", "ab"]'), 'print(created)'),
          '2',
          'The first "a" creates one node, the repeat creates none, and "ab" adds b.',
        ),
        choose(
          '"trip", "trim" and "trick" are inserted. Which prefix is stored once and shared by all three?',
          ['"t" only', '"trip"', '"tri"', '"trick"'],
          2,
          'All three words begin with t-r-i and only then branch, so that path is shared.',
        ),
        choose(
          'A trie is built from W words with L letters in total. At most how many nodes are created below the root?',
          ['W', 'W × L', 'L²', 'L'],
          3,
          'Each letter creates at most one node, and shared prefixes create fewer.',
        ),
      ],
    },
    {
      title: 'Answer word and prefix queries on one trie',
      explanation: [
        'A word query and a prefix query walk the same path. A word query then checks the end mark; a prefix query only needs the path to exist.',
        'In a trie built from "oak" and "oakwood", "oakw" is a prefix but not a word, while "oak" is both.',
      ],
      example: {
        code: lines(
          wordTrie('["oak", "oakwood"]'),
          'for text in ["oak", "oakw", "oaks"]:',
          '    node = walk(text)',
          '    print(text, node is not None, node is not None and node["end"])',
        ),
        output: 'oak True True\noakw True False\noaks False False',
        explanation:
          '"oak" reaches a marked node. "oakw" reaches an unmarked node inside "oakwood". "oaks" falls off the trie at s.',
      },
      questions: [
        predictOutput(
          'Which texts are stored words?',
          lines(
            wordTrie('["bee", "been"]'),
            'def is_word(text):',
            '    node = walk(text)',
            '    return node is not None and node["end"]',
            '',
            'print(is_word("be"), is_word("bee"), is_word("beer"))',
          ),
          [
            'True True False',
            'False True False',
            'False True True',
            'True True True',
          ],
          1,
          '"be" is only a prefix, "bee" is marked, and "beer" has no r child after "bee".',
        ),
        choose(
          'A trie holds "pancake" and "pan". Which statement about it is correct?',
          [
            '"pa" is a stored word',
            '"pancakes" is a prefix',
            '"panc" is a prefix but not a word',
            '"pan" is a prefix but not a word',
          ],
          2,
          '"panc" lies on the path of "pancake" without an end mark; "pan" is marked, and "pancakes" runs past the path.',
        ),
        predictOutput(
          'Which queries have an existing path?',
          lines(
            wordTrie('["map", "maple"]'),
            'print([walk(text) is not None for text in ["ma", "mapl", "maps", ""]])',
          ),
          [
            '[True, True, False, True]',
            '[False, False, False, True]',
            '[True, True, False, False]',
            '[True, False, False, True]',
          ],
          0,
          '"ma" and "mapl" lie on stored paths and "" reaches the root; "maps" has no s child.',
        ),
        choose(
          'In a trie where "" was never inserted, the empty string is checked as a word. What decides the answer?',
          [
            'True, because every path starts at the root',
            'An error, because there is no first letter',
            'True, if any word was inserted',
            'False, from the root’s unset end mark',
          ],
          3,
          'The empty word ends at the root, and the root is marked only if "" itself was inserted.',
        ),
      ],
    },
    {
      title: 'Count prefix matches and their cost',
      explanation: [
        'With a count at every node, the number of inserted occurrences that start with a prefix takes a single walk: follow the prefix and read the count, or return 0 if a child is missing. Repeated words count separately because each insertion adds 1 along its path.',
        'Building from W words with L letters in total takes O(W + L) expected time, one dictionary step per letter plus the root update per word. A query of length p then takes O(p + 1), however many words are stored.',
      ],
      example: {
        code: lines(
          countTrie('["go", "gone", "go", "got"]'),
          'print(starts_with("go"), starts_with("gon"), starts_with("gox"), starts_with(""))',
        ),
        output: '4 1 0 4',
        explanation:
          'All four occurrences start with "go"; only "gone" continues with n; nothing continues with x; the root counts every insertion.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            countTrie('["red", "re", "rest", "red"]'),
            'print(starts_with("re"), starts_with("red"), starts_with("res"))',
          ),
          '4 2 1',
          'All four start with "re", the two "red" occurrences both count, and only "rest" starts with "res".',
        ),
        choose(
          'A trie stores 10,000 words. How long does counting the words that start with a 5-letter prefix take?',
          ['O(10,000)', 'O(5)', 'O(5 × 10,000)', 'O(log 10,000)'],
          1,
          'The query walks five edges and reads one count; the number of stored words does not matter.',
        ),
        typeNumber(
          'Words ["", "a", "ab"] are inserted with counts. What does the empty-prefix query return?',
          3,
          'Every insertion, including the empty word, adds 1 at the root.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            countTrie('["x", "y", "x"]'),
            'print(starts_with("x"), starts_with("z"))',
          ),
          '2 0',
          'The repeated "x" passes the x node twice, and the missing z child gives 0.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------------- recursion
  'cp-recursive-base': [
    {
      title: 'Return a known answer at the base case',
      explanation: [
        'A recursive definition rests on a base case: an input whose answer is already known, so the function returns it without another call. For a power with a nonnegative exponent, exponent 0 is the base case and its answer is 1, including 0 ** 0 under this course’s convention.',
        'Every other exponent still needs more work. A function that only recognizes the base case can return a marker such as None for those inputs.',
      ],
      example: {
        code: lines(
          baseAnswer,
          'print(base_answer(0))',
          'print(base_answer(3))',
          'print(base_answer(1))',
        ),
        output: '1\nNone\nNone',
        explanation:
          'Only exponent 0 has an answer known without further work. Exponent 1 still needs one multiplication by the base.',
      },
      questions: [
        typeNumber(
          'Which exponent is the base case for computing base ** exponent with a nonnegative integer exponent?',
          0,
          'Any base to the power 0 is 1, so exponent 0 needs no further work.',
        ),
        typeOutput(
          'What does this program print?',
          lines(baseAnswer, 'print(base_answer(2), base_answer(0))'),
          'None 1',
          'Exponent 2 is not the base case, so it gets None; exponent 0 returns the known answer 1.',
        ),
        typeOutput(
          'What is printed?',
          'print(0 ** 0, 5 ** 0)',
          '1 1',
          'Python, like this course’s convention, defines every zero exponent as 1, including 0 ** 0.',
        ),
        choose(
          'What makes a case a base case?',
          [
            'It is the largest input allowed',
            'It calls the function twice',
            'It prints its argument',
            'It returns without making another recursive call',
          ],
          3,
          'A base case already knows its answer, so it ends the chain of calls.',
        ),
      ],
    },
    {
      title: 'Test the base case before any step',
      explanation: [
        'return ends a call immediately, so lines after a returning base case never run for the base input. That is why the base test comes first: any later step, such as shrinking the exponent, runs only for inputs that need it.',
        'If a step runs before the test, the base input may be changed into something the test no longer recognizes.',
      ],
      example: {
        code: lines(
          'def describe(exponent):',
          '    if exponent == 0:',
          '        return "base"',
          '    print("needs work")',
          '    return "step"',
          '',
          'print(describe(0))',
          'print(describe(4))',
        ),
        output: 'base\nneeds work\nstep',
        explanation:
          'For 0 the function returns at once and never prints "needs work". For 4 the test fails, so the later lines run.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'def check(n):',
            '    if n == 0:',
            '        return "done"',
            '    print("working on", n)',
            '    return "more"',
            '',
            'print(check(0))',
          ),
          'done',
          'The base test matches and returns "done" before the print line is reached.',
        ),
        typeOutput(
          'This function shrinks its argument before testing it. What does it print?',
          lines(
            'def step(n):',
            '    n = n - 1',
            '    if n == 0:',
            '        return "base"',
            '    return n',
            '',
            'print(step(0))',
          ),
          '-1',
          'The step turns 0 into −1 before the test, so the base case is missed; testing first would have returned "base".',
        ),
        choose(
          'A power function returns 1 when exponent == 0 and otherwise halves the exponent. Where must the zero test go?',
          [
            'After the halving step',
            'Before any step that shrinks the exponent',
            'At the end of the function',
            'Inside the multiplication',
          ],
          1,
          'The base input must be recognized before anything changes it.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def power_step(exponent):',
            '    if exponent == 0:',
            '        return 1',
            '    return exponent // 2',
            '',
            'print(power_step(0), power_step(9))',
          ),
          '1 4',
          '0 returns the base answer 1; 9 skips the test and returns the halved argument 4.',
        ),
      ],
    },
  ],
  'cp-recursive-shrink': [
    {
      title: 'Halve the exponent toward zero',
      explanation: [
        'A recursive step must move every allowed input closer to the base case. For a positive integer e, e // 2 is strictly smaller and still nonnegative, so repeated halving must eventually reach 0.',
        'A step that does not always shrink, such as (e + 1) // 2, which leaves 1 at 1, would repeat the same input forever.',
      ],
      example: {
        code: lines(
          'exponent = 13',
          'arguments = [exponent]',
          'while exponent > 0:',
          '    exponent = exponent // 2',
          '    arguments.append(exponent)',
          'print(arguments)',
        ),
        output: '[13, 6, 3, 1, 0]',
        explanation:
          'Each halving rounds down, so 13 becomes 6, then 3, then 1, and finally the base case 0.',
      },
      questions: [
        typeNumber(
          'For exponent 7, what is the next argument after integer halving?',
          3,
          '7 // 2 rounds down to 3; integer halving never produces a fraction.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'exponent = 20',
            'arguments = [exponent]',
            'while exponent > 0:',
            '    exponent = exponent // 2',
            '    arguments.append(exponent)',
            'print(arguments)',
          ),
          '[20, 10, 5, 2, 1, 0]',
          'The list starts with 20 and ends with the base case 0; 5 // 2 rounds down to 2.',
        ),
        choose(
          'Which step reaches exponent 0 from every positive integer exponent?',
          [
            '(exponent + 1) // 2',
            'exponent // 2',
            'exponent * 2',
            'exponent % 2',
          ],
          1,
          'exponent // 2 is always smaller for positive values; the others stall at 1 or grow.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'exponent = 5',
            'for _ in range(5):',
            '    exponent = (exponent + 1) // 2',
            'print(exponent)',
          ),
          '1',
          'At 1, (1 + 1) // 2 is 1 again, so this step stalls and never reaches the base case 0.',
        ),
      ],
    },
    {
      title: 'Count the halving steps',
      explanation: [
        'Each halving cuts the exponent at least in half, so a positive exponent e reaches 0 after about log₂ e + 1 steps: 1 needs one step, 2 and 3 need two, and 4 through 7 need three.',
        'A recursive chain whose argument halves at each level therefore has O(log e) depth, while a chain that subtracts 1 each time has depth e.',
      ],
      example: {
        code: lines(
          halvingSteps,
          'print(halving_steps(1), halving_steps(7), halving_steps(8))',
        ),
        output: '1 3 4',
        explanation:
          '7 goes 3, 1, 0 in three steps; 8 needs one more because it goes 4, 2, 1, 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(halvingSteps, 'print(halving_steps(1000))'),
          '10',
          '1000 halves through 500, 250, 125, 62, 31, 15, 7, 3, 1 and 0: ten steps.',
        ),
        choose(
          'How does the number of halving steps grow with the exponent e?',
          ['O(e)', 'O(log e)', 'O(e²)', 'O(1)'],
          1,
          'Doubling e adds only one more halving step, which is logarithmic growth.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'e = 16',
            'down = 0',
            'while e > 0:',
            '    e -= 1',
            '    down += 1',
            'e = 16',
            'halves = 0',
            'while e > 0:',
            '    e //= 2',
            '    halves += 1',
            'print(down, halves)',
          ),
          '16 5',
          'Subtracting 1 takes 16 steps, while halving goes 8, 4, 2, 1, 0 in five steps.',
        ),
        choose(
          'Exponents go up to 10⁹. About how deep is a recursive chain that halves the exponent at each level?',
          [
            'About 30 levels',
            'About 10⁹ levels',
            'About 500 million levels',
            'Exactly 9 levels',
          ],
          0,
          '2³⁰ is just over 10⁹, so about 30 halvings reach 0.',
        ),
      ],
    },
  ],
  'cp-recursive-combine': [
    {
      title: 'Square the half-power for an even exponent',
      explanation: [
        'If half equals base ** (exponent // 2), then half * half equals base ** (2 * (exponent // 2)). For an even exponent that is exactly base ** exponent.',
        'Combining multiplies the half-result by itself. Adding it to itself, or multiplying it by the exponent, computes something else.',
      ],
      example: {
        code: lines(
          'base = 3',
          'exponent = 4',
          'half = base ** (exponent // 2)',
          'print(half)',
          'print(half * half)',
        ),
        output: '9\n81',
        explanation: 'half is 3 ** 2 = 9, and 9 * 9 = 81 = 3 ** 4.',
      },
      questions: [
        typeNumber(
          'half is 2 ** 3 = 8. What is 2 ** 6?',
          64,
          '2 ** 6 is (2 ** 3) * (2 ** 3) = 8 * 8 = 64.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'def combine_even(half):',
            '    return half * half',
            '',
            'print(combine_even(5), combine_even(1))',
          ),
          '25 1',
          'Combining squares the half-result: 5 * 5 = 25 and 1 * 1 = 1.',
        ),
        typeNumber(
          'For exponent 10, which smaller exponent does half use?',
          5,
          'half is base ** (10 // 2) = base ** 5, and squaring it gives base ** 10.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'base = -2',
            'half = base ** 2',
            'print(half * half, base ** 4)',
          ),
          '16 16',
          'half is 4, and 4 * 4 = 16, which matches (−2) ** 4 because the exponent is even.',
        ),
      ],
    },
    {
      title: 'Supply the extra factor for an odd exponent',
      explanation: [
        'For an odd exponent, exponent // 2 drops one: 7 // 2 is 3, and 3 + 3 is only 6. half * half then covers all but one factor, so multiply once more by base.',
        'Test oddness with exponent % 2 == 1. Reuse the single half value twice instead of computing the smaller power again.',
      ],
      example: {
        code: lines(
          combinePower,
          'print(combine_power(2, 7, 8))',
          'print(combine_power(2, 6, 8))',
        ),
        output: '128\n64',
        explanation:
          'Both use half = 2 ** 3 = 8. Exponent 7 is odd, so 64 is multiplied by 2 once more.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(combinePower, 'print(combine_power(3, 5, 9))'),
          '243',
          'half is 3 ** 2 = 9; 9 * 9 = 81 covers four factors, and the odd exponent adds one more 3.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            combinePower,
            'print(combine_power(10, 3, 10), combine_power(10, 2, 10))',
          ),
          '1000 100',
          'Both have half = 10. Exponent 3 is odd and gets an extra factor of 10; exponent 2 does not.',
        ),
        choose(
          'Exponent 9 is computed from half = base ** 4. Which combination is correct?',
          [
            'half * half',
            'half * base',
            'half * half * 9',
            'half * half * base',
          ],
          3,
          'half * half gives base ** 8, and one more base makes base ** 9.',
        ),
        choose(
          'Why compute half once and multiply half * half, rather than computing the smaller power twice?',
          [
            'Both computations would solve the same subproblem',
            'Computing it twice gives a different answer',
            'Python cannot call a function twice in one line',
            'half * half is valid only for even exponents',
          ],
          0,
          'The two halves are identical, so one computation reused twice saves all the repeated work.',
        ),
      ],
    },
  ],
  'cp-recursion': [
    {
      title: 'Write a function that calls itself on a smaller input',
      explanation: [
        'A recursive function solves a problem by calling itself on a smaller version of the same problem. It needs a base case that returns without a call and a recursive step that moves toward that base case.',
        'Fast power combines the earlier ideas: return 1 at exponent 0; otherwise compute half = power(base, exponent // 2) once, square it, and multiply by base once more when the exponent is odd.',
      ],
      example: {
        code: lines(
          powerFunction,
          'print(power(3, 5))',
          'print(power(-2, 3))',
          'print(power(0, 0))',
        ),
        output: '243\n-8\n1',
        explanation:
          'Each call halves the exponent until the base case returns 1; the odd exponents 5 and 3 each pick up an extra factor on the way back.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(powerFunction, 'print(power(2, 10), power(5, 0))'),
          '1024 1',
          '2 ** 10 is 1024, and any exponent 0 hits the base case and returns 1.',
        ),
        predictOutput(
          'Which exponents does this recursion receive, in order?',
          lines(
            'def power(base, exponent):',
            '    print(exponent)',
            '    if exponent == 0:',
            '        return 1',
            '    half = power(base, exponent // 2)',
            '    result = half * half',
            '    if exponent % 2 == 1:',
            '        result = result * base',
            '    return result',
            '',
            'power(2, 6)',
          ),
          ['6\n3\n1', '0\n1\n3\n6', '6\n3\n1\n0', '6\n5\n4\n3\n2\n1\n0'],
          2,
          'Each call prints before recursing, so the exponents appear as they shrink: 6, 3, 1 and finally the base case 0.',
        ),
        choose(
          'Which property must every recursive step have so that the calls finish?',
          [
            'It must print its argument',
            'It must call itself twice',
            'It must keep the argument unchanged',
            'It must move toward a reachable base case',
          ],
          3,
          'Only progress toward a base case guarantees that the chain of calls ends.',
        ),
        typeOutput(
          'This version forgets the odd factor. What does it print?',
          lines(
            'def power(base, exponent):',
            '    if exponent == 0:',
            '        return 1',
            '    half = power(base, exponent // 2)',
            '    return half * half',
            '',
            'print(power(2, 3), power(2, 4))',
          ),
          '1 1',
          'Without the odd factor, power(2, 1) returns 1 * 1 = 1, and every larger call only squares that 1.',
        ),
      ],
    },
    {
      title: 'Trace return values back up the calls',
      explanation: [
        'Each call waits for its smaller call to return, then finishes its own combination. The deepest call returns first, and results flow back up in the reverse order of the calls.',
        'For power(2, 5) the calls use exponents 5, 2, 1 and 0. Returning upward they produce 1, then 2, then 4, then 32.',
      ],
      example: {
        code: lines(tracedPower, 'power(2, 5)'),
        output: '1 2\n2 4\n5 32',
        explanation:
          'Exponent 0 returns 1 without printing. Exponent 1 makes 1 · 1 · 2 = 2, exponent 2 makes 2 · 2 = 4, and exponent 5 makes 4 · 4 · 2 = 32.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(tracedPower, 'power(3, 4)'),
          '1 3\n2 9\n4 81',
          'The calls are 4, 2, 1, 0. Results print as calls finish, deepest first: 3, then 9, then 81.',
        ),
        choose(
          'In power(2, 5), which call returns its value first?',
          [
            'The call with exponent 5',
            'The call with exponent 2',
            'The call with exponent 0',
            'All calls return together',
          ],
          2,
          'Every other call is still waiting for a smaller call; the base case has nothing to wait for.',
        ),
        typeOutput(
          'What is printed?',
          lines(tracedPower, 'power(5, 3)'),
          '1 5\n3 125',
          '3 // 2 is 1, so there is no exponent-2 call. Exponent 1 gives 5, and exponent 3 gives 5 · 5 · 5 = 125.',
        ),
        choose(
          'power(base, 1) returns base. Which steps produce that value?',
          [
            'half is power(base, 0) = 1, then 1 · 1 · base',
            'A base case returns base directly',
            'half is power(base, 1), then half · half',
            'Exponent 1 skips the odd-factor test',
          ],
          0,
          '1 // 2 is 0, which returns 1; squaring gives 1, and the odd exponent multiplies in base.',
        ),
      ],
    },
    {
      title: 'Keep the call depth logarithmic',
      explanation: [
        'Each call halves the exponent, so a positive exponent e leads to about log₂ e + 2 calls in total: one per halving plus the base case. Exponents up to 10⁹ need only about 31 calls.',
        'Python stops recursion at about 1,000 nested calls by default. A version that subtracts 1 per call would fail long before 10⁹, and a version that calls power twice per level instead of reusing half does about e calls of work.',
      ],
      example: {
        code: lines(callDepth, 'print(depth(1), depth(8), depth(1000000000))'),
        output: '2 5 31',
        explanation:
          'depth counts the calls in the chain. 8 goes 4, 2, 1, 0; 10⁹ needs 30 halvings plus the base-case call.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(callDepth, 'print(depth(1000))'),
          '11',
          '1000 takes ten halvings to reach 0, and the base-case call adds one more.',
        ),
        choose(
          'A different power function recurses on exponent - 1. What happens for exponent 10⁹ in Python?',
          [
            'It exceeds the recursion depth limit',
            'It finishes in about 30 calls',
            'It returns 1 immediately',
            'It runs as fast as halving',
          ],
          0,
          'It would need a billion nested calls, far beyond Python’s limit of about 1,000.',
        ),
        choose(
          'A version computes power(base, exponent // 2) * power(base, exponent // 2) without saving half. How does its number of calls grow?',
          [
            'It stays O(log e)',
            'It halves',
            'It grows to about e calls',
            'It becomes about log² e',
          ],
          2,
          'Every level doubles the number of calls, and log₂ e doublings make about e calls.',
        ),
        predictOutput(
          'How many calls does the doubled version make?',
          lines(
            'calls = [0]',
            '',
            'def slow_power(base, exponent):',
            '    calls[0] += 1',
            '    if exponent == 0:',
            '        return 1',
            '    result = slow_power(base, exponent // 2) * slow_power(base, exponent // 2)',
            '    if exponent % 2 == 1:',
            '        result = result * base',
            '    return result',
            '',
            'print(slow_power(2, 8), calls[0])',
          ),
          ['256 5', '256 8', '256 16', '256 31'],
          3,
          'The answer is right, but each level calls twice: 1 + 2 + 4 + 8 + 16 = 31 calls instead of 5.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------------- backtracking
  'cp-choice-undo': [
    {
      title: 'Undo the temporary choice before the next sibling',
      explanation: [
        'Backtracking builds a working path by appending a choice, exploring with it, and then popping it off. The pop restores the parent path, so the next sibling choice starts from the same state.',
        'Without the pop, each sibling inherits every earlier sibling’s choice.',
      ],
      example: {
        code: lines(
          'working = ["root"]',
          'for choice in ["left", "right"]:',
          '    working.append(choice)',
          '    print(working)',
          '    working.pop()',
          'print(working)',
        ),
        output: "['root', 'left']\n['root', 'right']\n['root']",
        explanation:
          'left is removed before right is tried, so each branch is the parent plus one choice, and the parent is restored at the end.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'working = [0]',
            'for value in [1, 2, 3]:',
            '    working.append(value)',
            '    print(working)',
            '    working.pop()',
          ),
          '[0, 1]\n[0, 2]\n[0, 3]',
          'Each value is appended to the parent [0], printed, and removed before the next value.',
        ),
        typeOutput(
          'This loop forgets the pop. What is printed?',
          lines(
            'working = ["s"]',
            'for value in ["a", "b"]:',
            '    working.append(value)',
            '    print(working)',
          ),
          "['s', 'a']\n['s', 'a', 'b']",
          'a is never removed, so the second branch wrongly inherits it.',
        ),
        choose(
          'Which operation undoes an append made just before it?',
          [
            'working.pop()',
            'working.pop(0)',
            'working.clear()',
            'working.sort()',
          ],
          0,
          'pop() removes the rightmost entry, which is exactly the one append added.',
        ),
        choose(
          'The parent path is [5]. Choices 1 and then 2 are explored with append, explore, pop. What is the path while choice 2 is explored?',
          ['[5, 1, 2]', '[2]', '[5, 1]', '[5, 2]'],
          3,
          'Choice 1 was popped, so choice 2 is appended to the restored parent [5].',
        ),
      ],
    },
    {
      title: 'Restore the parent after every branch',
      explanation: [
        'The rule append, explore, pop keeps an invariant: after a branch finishes, the working path is exactly what it was before the branch started, even when the exploration inside appends and pops choices of its own.',
        'So after all siblings have been tried, the path equals the parent path again, and the caller can continue from it.',
      ],
      example: {
        code: lines(
          'path = []',
          'for first in ["a", "b"]:',
          '    path.append(first)',
          '    for second in ["x", "y"]:',
          '        path.append(second)',
          '        print(path)',
          '        path.pop()',
          '    path.pop()',
          'print(path)',
        ),
        output: "['a', 'x']\n['a', 'y']\n['b', 'x']\n['b', 'y']\n[]",
        explanation:
          'Each inner pop restores [first], and each outer pop restores the empty path, so b starts as cleanly as a did.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'path = [9]',
            'for a in [1, 2]:',
            '    path.append(a)',
            '    for b in [3, 4]:',
            '        path.append(b)',
            '        path.pop()',
            '    path.pop()',
            'print(path, len(path))',
          ),
          '[9] 1',
          'Every append is matched by a pop, so the path returns to its starting value [9].',
        ),
        typeOutput(
          'The inner pop is missing. What is printed?',
          lines(
            'path = []',
            'for a in ["p", "q"]:',
            '    path.append(a)',
            '    for b in ["r"]:',
            '        path.append(b)',
            '    path.pop()',
            'print(path)',
          ),
          "['p', 'q']",
          'Each outer pop removes r instead of a, so p and q are both left behind.',
        ),
        choose(
          'After a branch that appends and pops correctly finishes, what must the working path equal?',
          [
            'The longest path explored',
            'An empty list',
            'The path the branch started from',
            'The last saved result',
          ],
          2,
          'Every append inside the branch was undone, so the path is back to its starting state.',
        ),
        choose(
          'One branch appends twice but pops only once. What happens to the next sibling?',
          [
            'It starts from the correct parent',
            'It starts from an empty path',
            'It raises IndexError',
            'It starts with one leftover choice',
          ],
          3,
          'The unmatched append stays on the path, so the sibling begins with an extra entry.',
        ),
      ],
    },
  ],
  'cp-path-snapshot': [
    {
      title: 'A saved reference keeps changing',
      explanation: [
        'results.append(path) stores the same list object, not its current contents. When the working path changes later, every stored reference shows the change.',
        'In backtracking the path ends up empty, so saved references usually all look empty by the end.',
      ],
      example: {
        code: lines(
          'path = [2, 5]',
          'results = []',
          'results.append(path)',
          'path.pop()',
          'path.append(7)',
          'print(results)',
        ),
        output: '[[2, 7]]',
        explanation:
          'results holds the path list itself, so it shows the path’s current contents [2, 7], not the [2, 5] it held when saved.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'path = []',
            'saved = []',
            'for value in [1, 2]:',
            '    path.append(value)',
            '    saved.append(path)',
            '    path.pop()',
            'print(saved)',
          ),
          '[[], []]',
          'Both entries are the same path list, which is empty after the final pop.',
        ),
        choose(
          'What does results.append(path) store?',
          [
            'A frozen copy of path',
            'Only the last entry of path',
            'A reference to the same list',
            'The length of path',
          ],
          2,
          'Appending a list stores that list object, so later changes to it are visible through results.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'path = ["a"]',
            'first = path',
            'path.append("b")',
            'print(first)',
            'print(len(first))',
          ),
          "['a', 'b']\n2",
          'first and path name one list, so the append is visible through first.',
        ),
        choose(
          'A search saves path itself at each solution and finishes with path empty. What do the saved results look like?',
          [
            'Each solution as it was found',
            'Only the first solution',
            'Only the longest solution',
            'Empty lists, all one object',
          ],
          3,
          'Every saved entry is the working path, which ends empty.',
        ),
      ],
    },
    {
      title: 'Save path.copy() at a solution',
      explanation: [
        'path.copy() creates a new list holding the entries present at that moment. Later appends and pops on path do not touch the copy.',
        'A shallow copy is enough when the entries are integers or strings, because those values cannot change in place; only the list holding them changes.',
      ],
      example: {
        code: lines(
          'path = []',
          'saved = []',
          'for value in [1, 2]:',
          '    path.append(value)',
          '    saved.append(path.copy())',
          '    path.pop()',
          'print(saved)',
          'print(path)',
        ),
        output: '[[1], [2]]\n[]',
        explanation:
          'Each copy freezes the path as it was, so both solutions survive while the working path returns to empty.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'path = [4]',
            'snapshot = path.copy()',
            'path.append(6)',
            'path.pop(0)',
            'print(snapshot, path)',
          ),
          '[4] [6]',
          'The snapshot was taken before either change, so it keeps [4] while path becomes [6].',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def save_path(paths, current):',
            '    result = paths.copy()',
            '    result.append(current.copy())',
            '    return result',
            '',
            'current = [3, 1]',
            'saved = save_path([[0]], current)',
            'current.append(8)',
            'print(saved)',
          ),
          '[[0], [3, 1]]',
          'The saved entry is a copy of current, so the later append does not reach it.',
        ),
        choose(
          'Why is a shallow path.copy() enough when the path holds integers?',
          [
            'Integer lists are immutable',
            'Integers cannot be changed in place',
            'copy() also copies nested lists',
            'Python copies integers on every append',
          ],
          1,
          'The copy has its own list, and the integers inside it can never be modified.',
        ),
        choose(
          'Which line correctly records a finished combination while the search continues?',
          [
            'results.append(path)',
            'results = path',
            'results.append(path[-1])',
            'results.append(path.copy())',
          ],
          3,
          'Only a copy keeps the combination after the working path changes.',
        ),
      ],
    },
  ],
  'cp-remaining-capacity': [
    {
      title: 'Count what is still needed and still available',
      explanation: [
        'A selection of k distinct indices that already holds chosen entries still needs k − chosen more. If the next index it may use is start, the indices start through n − 1 remain: n − start of them.',
        'These two numbers describe any partial selection, whatever was chosen so far.',
      ],
      example: {
        code: lines(
          'n = 6',
          'k = 4',
          'start = 3',
          'chosen = 2',
          'print(k - chosen, n - start)',
        ),
        output: '2 3',
        explanation:
          'Two more indices are needed, and indices 3, 4 and 5 are still available.',
      },
      questions: [
        typeNumber(
          'n = 10 and the next usable index is 7. How many indices remain?',
          3,
          'Indices 7, 8 and 9 remain: 10 − 7 = 3.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'n = 8',
            'k = 5',
            'start = 6',
            'chosen = 3',
            'print(k - chosen, n - start)',
          ),
          '2 2',
          'Two more are needed (5 − 3), and indices 6 and 7 remain (8 − 6).',
        ),
        typeNumber(
          'A selection needs k = 4 entries and has chosen 1. How many more must it pick?',
          3,
          'It still needs k − chosen = 4 − 1 = 3.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'n = 7',
            'start = 4',
            'print(list(range(start, n)), n - start)',
          ),
          '[4, 5, 6] 3',
          'range(start, n) stops before n, so indices 4, 5 and 6 remain: n − start = 3.',
        ),
      ],
    },
    {
      title: 'Prune when too few indices remain',
      explanation: [
        'A branch can still succeed exactly when needed ≤ available, that is k − chosen ≤ n − start. If more are needed than remain, no choice of later indices can finish the selection, so the search should stop exploring that branch.',
        'Equality is feasible: every remaining index must then be taken. Pruning early skips whole subtrees that could never produce a result.',
      ],
      example: {
        code: lines(
          canComplete,
          'print(can_complete(7, 5, 1, 4))',
          'print(can_complete(7, 5, 2, 4))',
          'print(can_complete(7, 7, 4, 4))',
        ),
        output: 'False\nTrue\nTrue',
        explanation:
          'The first branch needs 3 but only 2 remain. The second needs exactly the 2 that remain. The third needs nothing more.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            canComplete,
            'print(can_complete(5, 3, 0, 3), can_complete(5, 3, 1, 3))',
          ),
          'False True',
          'The first needs 3 with only 2 left; the second needs 2 with 2 left, which is feasible.',
        ),
        choose(
          'n = 9, start = 7, and the selection still needs 3 more indices. What should the search do with this branch?',
          [
            'Keep it, since 7 is below 9',
            'Prune it; only 2 indices remain',
            'Reuse index 8 twice',
            'Save the partial selection',
          ],
          1,
          'Only indices 7 and 8 remain, and distinct indices cannot be reused.',
        ),
        choose(
          'For a branch, needed equals available. What does that mean?',
          [
            'Every remaining index must be chosen',
            'The branch must be pruned',
            'The selection is already complete',
            'Any one remaining index finishes it',
          ],
          0,
          'The branch is feasible, but only by taking all of the remaining indices.',
        ),
        predictOutput(
          'Which starting positions are still feasible?',
          lines(
            'n = 6',
            'k = 3',
            'chosen = 1',
            'print([start for start in range(n + 1) if k - chosen <= n - start])',
          ),
          [
            '[0, 1, 2, 3]',
            '[0, 1, 2, 3, 4, 5]',
            '[0, 1, 2, 3, 4]',
            '[4, 5, 6]',
          ],
          2,
          'Two more are needed, so at least two indices must remain: n − start ≥ 2 means start ≤ 4.',
        ),
      ],
    },
  ],
  'cp-backtracking': [
    {
      title: 'Enumerate combinations with append, recurse, pop',
      explanation: [
        'To list every way to choose k of the indices 0 through n − 1, keep a working path. At each level, try each allowed next index: append it, recurse to fill the rest, then pop it so the next choice starts from the same parent.',
        'Starting the next level after the last chosen index keeps every path increasing. Each combination is then produced once, in lexicographic order, instead of once per ordering.',
      ],
      example: {
        code: lines(combinations('path.copy()'), 'print(combinations(4, 2))'),
        output: '[[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]',
        explanation:
          'Each path starts after its previous index, so [1, 0] is never produced, and the six pairs appear in lexicographic order.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(combinations('path.copy()'), 'print(combinations(3, 2))'),
          '[[0, 1], [0, 2], [1, 2]]',
          'Each pair appears once in increasing order; visit(index + 1) prevents reversed and repeated indices.',
        ),
        predictOutput(
          'How many combinations are listed?',
          lines(combinations('path.copy()'), 'print(len(combinations(5, 3)))'),
          ['60', '10', '15', '20'],
          1,
          'There are C(5, 3) = 10 increasing triples; 60 would count every ordering.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            combinations('path.copy()'),
            'print(combinations(3, 0))',
            'print(combinations(2, 3))',
          ),
          '[[]]\n[]',
          'Choosing zero indices has one answer, the empty selection. Choosing 3 of 2 indices has none.',
        ),
        choose(
          'Why does the recursive call use visit(index + 1) rather than visit(start)?',
          [
            'To count the solutions',
            'To stop the recursion at depth 1',
            'To reverse the final result',
            'To keep each path increasing so no combination repeats',
          ],
          3,
          'Later choices must come after the current index, so each set of indices appears in one order only.',
        ),
      ],
    },
    {
      title: 'Snapshot complete paths and restore the parent',
      explanation: [
        'When the path reaches length k, save path.copy(). The working path keeps changing as other branches are explored, so saving path itself would leave every result pointing at one list that ends empty.',
        'The pop after each recursive call is what makes the next snapshot correct: whenever control returns to a level, the path holds exactly that level’s parent choices.',
      ],
      example: {
        code: lines(combinations('path'), 'print(combinations(3, 2))'),
        output: '[[], [], []]',
        explanation:
          'All three saved entries are the same path list, which is empty once the search finishes. Saving path.copy() would keep [0, 1], [0, 2] and [1, 2].',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'path = []',
            '',
            'def visit(start, n, k):',
            '    if len(path) == k:',
            '        print(path)',
            '        return',
            '    for index in range(start, n):',
            '        path.append(index)',
            '        visit(index + 1, n, k)',
            '        path.pop()',
            '',
            'visit(0, 3, 1)',
            'print(path)',
          ),
          [
            '[0]\n[0, 1]\n[0, 1, 2]\n[0, 1, 2]',
            '[0]\n[1]\n[2]\n[]',
            '[0]\n[1]\n[2]\n[2]',
            '[0, 1, 2]\n[]',
          ],
          1,
          'Printing happens at each leaf, and each pop restores the empty parent before the next index is tried.',
        ),
        typeOutput(
          'This search forgets the pop. What is printed?',
          lines(
            'path = []',
            'result = []',
            '',
            'def visit(start, n, k):',
            '    if len(path) == k:',
            '        result.append(path.copy())',
            '        return',
            '    for index in range(start, n):',
            '        path.append(index)',
            '        visit(index + 1, n, k)',
            '',
            'visit(0, 3, 1)',
            'print(result)',
          ),
          '[[0]]',
          'After [0] is saved, 0 is never removed, so the path is too long at every later check and nothing else is saved.',
        ),
        choose(
          'A search saved result.append(path) at each of three solutions. What does result show when the search finishes?',
          [
            'Three different combinations',
            'The last combination three times',
            'The first combination three times',
            'Three empty lists, all one object',
          ],
          3,
          'Each entry is the working path itself, and that path ends empty.',
        ),
        choose(
          'Right after visit(index + 1) returns inside the loop, before the pop, what does path hold?',
          [
            'The parent choices plus index',
            'Only the parent choices',
            'An empty list',
            'A complete combination',
          ],
          0,
          'The deeper call undid everything it added, so only this level’s append of index remains.',
        ),
      ],
    },
    {
      title: 'Prune branches that cannot be completed',
      explanation: [
        'If a branch needs more indices than remain, it cannot reach length k. Stop the loop early with range(start, n − needed + 1), where needed = k − len(path): any later first choice would leave too few indices.',
        'Pruning skips dead branches but never a valid combination. Listing all results still takes O((k + 1) · C(n, k)) time, because each of the C(n, k) results is copied, and the path itself uses O(k) extra space.',
      ],
      example: {
        code: lines(
          countVisits,
          'print(visits(5, 3, False), visits(5, 3, True))',
        ),
        output: '26 20',
        explanation:
          'Both versions find the same 10 combinations, but the pruned search never enters the 6 dead prefixes, such as [3] or [0, 4], that leave too few indices.',
      },
      questions: [
        typeNumber(
          'n = 6, k = 4, and the path already holds 1 index. What is the largest index the pruned loop tries next?',
          3,
          'needed = 3, so the loop is range(start, 6 − 3 + 1) = range(start, 4), whose last index is 3.',
        ),
        typeOutput(
          'What does this program print?',
          lines(countVisits, 'print(visits(4, 2, False), visits(4, 2, True))'),
          '11 10',
          'Without pruning the search also enters the dead prefix [3]; pruning skips just that one call.',
        ),
        choose(
          'Does pruning with range(start, n − needed + 1) ever skip a valid combination?',
          [
            'Yes, the ones using index n − 1',
            'Yes, whenever k is larger than n / 2',
            'No, because it never changes the loop bounds',
            'No, it skips only branches that cannot be completed',
          ],
          3,
          'Any first choice past that bound leaves fewer indices than are still needed.',
        ),
        choose(
          'Listing every k-element combination of n indices returns C(n, k) lists of length k. Which cost bound fits?',
          ['O((k + 1) · C(n, k))', 'O(n)', 'O(k log n)', 'O(n^k · k!)'],
          0,
          'Copying each of the C(n, k) results costs O(k + 1), and that output dominates the search.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------- binary search trees
  'cp-bst-bounds': [
    {
      title: 'Every descendant inherits its ancestors’ bounds',
      explanation: [
        'In a strict binary search tree, every key in a node’s left subtree is smaller than the node’s key, and every key in its right subtree is larger. That applies to all descendants, not only to the immediate children.',
        'So a node deep in the tree must lie strictly between the nearest ancestor it went right from and the nearest ancestor it went left from. Going left at 9 and then right at 4 confines a key to the open interval (4, 9).',
      ],
      example: {
        code: lines(
          insideBounds,
          '# a node reached by going left at 9, then right at 4',
          'print(inside(6, 4, 9))',
          'print(inside(11, 4, 9))',
          'print(inside(3, 4, 9))',
        ),
        output: 'True\nFalse\nFalse',
        explanation:
          '11 is above its parent 4, but it sits in 9’s left subtree, so it breaks the inherited upper bound 9. 3 breaks the lower bound 4.',
      },
      questions: [
        choose(
          'The root is 20. A node is reached by going right at 20 and then left at 30. Which key may it hold?',
          ['15', '25', '35', '30'],
          1,
          'It must be above 20 and below 30, and only 25 lies strictly between them.',
        ),
        choose(
          'From the root, a search goes left at 50, right at 10, then right at 25. What open interval must the next key lie in?',
          ['(25, 50)', '(10, 25)', '(10, 50)', '(25, ∞)'],
          0,
          'Going left at 50 sets the upper bound 50, and the latest right turn at 25 sets the lower bound 25.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            insideBounds,
            'print(inside(7, None, 8), inside(7, 7, None), inside(-3, None, None))',
          ),
          'True False True',
          '7 is below 8; 7 equals its lower bound, which fails; with no bounds any key fits.',
        ),
        choose(
          'Which tree passes a check of each node against its parent, yet is not a valid search tree?',
          [
            'Root 10, left child 5, and 5’s left child 2',
            'Root 10, right child 15, and 15’s left child 12',
            'Root 10, left child 5, and 5’s right child 12',
            'Root 10, right child 15, and 15’s right child 20',
          ],
          2,
          '12 is larger than its parent 5, but it lies in 10’s left subtree, where every key must be below 10.',
        ),
      ],
    },
    {
      title: 'Test a key against optional strict bounds',
      explanation: [
        'Represent a missing bound by None: the root has neither, and a node on the leftmost path has no lower bound. A key is valid when it is strictly greater than an existing lower bound and strictly smaller than an existing upper bound.',
        'Equality fails, because keys are distinct and a key equal to an ancestor’s key fits on neither side of it. Test lower is not None before comparing, since a number cannot be compared with None.',
      ],
      example: {
        code: lines(
          insideBounds,
          'print(inside(5, 5, None))',
          'print(inside(5, None, None))',
          'print(inside(0, -1, 1))',
        ),
        output: 'False\nTrue\nTrue',
        explanation:
          '5 equals its lower bound, so it fails. With no bounds, 5 fits. 0 lies strictly between −1 and 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            insideBounds,
            'print(inside(9, 2, 9), inside(2, 2, 9), inside(3, 2, 9))',
          ),
          'False False True',
          'Both bounds are strict, so 9 and 2 fail by equality; only 3 lies strictly inside.',
        ),
        choose(
          'Why check lower is not None before testing key <= lower?',
          [
            'Comparing a number with None raises TypeError',
            'None is treated as zero',
            'It makes the test faster',
            'None is larger than every number',
          ],
          0,
          'Python cannot order an int and None, so the missing bound must be skipped rather than compared.',
        ),
        choose(
          'A node has bounds lower = 4 and upper = None. Which key is allowed?',
          ['4', '3', '-4', '100'],
          3,
          'It must be strictly above 4 and has no upper limit, so only 100 qualifies.',
        ),
        typeOutput(
          'What is printed?',
          lines(insideBounds, 'print(inside(0, None, 0), inside(-5, None, 0))'),
          'False True',
          '0 equals the upper bound and fails; −5 is strictly below it.',
        ),
      ],
    },
  ],
  'cp-bst-branch': [
    {
      title: 'Compare once to choose a side',
      explanation: [
        'At a search-tree node with key k, a target equal to k is found. A smaller target can only be in the left subtree, because every right descendant is larger than k; a larger target can only be on the right.',
        'One comparison discards the entire other subtree. That is what lets a search follow a single path instead of visiting every node.',
      ],
      example: {
        code: lines(
          searchBranch,
          'print(branch(9, 6))',
          'print(branch(9, 12))',
          'print(branch(9, 9))',
        ),
        output: 'left\nright\nfound',
        explanation:
          '6 is smaller than 9, so only the left subtree can hold it; 12 can only be on the right; 9 is the node itself.',
      },
      questions: [
        choose(
          'At a node with key 15, the target is 21. Which part of the tree can still contain it?',
          [
            'Only the left subtree',
            'Only the right subtree',
            'Either subtree',
            'Only the current node',
          ],
          1,
          'Every left descendant is below 15, so a larger target can only be on the right.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            searchBranch,
            'print(branch(-2, -5), branch(0, 0), branch(3, 4))',
          ),
          'left found right',
          '−5 is smaller than −2, 0 equals 0, and 4 is larger than 3.',
        ),
        choose(
          'Why can a target smaller than the node’s key not be in its right subtree?',
          [
            'Every right-subtree key is larger than the node’s key',
            'The right subtree is always empty',
            'Right children are visited last',
            'Smaller keys are stored only at leaves',
          ],
          0,
          'The ordering rule covers the whole right subtree, so nothing there is smaller.',
        ),
        typeOutput(
          'What is printed?',
          lines(searchBranch, 'print([branch(50, t) for t in [10, 50, 70]])'),
          "['left', 'found', 'right']",
          '10 goes left, 50 is found, and 70 goes right.',
        ),
      ],
    },
    {
      title: 'Branch decisions do not depend on balance',
      explanation: [
        'The left-or-right rule works on any valid search tree, balanced or not. In a tall chain such as 1 → 2 → 3 → 4, where each node is the right child of the previous one, every decision is still correct; the search just needs more of them.',
        'A search makes one decision per node on its path, so the number of decisions is at most the tree’s height. Balance changes how many decisions are needed, never which side is correct.',
      ],
      example: {
        code: lines(
          searchBranch,
          '# keys on a right-leaning chain: 1 -> 2 -> 3 -> 4 -> 5',
          'made = []',
          'for key in [1, 2, 3, 4]:',
          '    made.append(branch(key, 4))',
          'print(made)',
        ),
        output: "['right', 'right', 'right', 'found']",
        explanation:
          'Each decision is correct even though the tree is a chain; reaching 4 simply takes four decisions.',
      },
      questions: [
        choose(
          'A search tree is a single chain of 1,000 nodes. What is true about searching it?',
          [
            'The branch decisions become unreliable',
            'Decisions stay correct, but a search may need 1,000',
            'It must be rebalanced before searching',
            'Each search needs exactly one decision',
          ],
          1,
          'The ordering rule still holds at every node; only the path length grows.',
        ),
        typeOutput(
          'Each key below is the left child of the one before it. What is printed?',
          lines(
            searchBranch,
            'made = []',
            'for key in [50, 40, 30]:',
            '    made.append(branch(key, 30))',
            'print(made)',
          ),
          "['left', 'left', 'found']",
          '30 is below 50 and 40, so the search goes left twice and then finds it.',
        ),
        choose(
          'What bounds the number of branch decisions in one search?',
          [
            'The number of keys smaller than the target',
            'The number of leaves',
            'Always 2',
            'The height of the tree',
          ],
          3,
          'Each decision moves one level down, so a path can have at most height-many nodes.',
        ),
        choose(
          'Target 3 is searched at a node with key 8, once in a balanced tree and once in a long chain. Which side does each search take there?',
          [
            'Left in both trees',
            'Left in the balanced tree, right in the chain',
            'Right in both trees',
            'It depends on the tree’s height',
          ],
          0,
          'The decision depends only on comparing 3 with 8, not on the tree’s shape.',
        ),
      ],
    },
  ],
  'cp-bst-candidate': [
    {
      title: 'Keep the largest key that fits under the limit',
      explanation: [
        'A floor query asks for the largest stored key that is at most limit. While examining keys one at a time, keep best: None until some key qualifies, and afterwards the largest qualifying key seen so far.',
        'A key larger than limit can never be the answer, so it leaves best unchanged. A qualifying key replaces best only when it is larger.',
      ],
      example: {
        code: lines(
          improveFloor,
          'best = None',
          'for key in [3, 12, 8, 5]:',
          '    best = improve_floor(best, key, 10)',
          'print(best)',
        ),
        output: '8',
        explanation:
          '3 starts the candidate, 12 is above the limit, 8 improves it, and 5 is smaller than 8.',
      },
      questions: [
        typeNumber(
          'best = 6, limit = 9, and the next key is 9. What is best afterwards?',
          9,
          '9 is at most the limit and larger than 6, so it becomes the new best.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            improveFloor,
            'best = None',
            'for key in [15, 11, 20]:',
            '    best = improve_floor(best, key, 10)',
            'print(best)',
          ),
          'None',
          'Every key is above 10, so none qualifies and best stays None.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            improveFloor,
            'print(improve_floor(7, 13, 10), improve_floor(7, 2, 10))',
          ),
          '7 7',
          '13 exceeds the limit and 2 is smaller than 7, so best stays 7 both times.',
        ),
        choose(
          'Why start best at None rather than 0?',
          [
            '0 might be a real qualifying key',
            'None is larger than every integer',
            'Floor queries never return 0',
            '0 cannot be compared with keys',
          ],
          0,
          'None means no key has qualified, while 0 could be a stored answer or wrongly beat negative keys.',
        ),
      ],
    },
    {
      title: 'Treat None as no answer yet',
      explanation: [
        'None means no key has qualified. In the test best is None or key > best, the None check comes first: comparing an integer with None raises TypeError, and or skips the comparison once best is None.',
        'When every key exceeds the limit, best stays None, which is the correct answer. Starting from 0 instead would invent a key that was never stored and would hide negative answers.',
      ],
      example: {
        code: lines(
          improveFloor,
          'best = None',
          'for key in [-4, -9, 2]:',
          '    best = improve_floor(best, key, -1)',
          'print(best)',
        ),
        output: '-4',
        explanation:
          '−4 qualifies first, −9 is smaller, and 2 exceeds the limit −1. Starting at 0 would have hidden the answer, since 0 is larger than every qualifying key.',
      },
      questions: [
        typeOutput(
          'This version starts best at 0. What does it print?',
          lines(
            'best = 0',
            'for key in [-4, -9, 2]:',
            '    if key <= -1 and key > best:',
            '        best = key',
            'print(best)',
          ),
          '0',
          'No qualifying key beats 0, so the program reports 0, a key that was never stored.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            improveFloor,
            'print(improve_floor(None, 5, 5), improve_floor(None, 6, 5))',
          ),
          '5 None',
          '5 qualifies and replaces None; 6 exceeds the limit, so best stays None.',
        ),
        choose(
          'Which condition safely decides whether key should replace best?',
          [
            'key > best or best is None',
            'key <= limit and key > best',
            'key <= limit and (best is None or key > best)',
            'best is None and key <= limit',
          ],
          2,
          'It checks the limit and tests None before comparing; the others compare with None or never improve best.',
        ),
        choose(
          'Every stored key is greater than limit. What should a floor query return?',
          ['0', 'The smallest stored key', 'limit itself', 'None'],
          3,
          'No key qualifies, so the answer is the absence marker None.',
        ),
      ],
    },
  ],
  'cp-bst': [
    {
      title: 'Search a tuple tree by following one path',
      explanation: [
        'Represent a node as (key, left, right), with None for an absent child. To search, compare the target with the current key: stop when equal, otherwise move to left when the target is smaller and to right when it is larger. Reaching None means the key is not stored.',
        'A while loop is enough. Each step follows one branch, so the search visits a single root-to-leaf path at most.',
      ],
      example: {
        code: lines(
          sampleTree,
          '',
          treeContains,
          'print(contains(tree, 15))',
          'print(contains(tree, 35))',
        ),
        output: 'True\nFalse',
        explanation:
          '15 is found by going left at 20 and right at 10. 35 goes right at 20, right at 30, then left at 40 into None.',
      },
      questions: [
        predictOutput(
          'Which keys does each search visit?',
          lines(
            sampleTree,
            '',
            'def visited(node, target):',
            '    keys = []',
            '    while node is not None:',
            '        key, left, right = node',
            '        keys.append(key)',
            '        if target == key:',
            '            return keys',
            '        if target < key:',
            '            node = left',
            '        else:',
            '            node = right',
            '    return keys',
            '',
            'print(visited(tree, 5))',
            'print(visited(tree, 33))',
          ),
          [
            '[20, 10, 5]\n[20, 30, 40]',
            '[5]\n[40]',
            '[20, 10, 5]\n[20, 30]',
            '[20, 10, 15, 5]\n[20, 30, 40]',
          ],
          0,
          'Each search follows one path. 33 passes 30, then goes left at 40 into None after visiting it.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            sampleTree,
            '',
            treeContains,
            'print(contains(tree, 40), contains(tree, 10), contains(tree, 12))',
          ),
          'True True False',
          '40 and 10 are stored. 12 goes left at 20, right at 10, then left at 15 into None.',
        ),
        choose(
          'A search reaches None. What does that tell you?',
          [
            'The target is in the other subtree',
            'The target is not stored in the tree',
            'The tree is unbalanced',
            'The target is the smallest key',
          ],
          1,
          'Every comparison ruled out the other side, so the only place the target could be is empty.',
        ),
        choose(
          'Which tuple is a valid strict search tree?',
          [
            '(5, (7, None, None), None)',
            '(5, (2, None, (6, None, None)), None)',
            '(5, (2, None, (4, None, None)), (8, None, None))',
            '(5, None, (5, None, None))',
          ],
          2,
          'Every left-subtree key (2, 4) is below 5 and the right key 8 is above it; the others break the rule somewhere.',
        ),
      ],
    },
    {
      title: 'Find the largest key at most a limit',
      explanation: [
        'For a floor query, walk down from the root. If the current key is at most limit, it is a candidate: record it, then go right, because only larger keys could beat it. If the key is too large, go left, since only smaller keys can qualify.',
        'When the walk reaches None, the last recorded candidate is the answer, or None if no key qualified. Like plain search, this follows a single path.',
      ],
      example: {
        code: lines(
          sampleTree,
          '',
          treeFloor,
          'print(floor(tree, 17), floor(tree, 30), floor(tree, 3))',
        ),
        output: '15 30 None',
        explanation:
          'For 17: 20 is too big, 10 qualifies, then 15 improves it. For 30: 20 then 30 qualify. For 3: every key on the path is too big.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            sampleTree,
            '',
            treeFloor,
            'print(floor(tree, 39), floor(tree, 12))',
          ),
          '30 10',
          'For 39, 20 and 30 qualify but 40 does not. For 12, 10 qualifies and 15 is too big.',
        ),
        choose(
          'The current key is 12 and the limit is 25. What should the floor search do?',
          [
            'Return 12 immediately',
            'Record 12 and continue left',
            'Record 12 and continue right',
            'Skip 12 and continue left',
          ],
          2,
          '12 qualifies, and a better answer can only be larger, which means the right subtree.',
        ),
        choose(
          'The current key is 50 and the limit is 25. Why go left without recording 50?',
          [
            '50 is too large, and only smaller keys can qualify',
            '50 might still be the answer later',
            'The right subtree is always empty',
            'Left keys are larger than 50',
          ],
          0,
          'A key above the limit can never be the floor, and everything to its right is larger still.',
        ),
        predictOutput(
          'Which candidates are recorded on the way down?',
          lines(
            sampleTree,
            '',
            'def floor_trace(node, limit):',
            '    candidates = []',
            '    while node is not None:',
            '        key, left, right = node',
            '        if key <= limit:',
            '            candidates.append(key)',
            '            node = right',
            '        else:',
            '            node = left',
            '    return candidates',
            '',
            'print(floor_trace(tree, 35))',
          ),
          ['[30]', '[20, 30, 40]', '[40, 30]', '[20, 30]'],
          3,
          '20 and 30 qualify and send the search right; 40 is too big, and its left child is None.',
        ),
      ],
    },
    {
      title: 'Relate search time to tree height',
      explanation: [
        'Each step moves one level down, so a search takes O(h) time on a tree of height h, and the loop uses O(1) extra space. A balanced tree with n keys has height about log₂ n.',
        'Search-tree order does not make a tree balanced. Inserting keys in sorted order produces a chain of height n, so a search can take O(n) steps. A loop also avoids Python’s recursion limit on such tall trees.',
      ],
      example: {
        code: lines(
          searchSteps,
          'chain = None',
          'for key in [5, 4, 3, 2, 1]:',
          '    chain = (key, None, chain)',
          'balanced = (3, (2, (1, None, None), None), (4, None, (5, None, None)))',
          'print(steps(chain, 5), steps(balanced, 5))',
        ),
        output: '5 3',
        explanation:
          'Both trees hold 1 through 5 and are valid. The chain has height 5, so finding 5 takes five steps; the shallower tree needs three.',
      },
      questions: [
        choose(
          'What is the worst-case time to search an n-node search tree that is a single chain?',
          ['O(log n)', 'O(1)', 'O(n)', 'O(n²)'],
          2,
          'The chain has height n, and a search may walk all of it.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            searchSteps,
            'chain = None',
            'for key in [8, 7, 6, 5, 4, 3, 2, 1]:',
            '    chain = (key, None, chain)',
            'print(steps(chain, 8), steps(chain, 0))',
          ),
          '8 1',
          '8 is at the bottom of the chain. 0 is smaller than the root 1, whose left child is None, so that search ends after one step.',
        ),
        choose(
          'Keys 1, 2, …, n are inserted in increasing order into an initially empty search tree. What shape results?',
          [
            'A balanced tree of height log n',
            'A chain of height n',
            'A tree with every key at one level',
            'An invalid search tree',
          ],
          1,
          'Each new key is larger than all earlier ones, so it always becomes the right child of the previous key.',
        ),
        choose(
          'Why search a tree that may be a 100,000-node chain with a while loop instead of recursion?',
          [
            'Recursion would give wrong answers',
            'A loop makes the tree balanced',
            'Loops visit fewer nodes than recursion',
            'Deep recursion exceeds Python’s recursion limit',
          ],
          3,
          'A recursive search would nest one call per level, far beyond Python’s default limit of about 1,000.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------- tree traversal
  'cp-tree-children': [
    {
      title: 'Unpack a node and spot an absent child',
      explanation: [
        'A binary node here is a tuple (key, left, right), and an absent child is None. Unpacking with key, left, right = node gives the three parts.',
        'Only None means absent. A child whose key is 0 or negative, or that is itself a leaf like (0, None, None), is a real node.',
      ],
      example: {
        code: lines(
          'node = (7, (0, None, None), None)',
          'key, left, right = node',
          'print(key)',
          'print(left is None, right is None)',
        ),
        output: '7\nFalse True',
        explanation:
          'The left child is a real leaf with key 0; only the right child is absent.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'node = (3, None, (-1, None, None))',
            'key, left, right = node',
            'print(left, right[0])',
          ),
          'None -1',
          'The left child is absent, and the right child is a real node whose key is −1.',
        ),
        choose(
          'In this tuple representation, what marks an absent child?',
          ['A key of 0', 'An empty tuple', 'None', 'A negative key'],
          2,
          'Any tuple is a real node, whatever its key; only None means no child.',
        ),
        predictOutput(
          'How many real children does each node have?',
          lines(
            'def count_children(node):',
            '    key, left, right = node',
            '    return len([child for child in (left, right) if child is not None])',
            '',
            'print(count_children((5, (0, None, None), (2, None, None))), count_children((8, None, None)))',
          ),
          ['1 0', '2 0', '2 2', '0 0'],
          1,
          'Both children of 5 are real even though one has key 0; the leaf 8 has none.',
        ),
        choose(
          'Which node has exactly one real child?',
          [
            '(4, None, None)',
            '(4, (1, None, None), (6, None, None))',
            '(0, None, None)',
            '(4, (0, None, None), None)',
          ],
          3,
          'Its left child is a real node with key 0, and its right child is None.',
        ),
      ],
    },
    {
      title: 'List existing children from left to right',
      explanation: [
        'A comprehension over (left, right) that keeps the children that are not None returns the real children in left-to-right order. A leaf gives [], and so does an absent node, so callers can treat both alike.',
        'Listing children reads only one node. It does not look at grandchildren or deeper descendants; a traversal decides when to visit those.',
      ],
      example: {
        code: lines(
          existingChildren,
          'print(existing_children((1, None, (2, None, None))))',
          'print(existing_children(None))',
        ),
        output: '[(2, None, None)]\n[]',
        explanation:
          'Only the real right child is listed. An absent node has no children at all.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            existingChildren,
            'print(len(existing_children((4, (2, (1, None, None), None), (6, None, None)))))',
          ),
          '2',
          'Only the direct children 2 and 6 are listed; the grandchild 1 is not.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            existingChildren,
            'print([child[0] for child in existing_children((10, (5, None, None), (15, None, None)))])',
          ),
          '[5, 15]',
          'The children keep left-to-right order, and the parent’s own key is not included.',
        ),
        choose(
          'What should existing_children return for a leaf such as (9, None, None)?',
          ['[None, None]', '[9]', 'None', '[]'],
          3,
          'A leaf has no real children, so the list is empty.',
        ),
        choose(
          'existing_children(node) is called on the root of a 100-node tree. How many nodes does it inspect?',
          [
            'Only the root itself',
            'All 100 nodes',
            'The root and every leaf',
            'The nodes on the longest path',
          ],
          0,
          'It unpacks one tuple and checks two fields; descendants are not visited.',
        ),
      ],
    },
  ],
  'cp-preorder-frontier': [
    {
      title: 'Push right before left to visit left first',
      explanation: [
        'A stack returns the most recently pushed entry first. To process a node’s left child before its right child, push the right child first and the left child second.',
        'Skip absent children: a pushed None would later be popped as if it were a node.',
      ],
      example: {
        code: lines(
          'pending = ["old"]',
          'left, right = "L", "R"',
          'if right is not None:',
          '    pending.append(right)',
          'if left is not None:',
          '    pending.append(left)',
          'print(pending)',
          'print(pending.pop())',
        ),
        output: "['old', 'R', 'L']\nL",
        explanation:
          'L is pushed last, so it is on top and processed next; R waits above the older work.',
      },
      questions: [
        choose(
          'Which child should be pushed first so that the left child is processed first?',
          [
            'The left child',
            'Either one',
            'The right child',
            'The parent again',
          ],
          2,
          'The child pushed second sits on top, so the left child must be pushed after the right.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'pending = []',
            'for child in ["A", "B"]:',
            '    pending.append(child)',
            'print(pending.pop(), pending.pop())',
          ),
          'B A',
          'B was pushed last, so it is popped first.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'pending = ["x"]',
            'left, right = "L", None',
            'if right is not None:',
            '    pending.append(right)',
            'if left is not None:',
            '    pending.append(left)',
            'print(pending)',
          ),
          "['x', 'L']",
          'The absent right child is skipped, and L goes on top of the existing work.',
        ),
        choose(
          'The stack holds ["P", "Q", "R2", "L2"] from bottom to top. After two pops, which entry is on top?',
          ['Q', 'P', 'R2', 'L2'],
          0,
          'The pops remove L2 and then R2, leaving Q on top.',
        ),
      ],
    },
    {
      title: 'Produce a preorder with an explicit stack',
      explanation: [
        'Preorder visits a node, then its whole left subtree, then its right subtree. With a stack: pop a node, record its key, then push its right and left children. The left child is popped next, and the right child waits underneath until the left subtree is finished.',
        'Older pending work stays below newer children, so a node’s right subtree is handled only after everything pushed for its left subtree has been popped.',
      ],
      example: {
        code: lines(
          preorderLoop('(1, (2, (4, None, None), None), (3, None, None))'),
          'print(order)',
        ),
        output: '[1, 2, 4, 3]',
        explanation:
          'After 1, the left child 2 is on top; its child 4 is pushed above 3, so the whole left subtree finishes before 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            preorderLoop(
              '(5, (3, (1, None, None), (4, None, None)), (8, None, None))',
            ),
            'print(order)',
          ),
          '[5, 3, 1, 4, 8]',
          'The root comes first, then the entire left subtree 3, 1, 4, then the right child 8.',
        ),
        typeOutput(
          'This loop pushes the left child first. What does it print?',
          lines(
            'tree = (1, (2, (4, None, None), None), (3, None, None))',
            'order = []',
            'stack = [tree]',
            'while stack:',
            '    key, left, right = stack.pop()',
            '    order.append(key)',
            '    if left is not None:',
            '        stack.append(left)',
            '    if right is not None:',
            '        stack.append(right)',
            'print(order)',
          ),
          '[1, 3, 2, 4]',
          'The right child ends on top, so 3 is visited before the left subtree.',
        ),
        choose(
          'After the root is popped and its two children pushed, the stack holds [right, left]. When is right popped?',
          [
            'Immediately after left',
            'Before left',
            'Never',
            'After the whole left subtree is popped',
          ],
          3,
          'Everything pushed while handling the left subtree sits above right, so it all comes off first.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'tree = (1, (2, None, None), (3, None, None))',
            'stack = [tree]',
            'while stack:',
            '    key, left, right = stack.pop()',
            '    if right is not None:',
            '        stack.append(right)',
            '    if left is not None:',
            '        stack.append(left)',
            '    print(key, [node[0] for node in stack])',
          ),
          '1 [3, 2]\n2 [3]\n3 []',
          'After 1, the stack is [3, 2] with 2 on top; popping 2 leaves [3]; then 3 is popped.',
        ),
      ],
    },
  ],
  'cp-postorder-combine': [
    {
      title: 'Height is one more than the taller child',
      explanation: [
        'Measure height in nodes: the number of nodes on the longest downward path from a node to a leaf. Counting an absent child as height 0, a real node’s height is 1 + max(left_height, right_height), so a leaf has height 1.',
        'The max matters: only the taller side determines the longest path. Adding the two heights would count nodes on two different paths.',
      ],
      example: {
        code: lines(
          combineHeight,
          'print(combine_height(2, 4))',
          'print(combine_height(0, 0))',
          'print(combine_height(3, 0))',
        ),
        output: '5\n1\n4',
        explanation:
          'The taller child decides each result: 4 + 1, then a leaf’s 0 + 1, then 3 + 1.',
      },
      questions: [
        typeNumber(
          'The left child has height 3 and the right child is absent. What is the parent’s height?',
          4,
          'The absent child counts as 0, so the height is 1 + max(3, 0) = 4.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            combineHeight,
            'print(combine_height(1, 1), combine_height(4, 2))',
          ),
          '2 5',
          '1 + max(1, 1) = 2 and 1 + max(4, 2) = 5.',
        ),
        choose(
          'Under this convention, which pair of child heights does a leaf receive?',
          ['(0, 0)', '(1, 1)', '(None, None)', '(1, 0)'],
          0,
          'Both children are absent and count as height 0, which gives the leaf height 1.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def wrong_height(left_height, right_height):',
            '    return 1 + left_height + right_height',
            '',
            'print(wrong_height(2, 2), 1 + max(2, 2))',
          ),
          '5 3',
          'Adding counts nodes from both subtrees, which no single downward path contains; the max gives the true height 3.',
        ),
      ],
    },
    {
      title: 'Combine a parent only after its children',
      explanation: [
        'A parent’s height needs both child heights, so the children must be finished first. Processing children before their parent is postorder.',
        'Working bottom-up through a small tree, leaves get 1, their parents get 2 or more, and the root is finished last.',
      ],
      example: {
        code: lines(
          combineHeight,
          '# a has children b and c; b has one child d',
          'd = combine_height(0, 0)',
          'c = combine_height(0, 0)',
          'b = combine_height(d, 0)',
          'a = combine_height(b, c)',
          'print(d, c, b, a)',
        ),
        output: '1 1 2 3',
        explanation:
          'd and c are leaves. b can be combined once d is known, and a only after both b and c.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            combineHeight,
            '# r has children x and y; y has children p and q; p has child s',
            's = combine_height(0, 0)',
            'p = combine_height(s, 0)',
            'q = combine_height(0, 0)',
            'y = combine_height(p, q)',
            'x = combine_height(0, 0)',
            'r = combine_height(x, y)',
            'print(r)',
          ),
          '4',
          'The longest path is r, y, p, s: four nodes.',
        ),
        choose(
          'Why can’t the root’s height be computed first?',
          [
            'The root has no key',
            'It needs its children’s heights, which are unknown yet',
            'Python evaluates trees from the bottom',
            'Roots always have height 1',
          ],
          1,
          'The combination uses both child heights, so they must already be computed.',
        ),
        choose(
          'Node a has children b and c, and b has child d. In which order can their heights be computed?',
          ['d, b, c, a', 'a, b, c, d', 'a, b, d, c', 'b, d, a, c'],
          0,
          'Each node comes after all of its children: d before b, and b and c before a.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            combineHeight,
            'height = 0',
            'for _ in range(4):',
            '    height = combine_height(height, 0)',
            'print(height)',
          ),
          '4',
          'Each step adds one parent above the previous chain, so four nodes give height 4.',
        ),
      ],
    },
  ],
  'cp-tree-traversal': [
    {
      title: 'Choose postorder when a parent depends on its children',
      explanation: [
        'A traversal order should follow the computation’s dependencies. A subtree size is 1 plus the sizes of all child subtrees, so each parent can be finished only after its children: postorder.',
        'Here a rooted tree is given as children[u], the list of u’s child vertices, with root 0. A short recursive version shows the dependency directly: each call returns only after all of its children have returned.',
      ],
      example: {
        code: lines(
          'children = [[1, 2], [3], [], []]',
          '',
          'def size(vertex):',
          '    total = 1',
          '    for child in children[vertex]:',
          '        total += size(child)',
          '    print(vertex, total)',
          '    return total',
          '',
          'size(0)',
        ),
        output: '3 1\n1 2\n2 1\n0 4',
        explanation:
          'Each vertex prints only after its children return, so 3 finishes before 1, and the root 0 finishes last with size 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'children = [[1], [2, 3], [], []]',
            '',
            'def size(vertex):',
            '    total = 1',
            '    for child in children[vertex]:',
            '        total += size(child)',
            '    print(vertex, total)',
            '    return total',
            '',
            'size(0)',
          ),
          [
            '0 4\n1 3\n2 1\n3 1',
            '2 1\n3 1\n1 3\n0 4',
            '2 1\n3 1\n1 2\n0 3',
            '3 1\n2 1\n1 3\n0 4',
          ],
          1,
          'Leaves 2 and 3 finish first, in child order; then 1 with size 3, and the root last with 4.',
        ),
        choose(
          'Which computation needs postorder rather than preorder?',
          [
            'Counting the nodes in every subtree',
            'Writing each node’s depth from the root',
            'Copying the root’s label to every node',
            'Listing nodes as they are first reached',
          ],
          0,
          'A subtree count needs the children’s counts first; the others flow from the root downward.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'children = [[1, 2, 3], [], [4], [], []]',
            'sizes = [0] * len(children)',
            '',
            'def fill(vertex):',
            '    sizes[vertex] = 1',
            '    for child in children[vertex]:',
            '        fill(child)',
            '        sizes[vertex] += sizes[child]',
            '',
            'fill(0)',
            'print(sizes)',
          ),
          '[5, 1, 2, 1, 1]',
          'Vertex 2 owns itself and 4; the root adds 1 + 1 + 2 + 1 = 5.',
        ),
        typeNumber(
          'Root 0 has children 1 and 2. Vertex 1 has 4 descendants, and vertex 2 is a leaf. What is the size of vertex 0’s subtree?',
          7,
          'Vertex 1’s subtree has 5 vertices, vertex 2’s has 1, and the root adds itself: 7.',
        ),
      ],
    },
    {
      title: 'Replace recursion with completion events',
      explanation: [
        'A very tall tree, such as a 100,000-vertex chain, would exceed Python’s recursion limit. An explicit stack of (vertex, ready) events avoids that. Popping (v, False) pushes (v, True) first and then (child, False) for each child; because the stack is last in, first out, every child’s work finishes before (v, True) is popped.',
        'Popping (v, True) combines the children’s finished sizes: 1 plus the sum of sizes[child] over v’s children.',
      ],
      example: {
        code: lines(
          eventSizes('[[1, 2], [], [3], []]', 'print("done", vertex)'),
          'print(sizes)',
        ),
        output: 'done 3\ndone 2\ndone 1\ndone 0\n[4, 1, 2, 1]',
        explanation:
          'Child 2 was pushed last, so its subtree finishes first. The root’s completion event was pushed before every child event, so it is popped last.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(eventSizes('[[1], [2], []]'), 'print(sizes)'),
          '[3, 2, 1]',
          'In the chain 0 → 1 → 2, vertex 2 finishes first with 1, then 1 with 2, then the root with 3.',
        ),
        choose(
          'Why is (vertex, True) pushed before the children’s (child, False) events?',
          [
            'So it is popped after all of the children’s work',
            'So the parent is finished first',
            'So children are visited in sorted order',
            'So each vertex is pushed only once',
          ],
          0,
          'Everything pushed later, including all descendant events, is popped before it.',
        ),
        predictOutput(
          'In what order are the vertices finished?',
          lines(eventSizes('[[1, 2], [], []]', 'print(vertex)')),
          ['0\n1\n2', '1\n2\n0', '2\n1\n0', '0\n2\n1'],
          2,
          'Child 2 is pushed last and finishes first, then child 1, and the root last.',
        ),
        choose(
          'How many stack events does each vertex cause in this traversal?',
          [
            'One',
            'One per descendant',
            'One per edge in the whole tree',
            'Two: a first visit and a completion',
          ],
          3,
          'Each vertex is pushed once as (v, False) and once as (v, True).',
        ),
      ],
    },
    {
      title: 'Rely on the tree contract and linear cost',
      explanation: [
        'Each vertex is pushed and popped twice, and each child list is scanned once when expanded and once when combined, so the traversal takes O(n) time and O(n) extra space for the stack and the sizes.',
        'That bound relies on a real rooted tree: root 0, one parent for every other vertex, every vertex reachable, no cycles. A vertex listed under two parents is counted twice, and a cycle would push events forever.',
      ],
      example: {
        code: lines(eventSizes('[[1, 2], [3], [3], []]'), 'print(sizes)'),
        output: '[5, 2, 2, 1]',
        explanation:
          'Vertex 3 is listed under both 1 and 2, so it is processed twice and counted in both subtrees: the root reports 5 vertices in a 4-vertex graph.',
      },
      questions: [
        choose(
          'For a valid tree with n vertices, how many stack events does the iterative traversal pop?',
          ['n', '2n', 'n²', 'n log n'],
          1,
          'Every vertex contributes a first-visit event and a completion event.',
        ),
        choose(
          'What is the time complexity of computing all subtree sizes this way?',
          ['O(n²)', 'O(n log n)', 'O(n)', 'O(h), the height'],
          2,
          'A constant number of events per vertex and two scans of each child list make linear work.',
        ),
        predictOutput(
          'How many events are popped?',
          lines(
            eventSizes('[[1, 2, 3], [], [], []]', '', 'events += 1'),
            'print(events)',
          ),
          ['4', '7', '16', '8'],
          3,
          'Four vertices each cause two events, a first visit and a completion.',
        ),
        choose(
          'children = [[1], [0]] is passed in, so vertices 0 and 1 list each other as children. What happens?',
          [
            'The stack never empties',
            'Both sizes become 2',
            'The root size is 1',
            'Vertex 1 is skipped',
          ],
          0,
          'Expanding 0 pushes 1, and expanding 1 pushes 0 again, so new events appear forever.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------------- graph models
  'cp-vertex-lists': [
    {
      title: 'Give every vertex its own neighbor list',
      explanation: [
        'An adjacency list for vertices 0 through n − 1 is a list of n neighbor lists: graph[v] lists v’s neighbors. Every vertex gets a list, even one with no edges, so len(graph) is the number of vertices.',
        'An isolated vertex is represented by an empty list at its own index, not by leaving it out.',
      ],
      example: {
        code: lines(
          'n = 4',
          'graph = [[] for _ in range(n)]',
          'print(graph)',
          'print(len(graph), graph[3])',
        ),
        output: '[[], [], [], []]\n4 []',
        explanation:
          'Four vertices give four lists before any edge exists; vertex 3’s list is simply empty.',
      },
      questions: [
        typeNumber(
          'A graph has vertices 0 through 6 and only two edges. How many neighbor lists does its adjacency list contain?',
          7,
          'There is one list per vertex, and 0 through 6 is seven vertices, whatever the edges are.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'graph = [[] for _ in range(3)]',
            'graph[1].append(2)',
            'print(graph)',
            'print(len(graph[0]), len(graph[1]))',
          ),
          '[[], [2], []]\n0 1',
          'Only vertex 1’s list receives the neighbor; the other lists stay empty but present.',
        ),
        choose(
          'Vertex 4 has no edges. How is it represented in graph?',
          [
            'It is left out of graph',
            'graph[4] is None',
            'graph[4] is an empty list',
            'graph[4] is [4]',
          ],
          2,
          'Every vertex keeps its own index; having no neighbors just means an empty list.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'graph = [[] for _ in range(4)]',
            'graph[0].append(1)',
            'graph[0].append(3)',
            'graph[2].append(0)',
            'print([len(neighbors) for neighbors in graph])',
          ),
          '[2, 0, 1, 0]',
          'There is one length per vertex, including the empty lists of vertices 1 and 3.',
        ),
      ],
    },
    {
      title: 'Create independent inner lists',
      explanation: [
        '[[] for _ in range(n)] evaluates the inner [] once per vertex, creating n separate lists. [[]] * n instead repeats one list object n times, so every index names the same list.',
        'With the shared version, appending a neighbor to one vertex makes it appear at every vertex.',
      ],
      example: {
        code: lines(
          'shared = [[]] * 3',
          'shared[0].append(2)',
          'fresh = [[] for _ in range(3)]',
          'fresh[0].append(2)',
          'print(shared)',
          'print(fresh)',
        ),
        output: '[[2], [2], [2]]\n[[2], [], []]',
        explanation:
          'All three entries of shared are one list, so the single append shows up three times.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines('graph = [[]] * 2', 'graph[1].append(0)', 'print(graph)'),
          '[[0], [0]]',
          'Both entries are the same list, so appending through graph[1] changes graph[0] too.',
        ),
        choose(
          'Which construction gives n independent empty lists?',
          ['[[]] * n', '[] * n', '[[] for _ in range(n)]', 'list([] * n)'],
          2,
          'The comprehension creates a new list on every iteration; [] * n is just an empty list.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'graph = [[] for _ in range(3)]',
            'graph[2].append(1)',
            'graph[2].append(0)',
            'print(graph[0], graph[2])',
          ),
          '[] [1, 0]',
          'The lists are independent, so only vertex 2 changes, keeping its neighbors in append order.',
        ),
        typeNumber(
          'After graph = [[]] * 4 and graph[0].append(3), how many vertices appear to have neighbor 3?',
          4,
          'All four indices name one shared list, so every vertex appears to have neighbor 3.',
        ),
      ],
    },
  ],
  'cp-directed-edge': [
    {
      title: 'Record u → v at u only',
      explanation: [
        'A directed edge u → v means v can be reached from u in one step. Store it by appending v to graph[u]. Nothing is added to graph[v], because the edge cannot be followed backward.',
        'Parallel edges and self-loops are kept as given: two copies of 0 → 1 put 1 into graph[0] twice, and 2 → 2 puts 2 into graph[2].',
      ],
      example: {
        code: lines(
          'graph = [[] for _ in range(3)]',
          'for u, v in [(0, 1), (2, 0), (0, 1)]:',
          '    graph[u].append(v)',
          'print(graph)',
        ),
        output: '[[1, 1], [], [0]]',
        explanation:
          'The repeated edge 0 → 1 is stored twice, and 2 → 0 adds 0 only to vertex 2’s list.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'graph = [[] for _ in range(3)]',
            'for u, v in [(1, 2), (2, 1), (1, 0)]:',
            '    graph[u].append(v)',
            'print(graph)',
          ),
          '[[], [2, 0], [1]]',
          'Each edge adds only its destination to its source’s list, in input order; nothing is added to vertex 0.',
        ),
        choose(
          'Which list receives a new entry for the directed edge 3 → 5?',
          [
            'graph[5] gets 3',
            'Both lists get the other vertex',
            'graph[3] gets 5',
            'graph[3] gets 3',
          ],
          2,
          'The edge is followed from 3, so 3’s outgoing list records the destination 5.',
        ),
        choose(
          'A graph has only the directed edge 0 → 1. Can vertex 1 reach vertex 0 in one step?',
          [
            'No, the edge leads only from 0 to 1',
            'Yes, edges work both ways',
            'Only if 0 → 1 is listed twice',
            'Only when the graph has two vertices',
          ],
          0,
          'A directed edge is one-way; reaching 0 from 1 would need a separate edge 1 → 0.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'graph = [[] for _ in range(2)]',
            'for u, v in [(1, 1), (0, 1)]:',
            '    graph[u].append(v)',
            'print(graph, len(graph[1]))',
          ),
          '[[1], [1]] 1',
          'The self-loop 1 → 1 adds 1 once to graph[1]; 0 → 1 adds 1 to graph[0].',
        ),
      ],
    },
    {
      title: 'Return a changed copy of the graph',
      explanation: [
        'A function that adds an edge but must leave its input unchanged needs a copy of every inner list: [neighbors.copy() for neighbors in graph]. graph.copy() alone copies only the outer list, so the inner lists are still shared.',
        'After copying, append to the copy’s list for u; the original graph keeps its old neighbors.',
      ],
      example: {
        code: lines(
          addDirected,
          'original = [[1], []]',
          'changed = add_directed(original, 1, 0)',
          'print(original)',
          'print(changed)',
        ),
        output: '[[1], []]\n[[1], [0]]',
        explanation:
          'The append goes into the copy of vertex 1’s list, so original is unchanged.',
      },
      questions: [
        typeOutput(
          'This version copies only the outer list. What does it print?',
          lines(
            'def add_directed(graph, u, v):',
            '    result = graph.copy()',
            '    result[u].append(v)',
            '    return result',
            '',
            'original = [[], []]',
            'add_directed(original, 0, 1)',
            'print(original)',
          ),
          '[[1], []]',
          'result[0] is the same inner list as original[0], so the append changes the caller’s graph.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            addDirected,
            'original = [[2], [], []]',
            'a = add_directed(original, 0, 2)',
            'b = add_directed(original, 2, 1)',
            'print(a, b)',
          ),
          '[[2, 2], [], []] [[2], [], [1]]',
          'Each call copies the unchanged original, so a keeps the parallel edge and b does not see it.',
        ),
        choose(
          'Why does graph.copy() not protect the caller’s graph when an edge is appended?',
          [
            'It copies only the outer list; inner lists stay shared',
            'It reverses every edge',
            'It removes duplicate edges',
            'It raises an error on nested lists',
          ],
          0,
          'The new outer list still holds the original inner lists, and append changes one of them.',
        ),
        choose(
          'Parallel edges must be kept. The graph already has 0 → 1, and 0 → 1 is added again. What is result[0]?',
          ['[1]', '[0, 1]', '[1, 0]', '[1, 1]'],
          3,
          'Each copy of the edge is stored, so vertex 0 lists 1 twice.',
        ),
      ],
    },
  ],
  'cp-undirected-edge': [
    {
      title: 'Store both incidences of an undirected edge',
      explanation: [
        'An undirected edge {u, v} can be crossed in either direction, so it is stored twice: v in graph[u] and u in graph[v]. Each endpoint then lists the other as a neighbor.',
        'The length of graph[v] is v’s degree, the number of edge ends at v.',
      ],
      example: {
        code: lines(
          undirectedBuild(4, '[(0, 1), (1, 2)]'),
          'print(graph)',
          'print(len(graph[1]))',
        ),
        output: '[[1], [0, 2], [1], []]\n2',
        explanation:
          'Vertex 1 touches both edges, so its degree is 2; vertex 3 touches none.',
      },
      questions: [
        typeNumber(
          'How many entries does one undirected edge between different vertices add to the adjacency lists?',
          2,
          'One entry at each endpoint.',
        ),
        typeOutput(
          'What does this program print?',
          lines(undirectedBuild(3, '[(2, 0), (0, 1)]'), 'print(graph)'),
          '[[2, 1], [0], [0]]',
          'Vertex 0 gains 2 and then 1, in edge order; vertices 1 and 2 each gain 0.',
        ),
        predictOutput(
          'What are the degrees?',
          lines(
            undirectedBuild(4, '[(0, 1), (0, 2), (0, 3)]'),
            'print([len(neighbors) for neighbors in graph])',
          ),
          ['[3, 0, 0, 0]', '[1, 1, 1, 1]', '[6, 1, 1, 1]', '[3, 1, 1, 1]'],
          3,
          'Vertex 0 is an endpoint of all three edges, and each other vertex of one.',
        ),
        typeNumber(
          'An undirected graph has 5 edges between distinct vertices. What is the total length of all neighbor lists?',
          10,
          'Each edge contributes two entries, one per endpoint.',
        ),
      ],
    },
    {
      title: 'Keep self-loops and repeated edges',
      explanation: [
        'Under this course’s contract, an undirected self-loop {v, v} appends v to graph[v] twice, once for each end, and a repeated edge appends another pair. Nothing is deduplicated.',
        'So the total length of all neighbor lists is always twice the number of undirected edges, counting every copy.',
      ],
      example: {
        code: lines(
          addUndirected,
          'print(add_undirected([[]], 0, 0))',
          'print(add_undirected([[1], [0]], 0, 1))',
        ),
        output: '[[0, 0]]\n[[1, 1], [0, 0]]',
        explanation:
          'The self-loop puts both of its ends in vertex 0’s list. The repeated edge adds a second pair beside the first.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(addUndirected, 'print(add_undirected([[], []], 1, 1))'),
          '[[], [1, 1]]',
          'Both appends target vertex 1’s list, so 1 appears there twice.',
        ),
        typeNumber(
          'An undirected graph has edges {0, 1}, {0, 1} and {2, 2}. What is the total length of all neighbor lists?',
          6,
          'Three edges, each counted with two ends, give 6 entries.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            undirectedBuild(2, '[(0, 1), (1, 0)]'),
            'print(len(graph[0]), len(graph[1]))',
          ),
          '2 2',
          '(1, 0) is the same undirected edge again, so it adds a second pair rather than being merged.',
        ),
        choose(
          'Why does a self-loop add two entries to the same list under this contract?',
          [
            'Both of the edge’s ends are at that vertex',
            'Self-loops are directed edges',
            'The vertex is its own parent',
            'Python duplicates every append',
          ],
          0,
          'Each undirected edge contributes one entry per end, and here both ends are the same vertex.',
        ),
      ],
    },
  ],
  'cp-graph-models': [
    {
      title: 'Build adjacency lists from n and an edge list',
      explanation: [
        'A graph input usually gives n and a list of edges. Allocate n independent lists first, then add each edge in input order: v at u for a directed edge, both directions for an undirected one.',
        'n is part of the input because an edge list cannot show isolated vertices: a vertex that touches no edge would otherwise be missing.',
      ],
      example: {
        code: lines(
          makeNeighbors,
          'edges = [(0, 1), (1, 2)]',
          'print(make_neighbors(4, edges, False))',
          'print(make_neighbors(4, edges, True))',
        ),
        output: '[[1], [0, 2], [1], []]\n[[1], [2], [], []]',
        explanation:
          'The same edges give symmetric lists when undirected and one-way lists when directed; isolated vertex 3 exists in both.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            makeNeighbors,
            'edges = [(2, 0), (2, 1)]',
            'print(make_neighbors(3, edges, True))',
            'print(make_neighbors(3, edges, False))',
          ),
          '[[], [], [0, 1]]\n[[2], [2], [0, 1]]',
          'Directed, only vertex 2 has outgoing entries. Undirected, 0 and 1 also list 2.',
        ),
        choose(
          'The input is n = 5 with the single edge (0, 1). Which vertices must the adjacency list include?',
          [
            'Only 0',
            'Only 0 and 1',
            'All five, including 2, 3 and 4',
            'Only vertices of odd degree',
          ],
          2,
          'n says the graph has five vertices; three of them are isolated but still exist.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            makeNeighbors,
            'graph = make_neighbors(6, [(1, 2)], False)',
            'print(len(graph), graph[5])',
          ),
          '6 []',
          'Six lists are allocated from n, and vertex 5 touches no edge, so its list is empty.',
        ),
        choose(
          'A directed input lists (4, 1) and then (4, 3). What is neighbors[4]?',
          ['[3, 1]', '[]', '[4, 1, 4, 3]', '[1, 3]'],
          3,
          'Both edges leave 4, and their destinations are appended in input order.',
        ),
      ],
    },
    {
      title: 'State direction and multiplicity before counting',
      explanation: [
        'The same edge list gives different graphs under different contracts. With directed edges, len(neighbors[v]) is v’s out-degree. With undirected edges kept with multiplicity, it is v’s degree, and an undirected self-loop counts 2.',
        'Totals follow: a directed graph’s lists hold m entries in all, an undirected graph’s hold 2m. Deciding these rules before counting avoids answers that are off by a factor of two.',
      ],
      example: {
        code: lines(
          makeNeighbors,
          'edges = [(0, 1), (0, 1), (2, 2)]',
          'directed = make_neighbors(3, edges, True)',
          'undirected = make_neighbors(3, edges, False)',
          'print([len(x) for x in directed])',
          'print([len(x) for x in undirected])',
        ),
        output: '[2, 0, 1]\n[2, 2, 2]',
        explanation:
          'Directed, vertex 1 has no outgoing edges and the self-loop counts once. Undirected, each copy of {0, 1} reaches 1, and the self-loop counts twice.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            makeNeighbors,
            'graph = make_neighbors(3, [(0, 2), (1, 2), (2, 2)], False)',
            'print([len(x) for x in graph])',
          ),
          '[1, 1, 4]',
          'Vertex 2 is an end of both ordinary edges and both ends of its self-loop: 4 entries.',
        ),
        choose(
          'An undirected graph has m edges, kept with multiplicity. How many entries do all neighbor lists hold together?',
          ['m', 'm − 1', '2m', 'm²'],
          2,
          'Every edge, including a self-loop, contributes two entries.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            makeNeighbors,
            'edges = [(0, 1), (1, 2), (2, 0)]',
            'directed = make_neighbors(3, edges, True)',
            'undirected = make_neighbors(3, edges, False)',
            'print(sum([len(x) for x in directed]), sum([len(x) for x in undirected]))',
          ),
          '3 6',
          'Three directed edges give 3 entries; as undirected edges they give twice that.',
        ),
        choose(
          'Which representation answers “is (u, v) an edge?” in O(1) but needs O(n²) space?',
          [
            'An adjacency matrix',
            'Adjacency lists',
            'An edge list',
            'A list of degrees',
          ],
          0,
          'A matrix has a cell for every vertex pair, which allows direct lookup at a quadratic space cost.',
        ),
      ],
    },
    {
      title: 'Build in O(n + m) without aliasing',
      explanation: [
        'Allocating n lists costs O(n), and each of the m edges is one or two appends, so construction takes O(n + m) time and the lists use O(n + m) space. An n × n matrix would use O(n²) space even for a sparse graph.',
        'The inner lists must be independent. Built with [[]] * n, every vertex shares one list, so each edge seems to touch every vertex.',
      ],
      example: {
        code: lines(
          'bad = [[]] * 3',
          'good = [[] for _ in range(3)]',
          'for u, v in [(0, 1)]:',
          '    bad[u].append(v)',
          '    bad[v].append(u)',
          '    good[u].append(v)',
          '    good[v].append(u)',
          'print(bad)',
          'print(good)',
        ),
        output: '[[1, 0], [1, 0], [1, 0]]\n[[1], [0], []]',
        explanation:
          'Both appends to bad go into its one shared list, which every vertex then shows.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'bad = [[]] * 2',
            'for u, v in [(0, 1)]:',
            '    bad[u].append(v)',
            'print(bad, len(bad[1]))',
          ),
          '[[1], [1]] 1',
          'The directed edge is appended once, but both indices show the same list.',
        ),
        choose(
          'A graph has n = 100,000 vertices and m = 200,000 edges. Why prefer adjacency lists over a matrix?',
          [
            'Lists use O(n + m) space instead of O(n²)',
            'Lists answer every edge query in O(1)',
            'A matrix cannot store directed edges',
            'Lists keep edges sorted automatically',
          ],
          0,
          'A matrix would need 10¹⁰ cells, while the lists hold only a few hundred thousand entries.',
        ),
        choose(
          'What is the time to build adjacency lists for n vertices and m edges?',
          ['O(n · m)', 'O(n²)', 'O(m log m)', 'O(n + m)'],
          3,
          'Allocating the lists is O(n), and each edge costs a constant number of appends.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'good = [[] for _ in range(5)]',
            'for v in range(1, 5):',
            '    good[0].append(v)',
            '    good[v].append(0)',
            'print(len(good[0]), len(good[4]))',
          ),
          '4 1',
          'Vertex 0 is joined to four vertices; vertex 4 only to 0.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------ depth-first search
  'cp-discover-once': [
    {
      title: 'Mark a vertex when it is scheduled',
      explanation: [
        'A search keeps seen, a set of discovered vertices, and pending, the work still to do. Add a vertex to seen at the moment it is pushed onto pending, not later when it is processed.',
        'Then a second edge to the same vertex finds it already in seen and schedules nothing, even if the first copy has not been processed yet.',
      ],
      example: {
        code: lines(
          discoverLoop('{0}', '[0]', '[1, 2, 1]'),
          'print(pending)',
          'print(len(seen))',
        ),
        output: '[0, 1, 2]\n3',
        explanation: 'The second 1 is already in seen, so it adds no work.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(discoverLoop('{0}', '[0]', '[3, 3, 0, 4]'), 'print(pending)'),
          '[0, 3, 4]',
          'The repeated 3 and the start 0 are already in seen, so only 3 and 4 are added once.',
        ),
        choose(
          'When should this search add a neighbor to seen?',
          [
            'When it is pushed onto pending',
            'When it is popped from pending',
            'After the whole search ends',
            'Only if it has no neighbors',
          ],
          0,
          'Marking at push time stops any later edge from scheduling the same vertex again.',
        ),
        choose(
          'Vertex 4 is already in seen, and another edge reaches it. What does discovery do?',
          [
            'Pushes 4 again',
            'Removes 4 from seen',
            'Adds no new work',
            'Clears pending',
          ],
          2,
          'A seen vertex has already been scheduled once, which is all it needs.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'seen = set()',
            'pending = []',
            'pushes = 0',
            'for vertex in [5, 2, 5, 2, 7]:',
            '    if vertex not in seen:',
            '        seen.add(vertex)',
            '        pending.append(vertex)',
            '        pushes += 1',
            'print(pushes, len(seen))',
          ),
          '3 3',
          'Only the first occurrence of each of 5, 2 and 7 is pushed.',
        ),
      ],
    },
    {
      title: 'Marking at pop time schedules duplicates',
      explanation: [
        'If seen is updated only when a vertex is popped, several edges can push the same vertex before its first copy is popped. pending then holds duplicate work.',
        'Each duplicate must later be popped and skipped, and in a dense graph pending can grow with the number of edges instead of the number of vertices.',
      ],
      example: {
        code: lines(popTimeMarking('[[1, 2], [], [1]]'), 'print(pushed)'),
        output: '[1, 2, 1]',
        explanation:
          'Vertex 1 is still waiting when 2 is processed, and it is not in seen yet, so it is pushed a second time.',
      },
      questions: [
        typeOutput(
          'This version marks on push. What does it print?',
          lines(
            'graph = [[1, 2], [], [1]]',
            'seen = {0}',
            'pending = [0]',
            'pushed = []',
            'while pending:',
            '    vertex = pending.pop()',
            '    for neighbor in graph[vertex]:',
            '        if neighbor not in seen:',
            '            seen.add(neighbor)',
            '            pending.append(neighbor)',
            '            pushed.append(neighbor)',
            'print(pushed)',
          ),
          '[1, 2]',
          '1 is marked when it is first pushed, so the edge from 2 finds it in seen.',
        ),
        typeNumber(
          'Vertices 4, 5 and 6 all have an edge to 9, and seen is updated only at pop time. If 4, 5 and 6 are expanded before 9 is popped, how many copies of 9 can be pending?',
          3,
          'Each of the three expansions sees 9 as unseen and pushes it.',
        ),
        predictOutput(
          'How many pushes does pop-time marking make here?',
          lines(popTimeMarking('[[1, 1, 1], []]'), 'print(len(pushed))'),
          ['1', '0', '2', '3'],
          3,
          'The three parallel edges are scanned before 1 is popped, so 1 is pushed three times.',
        ),
        choose(
          'With marking at push time, how many times can one vertex enter pending during the whole search?',
          [
            'At most once',
            'Once per incoming edge',
            'Once per neighbor it has',
            'Twice',
          ],
          0,
          'After its first push it is in seen, and every later check skips it.',
        ),
      ],
    },
  ],
  'cp-dfs-frontier': [
    {
      title: 'Take the newest pending vertex',
      explanation: [
        'Depth-first search keeps its pending work on a stack and always takes the newest entry with pop(). The most recently discovered branch is continued before older pending branches.',
        'An empty stack means no work remains; check it before popping.',
      ],
      example: {
        code: lines(
          takeDepthFirst,
          'print(take_depth_first([0, 3, 1]))',
          'print(take_depth_first([]))',
        ),
        output: '(1, [0, 3])\n(None, [])',
        explanation:
          '1 was pushed last, so it is taken first. An empty stack has no next vertex.',
      },
      questions: [
        typeNumber(
          'Pending is [0, 4, 2], oldest first. Which vertex does a depth-first stack take next?',
          2,
          'A stack takes the newest entry, which is at the right end.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            takeDepthFirst,
            'print(take_depth_first([5]))',
            'print(take_depth_first([7, 0]))',
          ),
          '(5, [])\n(0, [7])',
          'The newest entry is removed each time; vertex 0 is a real vertex, not an empty marker.',
        ),
        predictOutput(
          'In what order is work taken?',
          lines(
            'pending = [1]',
            'order = []',
            'pending.append(2)',
            'pending.append(3)',
            'order.append(pending.pop())',
            'pending.append(4)',
            'order.append(pending.pop())',
            'order.append(pending.pop())',
            'print(order)',
          ),
          ['[1, 2, 3]', '[3, 4, 2]', '[3, 2, 4]', '[3, 4, 1]'],
          1,
          '3 is newest, then the newly pushed 4, then 2, which was waiting below it.',
        ),
        choose(
          'Which operation selects the next vertex from a depth-first frontier stored as a list?',
          ['pending.pop(0)', 'pending[0]', 'min(pending)', 'pending.pop()'],
          3,
          'pop() removes the newest entry; pop(0) would make the frontier a queue.',
        ),
      ],
    },
    {
      title: 'Depth-first order is not distance order',
      explanation: [
        'The stack’s next vertex depends only on when it was pushed, not on how far it is from the start. DFS can reach a vertex along a long path before it ever expands a shorter one.',
        'So DFS answers whether a vertex is reachable, but the path by which it first reaches a vertex need not have the fewest edges.',
      ],
      example: {
        code: lines(depthLabels('[[1, 2], [3], [4], [], [3]]'), 'print(depth)'),
        output: '[0, 1, 1, 3, 2]',
        explanation:
          'DFS reaches 3 through 0, 2, 4 before it expands 1, so it records 3 edges even though 0 → 1 → 3 uses only 2.',
      },
      questions: [
        choose(
          'A depth-first search first reaches vertex 7 along a 5-edge path. What can you conclude about 7’s fewest-edge distance?',
          ['It is exactly 5', 'It is at most 5', 'It is at least 5', 'It is 1'],
          1,
          'A 5-edge path exists, but DFS gives no guarantee that no shorter path exists.',
        ),
        predictOutput(
          'What depth does DFS record for vertex 4?',
          lines(depthLabels('[[1, 2], [4], [3], [4], []]'), 'print(depth[4])'),
          ['2', '1', '3', '4'],
          2,
          'The stack expands 2 and then 3 before 1, so 4 is first reached by 0, 2, 3, 4, although 0, 1, 4 is shorter.',
        ),
        choose(
          'What does DFS from one start vertex reliably determine?',
          [
            'Which vertices are reachable from it',
            'The fewest edges to each vertex',
            'The cheapest weighted route',
            'A topological order of the graph',
          ],
          0,
          'Every reachable vertex is eventually discovered, but the discovery paths carry no distance guarantee.',
        ),
        choose(
          'Pending holds a vertex discovered from the start and, on top, one discovered three edges deep. Which does a depth-first stack take next?',
          [
            'The one at depth 1',
            'Whichever has the smaller label',
            'Both at once',
            'The deeper one, pushed last',
          ],
          3,
          'Depth does not matter to a stack; the most recently pushed entry comes off first.',
        ),
      ],
    },
  ],
  'cp-dfs-cycle-guard': [
    {
      title: 'Skip neighbors that were already discovered',
      explanation: [
        'While scanning a vertex’s neighbors, schedule only those not yet in seen. An edge back to a discovered vertex, a self-loop, or a second copy of a parallel edge then creates no new work.',
        'Mark each new neighbor immediately, so a repeated entry later in the same neighbor list is skipped too.',
      ],
      example: {
        code: lines(
          unseenNeighbors,
          'print(unseen_neighbors([4, 1, 4, 5, 1], {1}))',
        ),
        output: '[4, 5]',
        explanation:
          '1 was already seen, and the second 4 is skipped because 4 was marked at its first occurrence.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            unseenNeighbors,
            'print(unseen_neighbors([2, 2], set()))',
            'print(unseen_neighbors([3], {3}))',
          ),
          '[2]\n[]',
          'The parallel edge yields 2 once; 3 is already discovered, so it yields nothing.',
        ),
        choose(
          'Vertex 6 is being expanded, and its neighbor list contains 6 itself. Why is no new work scheduled for it?',
          [
            'Self-loops are deleted from the input',
            '6 was put in seen when it was scheduled',
            'A vertex cannot be its own neighbor',
            'The check skips the last neighbor',
          ],
          1,
          'A vertex is marked before it is expanded, so its own self-loop finds it already seen.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            unseenNeighbors,
            'print(unseen_neighbors([5, 0, 5, 0, 6], {6}))',
          ),
          '[5, 0]',
          'First occurrences of 5 and 0 are kept in order; repeats and the seen 6 are skipped.',
        ),
        choose(
          'Which entries in a neighbor scan create new pending work?',
          [
            'First occurrences of vertices not yet in seen',
            'Every entry, in order',
            'Only vertices with smaller labels',
            'Only entries that appear twice',
          ],
          0,
          'Everything else points to a vertex that is already scheduled.',
        ),
      ],
    },
    {
      title: 'The check makes cycles terminate',
      explanation: [
        'In a cycle such as 0 → 1 → 2 → 0, following edges without a check would return to 0 and repeat forever. With the check, the edge back to 0 is scanned but ignored, because 0 is already in seen.',
        'Every vertex enters pending at most once, so the search ends after each reachable vertex has been expanded once.',
      ],
      example: {
        code: lines(
          'expanded = []',
          dfsLoop('[[1], [2], [0]]', 0, 'expanded.append(vertex)'),
          'print(expanded)',
        ),
        output: '[0, 1, 2]',
        explanation:
          'When 2 is expanded, its edge to 0 is ignored, the stack empties, and the search stops.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'expanded = []',
            dfsLoop('[[1, 0], [0, 1]]', 0, 'expanded.append(vertex)'),
            'print(expanded)',
          ),
          '[0, 1]',
          'The self-loops and the edge back to 0 all point to seen vertices, so each vertex is expanded once.',
        ),
        predictOutput(
          'How many neighbor entries are scanned, and how many vertices are seen?',
          lines(
            'scanned = 0',
            dfsLoop('[[1, 2], [2, 0], [0, 1]]', 0, '', 'scanned += 1'),
            'print(scanned, len(seen))',
          ),
          ['3 3', '6 6', '6 3', '2 3'],
          2,
          'Every vertex is expanded once and scans its two entries, but only three distinct vertices exist.',
        ),
        choose(
          'Without the seen check, what happens on the cycle 0 → 1 → 0?',
          [
            'The search ends after two vertices',
            'Vertices are pushed again and again forever',
            'Python removes the cycle',
            'Only vertex 0 is expanded',
          ],
          1,
          'Each expansion pushes the other vertex again, so the stack never empties.',
        ),
        choose(
          'With the check, how many times is each reachable vertex expanded?',
          [
            'Once per incoming edge',
            'Twice',
            'Once per cycle it lies on',
            'Exactly once',
          ],
          3,
          'It is pushed once, so it is popped and expanded once.',
        ),
      ],
    },
  ],
  'cp-dfs': [
    {
      title: 'Search reachable vertices with a stack and a seen set',
      explanation: [
        'Iterative DFS starts with the source in seen and on the stack. It repeatedly pops a vertex and pushes every outgoing neighbor not yet seen, marking each as it is pushed. When the stack is empty, seen holds exactly the vertices reachable from the source.',
        'Edges are followed only in their stored direction, and vertices in other components are never reached.',
      ],
      example: {
        code: lines(
          dfsLoop('[[1], [2], [0, 3], [], [3]]'),
          'print(len(seen), 4 in seen)',
        ),
        output: '4 False',
        explanation:
          'The cycle 0 → 1 → 2 → 0 ends because 0 is already seen. Vertex 4 points into 3, but nothing reachable points to 4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(dfsLoop('[[1], [], [1]]'), 'print(len(seen), 2 in seen)'),
          '2 False',
          'From 0 only 1 is reachable; the edge 2 → 1 cannot be followed backward.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            dfsLoop('[[2], [0], [1], [0]]', 1),
            'print(len(seen), 3 in seen)',
          ),
          '3 False',
          'From 1 the search reaches 0 and 2; vertex 3 only has an edge out, so nothing leads to it.',
        ),
        choose(
          'An undirected graph has two separate components, and DFS starts in the first. What does seen hold at the end?',
          [
            'Every vertex of both components',
            'Only the source and its neighbors',
            'Exactly the vertices of the first component',
            'The vertices on one longest path',
          ],
          2,
          'DFS reaches everything connected to the source and nothing else.',
        ),
        choose(
          'A graph has the directed edge 4 → 3. Why does DFS from 3 not reach 4 through it?',
          [
            'DFS follows edges only from their stored source',
            'Vertex 4 has a larger label',
            'Edges into a vertex are skipped',
            'DFS stops at vertices without neighbors',
          ],
          0,
          'The edge is listed in graph[4], so it can only be followed when 4 is expanded.',
        ),
      ],
    },
    {
      title: 'Trace the order DFS expands vertices',
      explanation: [
        'Because pending work is a stack, the most recently pushed neighbor is expanded next. With neighbors pushed in list order, the last neighbor in a list is explored first, and its whole branch finishes before earlier siblings are popped.',
        'Recording the expansion order makes a trace concrete: pop, record, then push unseen neighbors in list order.',
      ],
      example: {
        code: lines(
          'order = []',
          dfsLoop('[[1, 2], [3], [4], [], []]', 0, 'order.append(vertex)'),
          'print(order)',
        ),
        output: '[0, 2, 4, 1, 3]',
        explanation:
          '2 was pushed after 1, so 2 and its branch through 4 finish before 1 is popped.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'order = []',
            dfsLoop('[[1, 2, 3], [], [], []]', 0, 'order.append(vertex)'),
            'print(order)',
          ),
          '[0, 3, 2, 1]',
          'All three neighbors are pushed in order, so they come off newest first: 3, 2, 1.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'order = []',
            dfsLoop('[[2, 1], [3], [], [0]]', 0, 'order.append(vertex)'),
            'print(order)',
          ),
          '[0, 1, 3, 2]',
          '1 is pushed last, so its branch through 3 runs first; 3’s edge to 0 is ignored, then 2 is popped.',
        ),
        choose(
          'Vertex 0’s neighbors are [5, 6], pushed in that order. Which is expanded first?',
          [
            '5, because it comes first in the list',
            'The one with fewer neighbors',
            'Both at once',
            '6, because it was pushed last',
          ],
          3,
          'The stack returns the most recently pushed entry.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'order = []',
            dfsLoop('[[1, 4], [2], [], [], [3]]', 0, 'order.append(vertex)'),
            'print(order)',
          ),
          '[0, 4, 3, 1, 2]',
          '4 is on top, and its branch to 3 finishes before 1 and its child 2 are expanded.',
        ),
      ],
    },
    {
      title: 'Bound the work and the stack',
      explanation: [
        'Each reachable vertex is pushed once and popped once, and each of its outgoing entries is scanned once when it is expanded. Reachable search therefore costs O(Vᵣ + Eᵣ) for Vᵣ reached vertices and Eᵣ scanned entries, with O(Vᵣ) extra space for seen and the stack.',
        'An explicit stack also avoids Python’s recursion limit: a 100,000-vertex path is fine with a loop but would overflow a recursive DFS.',
      ],
      example: {
        code: lines(
          'scanned = 0',
          dfsLoop('[[1, 1, 2], [2], [0], [0]]', 0, '', 'scanned += 1'),
          'print(len(seen), scanned)',
        ),
        output: '3 5',
        explanation:
          'Three reachable vertices are pushed once each, and their five outgoing entries are scanned once each. Vertex 3 is unreachable, so its edge is never scanned.',
      },
      questions: [
        choose(
          'DFS from s reaches Vᵣ vertices whose adjacency lists hold Eᵣ entries in total. What is its running time?',
          ['O(Vᵣ · Eᵣ)', 'O(Vᵣ + Eᵣ)', 'O(Vᵣ²)', 'O(Eᵣ log Vᵣ)'],
          1,
          'Each reached vertex is handled once and each of its entries scanned once.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'scanned = 0',
            dfsLoop('[[1, 2], [2], [1], []]', 0, '', 'scanned += 1'),
            'print(len(seen), scanned)',
          ),
          '3 4',
          'Vertices 0, 1 and 2 are reached, and their four entries are each scanned once; 3 is never reached.',
        ),
        choose(
          'Why use an explicit stack instead of recursion for DFS on a path of 100,000 vertices?',
          [
            'Recursion reaches a different set of vertices',
            'The stack version needs no seen set',
            'A loop does not hit Python’s recursion limit',
            'Recursion cannot follow directed edges',
          ],
          2,
          'A recursive DFS would nest one call per vertex on the path, far past the default limit.',
        ),
        choose(
          'Marking on push, at most how many entries can the DFS stack hold at once?',
          [
            'The number of edges',
            'Twice the number of edges',
            'The square of the vertex count',
            'The number of reachable vertices',
          ],
          3,
          'Each vertex is pushed at most once in the whole search, so the stack never holds more.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------- breadth-first search
  'cp-fifo-frontier': [
    {
      title: 'Take the oldest pending vertex',
      explanation: [
        'Breadth-first search keeps pending work in a queue: new work joins at the right, and the oldest work leaves from the left. First in, first out.',
        'With pending = [0, 3, 1], oldest first, the next vertex is 0; a stack would take 1 instead.',
      ],
      example: {
        code: lines(
          'pending = [0, 3, 1]',
          'first = pending.pop(0)',
          'pending.append(5)',
          'print(first)',
          'print(pending)',
        ),
        output: '0\n[3, 1, 5]',
        explanation:
          'pop(0) takes the oldest entry from the left, and the new 5 waits at the right behind 3 and 1.',
      },
      questions: [
        typeNumber(
          'Pending is [6, 2, 9], oldest first. Which vertex does a queue take next?',
          6,
          'A queue takes the oldest entry, at the left.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'pending = [4]',
            'pending.append(7)',
            'pending.append(1)',
            'order = [pending.pop(0), pending.pop(0)]',
            'pending.append(8)',
            'order.append(pending.pop(0))',
            'print(order)',
          ),
          '[4, 7, 1]',
          'Entries leave in arrival order: 4, 7, and then 1, which arrived before 8.',
        ),
        choose(
          'In what order does a queue return pending work?',
          [
            'Newest first',
            'Smallest label first',
            'Oldest first',
            'Random order',
          ],
          2,
          'First in, first out.',
        ),
        typeOutput(
          'A queue takes pending[0], and a stack would take pending[-1]. What is printed?',
          lines('pending = [5, 8, 2]', 'print(pending[0], pending[-1])'),
          '5 2',
          'The queue’s next vertex is the oldest, 5; a stack’s would be the newest, 2.',
        ),
      ],
    },
    {
      title: 'Use deque for constant-time removal from the left',
      explanation: [
        'list.pop(0) shifts every remaining entry one place left, so it costs time proportional to the list’s length. collections.deque supports append on the right and popleft on the left, each in O(1).',
        'list(queue) turns the remainder back into a list when a function promises one. Check that the queue is nonempty before popleft, which raises IndexError on an empty deque.',
      ],
      example: {
        code: lines(
          takeBreadthFirst,
          'print(take_breadth_first([0, 3, 1]))',
          'print(take_breadth_first([]))',
        ),
        output: '(0, [3, 1])\n(None, [])',
        explanation:
          'popleft removes the oldest vertex 0. The empty queue is detected before popleft is called.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'from collections import deque',
            'queue = deque([2, 9])',
            'queue.append(4)',
            'print(queue.popleft(), list(queue))',
          ),
          '2 [9, 4]',
          'popleft removes the oldest entry 2; the rest stay in arrival order.',
        ),
        choose(
          'Which deque operation removes the oldest entry?',
          ['pop()', 'append()', 'popleft()', 'appendleft()'],
          2,
          'Entries join at the right with append and leave from the left with popleft.',
        ),
        choose(
          'Why use deque rather than repeated list.pop(0) for a long queue?',
          [
            'popleft does not shift the remaining entries',
            'deque keeps its entries sorted',
            'pop(0) removes the newest entry',
            'deque cannot hold duplicates',
          ],
          0,
          'Each pop(0) moves every remaining entry, while popleft takes constant time.',
        ),
        typeOutput(
          'What is printed?',
          lines(takeBreadthFirst, 'print(take_breadth_first([7]))'),
          '(7, [])',
          'The only vertex is removed, leaving an empty remainder.',
        ),
      ],
    },
  ],
  'cp-bfs-discovery': [
    {
      title: 'Queue a neighbor only on first discovery',
      explanation: [
        'When BFS scans a vertex’s neighbors, it appends a neighbor to the queue only if the neighbor is not in seen, and it adds the neighbor to seen at that same moment.',
        'Marking on enqueue keeps one queued copy per vertex, even when several parents or parallel edges reach it before it is dequeued.',
      ],
      example: {
        code: lines(
          queueNeighbors,
          'pending, seen = queue_neighbors([4], {0, 4}, [5, 0, 5, 6])',
          'print(pending)',
          'print(len(seen))',
        ),
        output: '[4, 5, 6]\n4',
        explanation:
          '0 is already seen, and the second 5 is skipped because the first 5 was marked when it was queued.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            queueNeighbors,
            'pending, seen = queue_neighbors([], {0}, [1, 1, 1])',
            'print(pending)',
          ),
          '[1]',
          'The first 1 is queued and marked; the parallel copies find it already seen.',
        ),
        choose(
          'When does BFS add a newly found neighbor to seen?',
          [
            'Immediately when it is enqueued',
            'When it is dequeued',
            'After every vertex is processed',
            'Only if it has outgoing edges',
          ],
          0,
          'Marking at enqueue time stops other edges from queuing it again while it waits.',
        ),
        predictOutput(
          'Which vertices are enqueued, in order?',
          lines(
            'from collections import deque',
            'graph = [[1, 2], [3], [3], []]',
            'seen = {0}',
            'queue = deque([0])',
            'enqueued = [0]',
            'while queue:',
            '    vertex = queue.popleft()',
            '    for neighbor in graph[vertex]:',
            '        if neighbor not in seen:',
            '            seen.add(neighbor)',
            '            queue.append(neighbor)',
            '            enqueued.append(neighbor)',
            'print(enqueued)',
          ),
          ['[0, 1, 2, 3, 3]', '[0, 1, 3, 2]', '[0, 1, 2, 3]', '[0, 3]'],
          2,
          'Both 1 and 2 point to 3, but 3 is marked when 1 queues it, so 2 adds nothing.',
        ),
        choose(
          'Vertices 1 and 2 both have an edge to 3, and both are expanded before 3 is dequeued. If BFS marked vertices only at dequeue time, what would happen?',
          [
            '3 is queued once',
            '3 is never queued',
            'The search stops early',
            '3 is queued twice',
          ],
          3,
          'Neither expansion would see 3 as discovered, so each would append it.',
        ),
      ],
    },
    {
      title: 'New discoveries wait behind older work',
      explanation: [
        'Newly discovered neighbors join the right end of the queue, behind every vertex already waiting. Existing pending entries keep their order.',
        'So vertices discovered while expanding one vertex are processed after the vertices that were queued before them, which is what makes BFS proceed layer by layer.',
      ],
      example: {
        code: lines(
          queueNeighbors,
          'pending, seen = queue_neighbors([7, 8], {0, 7, 8}, [9, 7, 10])',
          'print(pending)',
        ),
        output: '[7, 8, 9, 10]',
        explanation:
          '7 and 8 keep their places at the front; the new 9 and 10 join behind them.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            queueNeighbors,
            'pending, seen = queue_neighbors([3], {0, 3}, [1, 2])',
            'print(pending)',
          ),
          '[3, 1, 2]',
          'The waiting 3 stays first, and the new neighbors follow in their supplied order.',
        ),
        choose(
          'The queue holds [4, 6], and expanding a vertex discovers 9. Where does 9 go?',
          ['Before 4', 'Between 4 and 6', 'After 6', 'It replaces 4'],
          2,
          'New work always joins the back of the queue.',
        ),
        predictOutput(
          'In what order does BFS process the vertices?',
          lines(bfsOrder('[[1, 2], [3], [4], [], []]'), 'print(order)'),
          [
            '[0, 1, 2, 3, 4]',
            '[0, 1, 3, 2, 4]',
            '[0, 2, 4, 1, 3]',
            '[0, 1, 2, 4, 3]',
          ],
          0,
          '3 and 4 are discovered after 2 was already waiting, so both children of 0 come first.',
        ),
        choose(
          'Why must new discoveries go behind the vertices already waiting?',
          [
            'So the queue stays sorted by label',
            'So duplicates are removed',
            'So the newest vertex is expanded next',
            'So vertices nearer the source are processed first',
          ],
          3,
          'Waiting vertices were found earlier, so none is farther from the source than a new discovery; they must be handled first.',
        ),
      ],
    },
  ],
  'cp-bfs-layer-distance': [
    {
      title: 'A first-discovered neighbor is one layer further',
      explanation: [
        'In an unweighted graph each edge adds 1 to a path’s length. When BFS expands a vertex at distance d, every neighbor it discovers for the first time gets distance d + 1.',
        'A distance list can double as the seen set: −1 means undiscovered, and any other value is the vertex’s assigned distance.',
      ],
      example: {
        code: lines(
          assignNextLayer,
          'print(assign_next_layer([0, -1, -1, -1], 0, [1, 3]))',
        ),
        output: '[0, 1, -1, 1]',
        explanation:
          'The source has distance 0, so its newly found neighbors 1 and 3 get 1; vertex 2 stays undiscovered.',
      },
      questions: [
        typeNumber(
          'A vertex at distance 4 discovers a neighbor for the first time. What distance does the neighbor get?',
          5,
          'One more edge than the vertex it was found from: 4 + 1.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            assignNextLayer,
            'print(assign_next_layer([0, 1, -1, -1], 1, [2, 0, 3]))',
          ),
          '[0, 1, 2, 2]',
          '2 and 3 are new and get 1 + 1; the source 0 is already assigned and keeps 0.',
        ),
        choose(
          'In this distance list, what does −1 mean?',
          [
            'A negative edge weight',
            'The vertex is undiscovered',
            'The source vertex',
            'An unreachable cycle',
          ],
          1,
          'Real distances are never negative, so −1 safely marks vertices not yet reached.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            assignNextLayer,
            'print(assign_next_layer([-1, 0, -1], 1, [1, 2, 2]))',
          ),
          '[-1, 0, 1]',
          'The self-loop finds vertex 1 already at 0; 2 gets 1 the first time, and the repeat is skipped.',
        ),
      ],
    },
    {
      title: 'Never overwrite an assigned distance',
      explanation: [
        'BFS expands vertices in order of distance, so the first time a vertex is discovered it is reached by a shortest path. A later route, found while expanding a vertex in the same or a deeper layer, can only be as long or longer.',
        'So an assigned distance is never replaced: check that the neighbor’s distance is −1 before assigning.',
      ],
      example: {
        code: lines(
          assignNextLayer,
          'def careless(distances, vertex, neighbors):',
          '    result = distances.copy()',
          '    for neighbor in neighbors:',
          '        result[neighbor] = result[vertex] + 1',
          '    return result',
          '',
          'print(assign_next_layer([0, 1, 2, 1], 2, [3]))',
          'print(careless([0, 1, 2, 1], 2, [3]))',
        ),
        output: '[0, 1, 2, 1]\n[0, 1, 2, 3]',
        explanation:
          'Vertex 3 already has its shortest distance 1. The careless version replaces it with 3, the length of a longer route.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            assignNextLayer,
            'print(assign_next_layer([0, 1, 1, -1], 2, [1, 3]))',
          ),
          '[0, 1, 1, 2]',
          'Vertex 1 keeps its distance 1; only the undiscovered 3 is assigned 1 + 1.',
        ),
        choose(
          'Vertex 5 already has distance 2. Later, a vertex at distance 3 has an edge to 5. What should happen?',
          [
            '5 keeps distance 2',
            '5 gets distance 4',
            '5 gets distance 3',
            '5 is queued again',
          ],
          0,
          'The route through a distance-3 vertex is longer than the one already found.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def careless(distances, vertex, neighbors):',
            '    result = distances.copy()',
            '    for neighbor in neighbors:',
            '        result[neighbor] = result[vertex] + 1',
            '    return result',
            '',
            'print(careless([0, 1, -1], 1, [0, 2]))',
          ),
          '[2, 1, 2]',
          'Without the check, the edge back to the source overwrites its distance 0 with 2.',
        ),
        choose(
          'Why is a vertex’s first BFS distance already its fewest number of edges?',
          [
            'Its neighbors are scanned in sorted order',
            'Every edge is scanned twice',
            'The graph has no cycles',
            'BFS finishes each layer before the next',
          ],
          3,
          'All closer vertices are expanded before any farther one, so the first discovery comes from the closest layer possible.',
        ),
      ],
    },
  ],
  'cp-bfs': [
    {
      title: 'Compute fewest-edge distances with a queue',
      explanation: [
        'Start with distance[source] = 0, every other distance −1, and the source in a deque. Repeatedly popleft a vertex; for each neighbor still at −1, set its distance to the vertex’s distance plus 1 and append it.',
        'Vertices that are never reached keep −1, so the result covers every vertex.',
      ],
      example: {
        code: lines(
          bfsDistances('[[1, 3], [2], [4], [2], [], [0]]'),
          'print(distance)',
        ),
        output: '[0, 1, 2, 1, 3, -1]',
        explanation:
          '1 and 3 are one edge away, 2 is two, and 4 is three. Vertex 5 has an edge to 0 but none leading to it.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(bfsDistances('[[1], [2], [0], [1]]'), 'print(distance)'),
          '[0, 1, 2, -1]',
          'The cycle 0 → 1 → 2 → 0 gives distances 0, 1, 2; vertex 3 only has an edge out.',
        ),
        typeOutput(
          'What is printed?',
          lines(bfsDistances('[[1, 2], [3], [3], [4], []]'), 'print(distance)'),
          '[0, 1, 1, 2, 3]',
          '3 is first reached from 1 at distance 2, and 4 from 3 at distance 3.',
        ),
        choose(
          'Edges have travel times 1, 5 and 2. Why are BFS distances not travel times here?',
          [
            'BFS ignores edges with odd weights',
            'BFS needs the graph to be undirected',
            'BFS counts edges, as if each cost the same',
            'BFS adds weights in the wrong order',
          ],
          2,
          'The fewest-edge guarantee assumes unit costs; unequal weights need a different algorithm.',
        ),
        typeOutput(
          'What does this program print?',
          lines(bfsDistances('[[1], [2], [], [0]]', 3), 'print(distance)'),
          '[1, 2, 3, 0]',
          'The source is 3, at distance 0; then 0, 1 and 2 follow at 1, 2 and 3.',
        ),
      ],
    },
    {
      title: 'Trace the queue layer by layer',
      explanation: [
        'The queue always holds at most two consecutive layers: some vertices at distance d still waiting, followed by vertices already given d + 1. Every distance-d vertex leaves before any distance-(d + 1) vertex.',
        'Printing each dequeued vertex with its distance shows the layers in order, even when edges point backward or form cycles.',
      ],
      example: {
        code: lines(
          bfsDistances(
            '[[1, 2], [2, 3], [0, 4], [], [1]]',
            0,
            'print(vertex, distance[vertex])',
          ),
        ),
        output: '0 0\n1 1\n2 1\n3 2\n4 2',
        explanation:
          'Both distance-1 vertices leave before the distance-2 vertices 3 and 4, and the backward edges to 0 and 1 change nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            bfsDistances(
              '[[2, 1], [3], [3], [0]]',
              0,
              'print(vertex, distance[vertex])',
            ),
          ),
          [
            '0 0\n1 1\n2 1\n3 2',
            '0 0\n2 1\n1 1\n3 2',
            '0 0\n2 1\n3 2\n1 1',
            '0 0\n2 1\n1 2\n3 3',
          ],
          1,
          '2 was queued before 1, so it leaves first; 3 is discovered from 2 at distance 2 and leaves after 1.',
        ),
        typeNumber(
          'The queue currently holds vertices with distances [3, 3, 4], front first. The front vertex is dequeued and discovers a new vertex. What distance does that vertex get?',
          4,
          'The next vertex expanded has distance 3, so anything it discovers gets 4.',
        ),
        choose(
          'Can a vertex at distance 2 be dequeued before one at distance 1?',
          [
            'Yes, if it has a smaller label',
            'Yes, if it was discovered from the source',
            'Only in a graph with cycles',
            'No, every distance-1 vertex leaves first',
          ],
          3,
          'Distance-2 vertices are appended only after the distance-1 vertices are already queued.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            bfsDistances(
              '[[1], [2], [0, 3], [1]]',
              0,
              'print(vertex, distance[vertex])',
            ),
          ),
          [
            '0 0\n1 1\n2 2\n3 3',
            '0 0\n1 1\n2 2\n0 3\n3 3',
            '0 0\n1 1\n2 2\n3 1',
            '0 0\n1 1\n2 2',
          ],
          0,
          'Each vertex is dequeued once; the edges back to 0 and 1 find assigned distances and are ignored.',
        ),
      ],
    },
    {
      title: 'Mark on enqueue and count the cost',
      explanation: [
        'Setting a distance when the vertex is appended, not when it is dequeued, keeps one queue entry per vertex despite cycles, self-loops and parallel edges. Each reachable vertex is then dequeued once and its list scanned once.',
        'Initialization plus scanning costs O(V + E) time, with O(V) extra space for the distances and the queue. Using list.pop(0) instead of popleft would add a shift of the whole queue at every step.',
      ],
      example: {
        code: lines(
          'scanned = 0',
          bfsDistances('[[1, 1, 0], [2, 2], [0]]', 0, '', 'scanned += 1'),
          'print(len([d for d in distance if d >= 0]), scanned)',
        ),
        output: '3 6',
        explanation:
          'Three vertices are queued once each, while all six entries, including the parallel edges and the self-loop, are scanned once.',
      },
      questions: [
        choose(
          'What is the running time of BFS over adjacency lists with V vertices and E edges?',
          ['O(V · E)', 'O(V + E)', 'O(V²)', 'O(E log V)'],
          1,
          'Each vertex is queued at most once, and each list entry is scanned once.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            'scanned = 0',
            bfsDistances('[[1, 2, 2], [2], [1]]', 0, '', 'scanned += 1'),
            'print(len([d for d in distance if d >= 0]), scanned)',
          ),
          '3 5',
          'Three vertices are reached, and their five entries are each scanned once.',
        ),
        choose(
          'BFS sets a vertex’s distance only when it is dequeued. What can go wrong when two queued vertices both have edges to v?',
          [
            'v is never reached',
            'v gets distance 0',
            'v is appended twice',
            'The queue empties early',
          ],
          2,
          'Neither expansion sees v as discovered, so both append it.',
        ),
        choose(
          'Why does a long BFS run slowly when its queue is a list using pop(0)?',
          [
            'pop(0) returns the newest vertex',
            'Lists cannot hold more than 1,000 vertices',
            'pop(0) skips discovered vertices',
            'pop(0) shifts every remaining entry each time',
          ],
          3,
          'Each removal from the front moves the rest of the list, adding work proportional to the queue length.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------- topological order
  'cp-incoming-counts': [
    {
      title: 'Count incoming edges per vertex',
      explanation: [
        'In a dependency graph, an edge u → v means u must come before v. The indegree of v is the number of edges entering it: the prerequisites v still waits for.',
        'Count by scanning every adjacency entry and adding 1 at its destination. Indegree counts edges into a vertex; the length of graph[v] counts edges out of it.',
      ],
      example: {
        code: lines(
          incomingCounts,
          'print(incoming_counts([[1, 2], [2], [], [0]]))',
        ),
        output: '[1, 1, 2, 0]',
        explanation:
          'Vertex 2 is the destination of two edges, from 0 and from 1. Vertex 3 has an edge out but none in.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(incomingCounts, 'print(incoming_counts([[1], [2], [0]]))'),
          '[1, 1, 1]',
          'In the cycle 0 → 1 → 2 → 0, every vertex is the destination of exactly one edge.',
        ),
        choose(
          'graph[4] lists three neighbors. What does that tell you about vertex 4?',
          [
            'Its indegree is 3',
            'It has 3 outgoing edges',
            'It has 3 prerequisites',
            'It is ready immediately',
          ],
          1,
          'graph[4] lists edges leaving 4; its indegree depends on the other vertices’ lists.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            incomingCounts,
            'graph = [[3], [3], [3], []]',
            'print(incoming_counts(graph), [len(x) for x in graph])',
          ),
          '[0, 0, 0, 3] [1, 1, 1, 0]',
          'Three edges enter 3, while each of 0, 1 and 2 has one edge out.',
        ),
        choose(
          'Edge u → v means u must come before v. Which number says how many prerequisites v has?',
          [
            'len(graph[v])',
            'The number of vertices',
            'len(graph[u])',
            'The indegree of v',
          ],
          3,
          'Each prerequisite of v is an edge into v.',
        ),
      ],
    },
    {
      title: 'Count parallel edges and self-loops too',
      explanation: [
        'Every adjacency entry is one dependency, so two parallel edges into v add 2, and both must be removed later. A self-loop v → v adds 1 to v’s own count, which v itself can never release.',
        'An isolated vertex keeps count 0, and the counts always sum to the number of edges.',
      ],
      example: {
        code: lines(
          incomingCounts,
          'counts = incoming_counts([[1, 1], [1], [], []])',
          'print(counts, sum(counts))',
        ),
        output: '[0, 3, 0, 0] 3',
        explanation:
          'The two parallel edges from 0 and the self-loop at 1 all enter vertex 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(incomingCounts, 'print(incoming_counts([[2, 2], [2], []]))'),
          '[0, 0, 3]',
          'Both parallel edges from 0 count, plus the edge from 1.',
        ),
        typeNumber(
          'A graph has 7 directed edges, some parallel and one a self-loop. What do all the indegrees sum to?',
          7,
          'Every edge, parallel or self-loop, adds exactly 1 at its destination.',
        ),
        typeOutput(
          'What is printed?',
          lines(incomingCounts, 'print(incoming_counts([[], [1], [0]]))'),
          '[1, 1, 0]',
          'The self-loop gives vertex 1 a count of 1, and the edge 2 → 0 gives vertex 0 a count of 1.',
        ),
        typeNumber(
          'Vertex 5 has a self-loop 5 → 5 and no other incoming edges. What is its indegree?',
          1,
          'The self-loop is one edge entering 5.',
        ),
      ],
    },
  ],
  'cp-zero-indegree': [
    {
      title: 'Start with every zero-indegree vertex',
      explanation: [
        'A vertex whose remaining indegree is 0 waits for nothing, so it can be scheduled now. The initial ready list holds every such vertex, here in increasing index order.',
        'Isolated vertices and the starting vertices of separate components all have indegree 0, so all of them belong in the initial ready list.',
      ],
      example: {
        code: lines(readyVertices, 'print(ready_vertices([1, 0, 0, 3, 0, 1]))'),
        output: '[1, 2, 4]',
        explanation:
          'Only vertices 1, 2 and 4 have no remaining prerequisites.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(readyVertices, 'print(ready_vertices([3, 1, 0, 0]))'),
          '[2, 3]',
          'Vertices 2 and 3 have count 0, and the comprehension lists them in index order.',
        ),
        choose(
          'A graph has two separate components and an isolated vertex. Which vertices start in the ready list?',
          [
            'Only vertex 0',
            'One vertex from the largest component',
            'Every vertex with indegree 0, in any component',
            'Only the isolated vertex',
          ],
          2,
          'Nothing will ever release a zero-indegree vertex later, so all of them must start ready.',
        ),
        typeOutput(
          'What is printed?',
          lines(readyVertices, 'print(ready_vertices([0, 0, 0]))'),
          '[0, 1, 2]',
          'With no edges, every vertex is ready; the list holds vertex numbers, not counts.',
        ),
        predictOutput(
          'Which vertices are ready at the start?',
          lines(
            incomingCounts,
            readyVertices,
            'print(ready_vertices(incoming_counts([[1], [], [1], []])))',
          ),
          ['[0, 2]', '[1]', '[3]', '[0, 2, 3]'],
          3,
          'Only vertex 1 has prerequisites; the isolated vertex 3 is ready along with 0 and 2.',
        ),
      ],
    },
    {
      title: 'No ready vertex means a cycle remains',
      explanation: [
        'Every vertex on a directed cycle has an incoming edge from the vertex before it, so none of them reaches indegree 0 while the cycle is intact. If unprocessed vertices remain and none has indegree 0, they cannot all be scheduled.',
        'A self-loop is the smallest such cycle: the vertex waits for itself forever.',
      ],
      example: {
        code: lines(
          readyVertices,
          'print(ready_vertices([1, 1, 1]))  # 0 -> 1 -> 2 -> 0',
          'print(ready_vertices([0, 1]))  # 1 -> 1',
        ),
        output: '[]\n[0]',
        explanation:
          'In the 3-cycle every vertex waits for its predecessor, so nothing is ready. With a self-loop at 1, vertex 0 is ready but 1 waits for itself.',
      },
      questions: [
        choose(
          'Kahn’s algorithm has unprocessed vertices left, but none has indegree 0. What does that show?',
          [
            'All vertices are processed',
            'The remaining graph contains a directed cycle',
            'Some edge has a negative weight',
            'The graph is undirected',
          ],
          1,
          'Without a cycle, some remaining vertex would have no remaining prerequisite.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            incomingCounts,
            readyVertices,
            'print(ready_vertices(incoming_counts([[1], [0], [0]])))',
          ),
          '[2]',
          '0 and 1 wait for each other in a cycle; only 2, which nothing points to, is ready.',
        ),
        choose(
          'Which graph has no vertex with indegree 0?',
          ['0 → 1, 1 → 0', '0 → 1, 1 → 2', '0 → 1, 2 → 1', '0 → 2, 1 → 2'],
          0,
          'In the two-vertex cycle, each vertex has an edge from the other.',
        ),
        choose(
          'Vertex 3 has a self-loop 3 → 3. Can it ever enter the ready list?',
          [
            'Yes, once its other prerequisites finish',
            'Yes, it is ready at the start',
            'Only if it has no outgoing edges',
            'No, it always waits for itself',
          ],
          3,
          'Its own edge can be released only by processing 3, which first needs count 0.',
        ),
      ],
    },
  ],
  'cp-release-dependency': [
    {
      title: 'Decrement each outgoing incidence',
      explanation: [
        'When a ready vertex is processed, each of its outgoing edges is satisfied: subtract 1 from the destination’s remaining count, once per edge entry, including each parallel edge.',
        'A destination becomes ready exactly when its count reaches 0.',
      ],
      example: {
        code: lines(releaseEdges, 'print(release_edges([0, 2, 1, 1], [1, 2]))'),
        output: '([0, 1, 0, 1], [2])',
        explanation:
          'Vertex 1 still waits for one more prerequisite, while vertex 2’s only prerequisite is now done.',
      },
      questions: [
        choose(
          'Vertex 6 has remaining count 2. The processed vertex has one edge to 6. What is 6’s count afterwards, and is it ready?',
          ['0, ready', '1, not ready', '2, not ready', '1, ready'],
          1,
          'One prerequisite is removed, and one still remains.',
        ),
        typeOutput(
          'What does this program print?',
          lines(releaseEdges, 'print(release_edges([0, 1, 1], [1, 2]))'),
          '([0, 0, 0], [1, 2])',
          'Both destinations drop from 1 to 0 and become ready in edge order.',
        ),
        typeOutput(
          'What is printed?',
          lines(releaseEdges, 'print(release_edges([0, 3, 0], [1, 1]))'),
          '([0, 1, 0], [])',
          'The two parallel edges each subtract 1, leaving 1 still blocked at count 1.',
        ),
        choose(
          'Why must a parallel edge to v be decremented twice?',
          [
            'Because v must be queued twice',
            'Because parallel edges have double weight',
            'Because v becomes negative otherwise',
            'Because v’s count included both edges',
          ],
          3,
          'Each edge added 1 to v’s count, so each must subtract 1 for the count to reach 0.',
        ),
      ],
    },
    {
      title: 'Release a vertex only at the transition to zero',
      explanation: [
        'Append a destination to the ready list at the moment its count becomes 0, not whenever it is decremented. Checking right after each decrement means it is appended once, by its final remaining prerequisite.',
        'With parallel edges, the first decrement can leave the vertex blocked; only the last one releases it.',
      ],
      example: {
        code: lines(releaseEdges, 'print(release_edges([0, 2, 1], [1, 2, 1]))'),
        output: '([0, 0, 0], [2, 1])',
        explanation:
          'The first edge to 1 leaves it at 1. The edge to 2 releases 2, and the second edge to 1 releases 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(releaseEdges, 'print(release_edges([0, 2, 2], [2, 1, 2]))'),
          '([0, 1, 0], [2])',
          '2 receives two decrements and reaches 0; 1 receives one and stays blocked at 1.',
        ),
        typeOutput(
          'This version appends on every decrement. What does it print?',
          lines(
            'def careless(indegrees, outgoing):',
            '    counts = indegrees.copy()',
            '    ready = []',
            '    for vertex in outgoing:',
            '        counts[vertex] -= 1',
            '        ready.append(vertex)',
            '    return counts, ready',
            '',
            'print(careless([0, 2], [1, 1]))',
          ),
          '([0, 0], [1, 1])',
          'Vertex 1 is appended after both decrements, so it would be scheduled twice, the first time too early.',
        ),
        choose(
          'When should a neighbor be appended to the ready queue?',
          [
            'Whenever its count is decremented',
            'When its count changes from 1 to 0',
            'At the start, with every vertex',
            'Whenever its count is positive',
          ],
          1,
          'That transition happens once, when its last prerequisite is removed.',
        ),
        choose(
          'Vertex 4 has two prerequisites, 1 and 2. Processing 1 brings its count to 1. Which processing step releases it?',
          [
            'Vertex 1’s, since it came first',
            'None until all vertices are done',
            'Vertex 4’s own',
            'Vertex 2’s, its final remaining prerequisite',
          ],
          3,
          'Only the decrement from 2 brings the count from 1 to 0.',
        ),
      ],
    },
  ],
  'cp-topological': [
    {
      title: 'Schedule with Kahn’s algorithm',
      explanation: [
        'Kahn’s algorithm counts indegrees, queues every vertex whose count is 0, and then repeatedly removes a vertex from the front, appends it to the order, and releases its outgoing edges. A neighbor whose count reaches 0 joins the back of the queue.',
        'Every edge u → v is respected: v cannot be queued until u, and every other prerequisite of v, has been removed.',
      ],
      example: {
        code: kahn(5, '[(3, 1), (0, 1), (1, 2), (3, 4)]'),
        output: '[0, 3, 1, 4, 2]',
        explanation:
          '0 and 3 start ready. Vertex 1 waits for both, so it is released by 3; then 4 and 2 follow.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          kahn(4, '[(2, 0), (2, 1), (1, 0), (3, 2)]'),
          '[3, 2, 1, 0]',
          'Only 3 starts ready. 2 follows, then 1, and 0 must wait for both 2 and 1.',
        ),
        choose(
          'Edge u → v means u is a prerequisite of v. What must every topological order satisfy?',
          [
            'v appears before u',
            'u and v are adjacent',
            'u appears before v',
            'Vertices are sorted by number',
          ],
          2,
          'A prerequisite must be scheduled before what depends on it.',
        ),
        typeOutput(
          'What is printed?',
          kahn(3, '[]'),
          '[0, 1, 2]',
          'With no edges every vertex starts ready, and the queue releases them in index order.',
        ),
        choose(
          'Which list is a valid topological order for the edges 0 → 2, 1 → 2 and 2 → 3?',
          ['[0, 2, 1, 3]', '[2, 0, 1, 3]', '[0, 1, 3, 2]', '[1, 0, 2, 3]'],
          3,
          'Both 0 and 1 precede 2, and 2 precedes 3; the others break one of those edges.',
        ),
      ],
    },
    {
      title: 'Seed the queue from every component',
      explanation: [
        'The initial queue must contain every vertex with indegree 0, not only vertex 0. Isolated vertices and the sources of separate components would otherwise never be processed.',
        'When several vertices are ready at once, any of them may go next, so a graph can have several valid orders; Kahn’s algorithm with a FIFO queue produces one of them.',
      ],
      example: {
        code: kahn(4, '[(0, 1), (2, 3)]'),
        output: '[0, 2, 1, 3]',
        explanation:
          'Both chain starts, 0 and 2, are queued at once, so the two chains interleave.',
      },
      questions: [
        typeOutput(
          'This version seeds the queue with vertex 0 only. What does it print?',
          kahn(4, '[(0, 1), (2, 3)]', 'print(order)', 'deque([0])'),
          '[0, 1]',
          'Vertex 2 is never queued, so the second chain is never processed.',
        ),
        typeOutput(
          'What is printed?',
          kahn(5, '[(4, 0), (1, 3)]'),
          '[1, 2, 4, 3, 0]',
          '1, 2 and 4 start ready. 1 releases 3, then 4 releases 0, so 3 leaves before 0.',
        ),
        choose(
          'The only edges are 0 → 1 and 2 → 3. Why must the initial queue include vertex 2?',
          [
            '2 has the largest label',
            '2 has indegree 0, and no edge will ever release it',
            'Vertex 0 is not ready',
            'The queue must hold every vertex',
          ],
          1,
          'A vertex enters the queue later only when an edge into it is released; 2 has no such edge.',
        ),
        typeNumber(
          'With only the edges 0 → 2 and 1 → 2, how many valid topological orders exist?',
          2,
          '[0, 1, 2] and [1, 0, 2]; 2 must come last, but 0 and 1 may go in either order.',
        ),
      ],
    },
    {
      title: 'Return None when a cycle blocks the schedule',
      explanation: [
        'If the graph has a directed cycle, its vertices never reach indegree 0, so the loop ends having processed fewer than n vertices. A complete-schedule function should then return None rather than the partial order.',
        'Building the graph and counts, seeding the queue, and processing each vertex and edge once costs O(n + m) time and O(n + m) space.',
      ],
      example: {
        code: kahn(4, '[(0, 1), (1, 2), (2, 1), (2, 3)]', completeOrNone),
        output: '[0]\nNone',
        explanation:
          'After 0, vertex 1 still waits for 2 and 2 waits for 1, so only one of four vertices is processed.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          kahn(3, '[(0, 1), (1, 2), (2, 0)]', completeOrNone),
          '[]\nNone',
          'Every vertex lies on the cycle, so none is ever ready.',
        ),
        typeOutput(
          'What is printed?',
          kahn(4, '[(0, 1), (2, 2), (1, 3)]', completeOrNone),
          '[0, 1, 3]\nNone',
          'The self-loop keeps 2 blocked forever, so three of four vertices are processed and the result is None.',
        ),
        choose(
          'Kahn’s algorithm processes three of five vertices. What should a function that promises a complete schedule return?',
          [
            'The three-vertex prefix',
            'The remaining two vertices',
            'The three vertices plus the rest in any order',
            'None',
          ],
          3,
          'A cycle prevents any complete order, so a partial list would be a wrong schedule.',
        ),
        choose(
          'What is the running time of Kahn’s algorithm on n vertices and m edges?',
          ['O(n · m)', 'O(n + m)', 'O(n²)', 'O(m log n)'],
          1,
          'Each vertex is queued at most once, and each edge is counted once and released once.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------------- Dijkstra
  'cp-distance-relaxation': [
    {
      title: 'Propose d + w across a weighted edge',
      explanation: [
        'In a weighted graph, reaching u at distance d and then crossing an edge of weight w gives a route to v of length d + w. Relaxing the edge compares that candidate with v’s best known distance.',
        'Keep the candidate only if it is strictly smaller; otherwise the old route is at least as good.',
      ],
      example: {
        code: lines(
          relaxDistance,
          'print(relax(12, 3, 4))',
          'print(relax(5, 3, 4))',
        ),
        output: '7\n5',
        explanation:
          'The candidate 3 + 4 = 7 beats 12, but it does not beat 5.',
      },
      questions: [
        typeNumber(
          'u has distance 9, and the edge u → v has weight 3. What candidate distance does v get?',
          12,
          'Distances add along a route: 9 + 3 = 12.',
        ),
        typeOutput(
          'What does this program print?',
          lines(relaxDistance, 'print(relax(10, 4, 6), relax(10, 4, 5))'),
          '10 9',
          '4 + 6 = 10 ties the current distance and is not kept; 4 + 5 = 9 improves it.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            relaxDistance,
            'best = 20',
            'for source_distance, weight in [(5, 9), (2, 15), (11, 1)]:',
            '    best = relax(best, source_distance, weight)',
            'print(best)',
          ),
          '12',
          'The candidates are 14, 17 and 12; each relaxation keeps the smallest seen so far.',
        ),
        choose(
          'v’s best distance is 8, and a new route also gives exactly 8. What should relaxation do?',
          [
            'Replace it, since the route is newer',
            'Keep 8; the candidate is not smaller',
            'Set it to 16',
            'Mark v as unreachable',
          ],
          1,
          'Only a strictly smaller candidate improves the distance.',
        ),
      ],
    },
    {
      title: 'Treat None as no route yet, with nonnegative weights',
      explanation: [
        'Before any route is found, v’s distance is None. Any candidate improves None, so the test is current is None or candidate < current, with the None check first.',
        'Dijkstra’s ordering argument needs every weight to be nonnegative: then extending a route never makes it shorter. Zero weights are fine; negative weights break that guarantee.',
      ],
      example: {
        code: lines(
          relaxDistance,
          'print(relax(None, 0, 5))',
          'print(relax(None, 7, 0))',
          'print(relax(3, 3, 0))',
        ),
        output: '5\n7\n3',
        explanation:
          'None is replaced by any candidate. A zero-weight edge gives a route as long as its start, which does not beat an equal distance.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(relaxDistance, 'print(relax(None, 2, 2), relax(4, 2, 2))'),
          '4 4',
          'The first candidate 4 replaces None; the second only ties 4, so 4 is kept.',
        ),
        choose(
          'Why must the test read current is None or candidate < current, in that order?',
          [
            'Comparing a number with None raises TypeError',
            'None means distance 0',
            'or always evaluates both sides',
            'It makes the candidate smaller',
          ],
          0,
          'or skips the comparison once current is None, so a number is never compared with None.',
        ),
        choose(
          'Which edge weights does Dijkstra’s algorithm allow?',
          [
            'Only weights equal to 1',
            'Only strictly positive weights',
            'Nonnegative weights, including 0',
            'Any integer weights',
          ],
          2,
          'Zero weights never shorten a route, so the ordering argument still holds.',
        ),
        typeOutput(
          'A negative weight breaks Dijkstra’s guarantee. What does this program print?',
          lines(relaxDistance, 'print(relax(None, 5, -3), relax(4, 5, -3))'),
          '2 2',
          'A route through a vertex at distance 5 ends at 2: with a negative weight, extending a route can shorten it.',
        ),
      ],
    },
  ],
  'cp-stale-distance': [
    {
      title: 'An improved route leaves an old heap entry behind',
      explanation: [
        'heapq cannot change an entry already in the heap. When v’s distance improves, the simple approach pushes a new entry (new_distance, v) and leaves the old (old_distance, v) where it is.',
        'So the heap can hold several entries for one vertex, and only the one matching distance[v] is current.',
      ],
      example: {
        code: lines(
          'import heapq',
          'distance = [0, None]',
          'heap = []',
          'distance[1] = 9',
          'heapq.heappush(heap, (9, 1))',
          'distance[1] = 4',
          'heapq.heappush(heap, (4, 1))',
          'print(len(heap), distance[1])',
          'print(heapq.heappop(heap), heapq.heappop(heap))',
        ),
        output: '2 4\n(4, 1) (9, 1)',
        explanation:
          'Both proposals for vertex 1 stay in the heap. The current one, (4, 1), comes out first; (9, 1) is stale.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'distance = [0, None, None]',
            'heap = []',
            'for proposal in [10, 7, 5]:',
            '    distance[2] = proposal',
            '    heapq.heappush(heap, (proposal, 2))',
            'print(len(heap), heap[0])',
          ),
          '3 (5, 2)',
          'Every improvement adds an entry, so three entries for vertex 2 remain, with the smallest at the root.',
        ),
        choose(
          'Why can a heap hold two entries for the same vertex?',
          [
            'A better route was pushed while the older entry stayed queued',
            'The vertex has two incoming edges',
            'heapq duplicates every push',
            'The vertex is its own neighbor',
          ],
          0,
          'Nothing removes the old entry when the improved one is pushed.',
        ),
        choose(
          'The heap holds (9, 1) and (4, 1), and distance[1] is 4. Which entry is current?',
          ['(9, 1)', 'Both', '(4, 1)', 'Neither'],
          2,
          'Only the entry whose distance matches the stored best is current.',
        ),
        predictOutput(
          'Which entries are current?',
          lines(
            'entries = [(4, 1), (9, 1)]',
            'distance = [0, 4]',
            'print([entry[0] == distance[entry[1]] for entry in entries])',
          ),
          ['[True, True]', '[False, True]', '[False, False]', '[True, False]'],
          3,
          '(4, 1) matches distance[1]; (9, 1) records an older, longer route.',
        ),
      ],
    },
    {
      title: 'Skip an entry whose distance no longer matches',
      explanation: [
        'When an entry (d, v) is popped, compare d with distance[v]. If they differ, a better route was found after this entry was pushed: the entry is stale and must not expand v’s edges again.',
        'If they match, the entry is current and v is processed. With nonnegative weights, the current entry for a vertex is popped before any stale entry for it.',
      ],
      example: {
        code: lines(
          isCurrent,
          'print(is_current((12, 2), [0, 5, 7]))',
          'print(is_current((7, 2), [0, 5, 7]))',
        ),
        output: 'False\nTrue',
        explanation:
          'Vertex 2’s best is now 7, so the entry claiming 12 is stale.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            isCurrent,
            'print(is_current((3, 0), [3, 8]), is_current((6, 1), [3, 8]))',
          ),
          'True False',
          '(3, 0) matches distance[0]; (6, 1) does not match distance[1] = 8.',
        ),
        choose(
          'The popped entry is (15, 3), but distance[3] is 11. What should happen?',
          [
            'Expand vertex 3 with distance 15',
            'Skip the entry without expanding 3',
            'Reset distance[3] to 15',
            'Push (15, 3) back',
          ],
          1,
          'A shorter route to 3 was already found, so this entry is out of date.',
        ),
        predictOutput(
          'Which vertices are processed?',
          lines(
            'import heapq',
            'distance = [0, 3, 5]',
            'heap = [(0, 0), (8, 1), (3, 1), (5, 2), (6, 2)]',
            'heapq.heapify(heap)',
            'processed = []',
            'while heap:',
            '    d, v = heapq.heappop(heap)',
            '    if d == distance[v]:',
            '        processed.append(v)',
            'print(processed)',
          ),
          ['[0, 1, 1, 2, 2]', '[0, 2, 1]', '[0, 1, 2, 2, 1]', '[0, 1, 2]'],
          3,
          'Each vertex’s matching entry is popped once; (6, 2) and (8, 1) are stale and skipped.',
        ),
        choose(
          'What goes wrong if stale entries are expanded anyway?',
          [
            'Edges are relaxed again from an outdated distance, wasting work',
            'Distances become too small',
            'The heap loses its minimum',
            'Vertices become unreachable',
          ],
          0,
          'A stale distance is larger than the current one, so its candidates cannot improve anything.',
        ),
      ],
    },
  ],
  'cp-minimum-distance-work': [
    {
      title: 'Pop the smallest distance proposal first',
      explanation: [
        'Dijkstra keeps (distance, vertex) proposals in a min-heap and always takes the smallest distance next, not the oldest proposal as BFS would or the newest as DFS would.',
        'Tuples compare by distance first; equal distances are ordered by vertex, the second field.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = []',
          'for entry in [(7, 3), (2, 5), (2, 1), (9, 0)]:',
          '    heapq.heappush(heap, entry)',
          'print(heapq.heappop(heap))',
          'print(heapq.heappop(heap))',
        ),
        output: '(2, 1)\n(2, 5)',
        explanation:
          'Distance 2 is smallest; between the two distance-2 entries, vertex 1 comes before vertex 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = []',
            'for entry in [(4, 2), (1, 7), (6, 0)]:',
            '    heapq.heappush(heap, entry)',
            'print(heapq.heappop(heap))',
          ),
          '(1, 7)',
          'The heap returns the smallest distance, 1, whatever the vertex number.',
        ),
        choose(
          'Proposals were pushed in the order (5, 1), (3, 2), (8, 0). Which does Dijkstra take next?',
          [
            '(3, 2), the smallest distance',
            '(5, 1), the oldest',
            '(8, 0), the newest',
            '(8, 0), the smallest vertex',
          ],
          0,
          'Dijkstra always expands the closest proposal.',
        ),
        predictOutput(
          'In what order are the vertices taken?',
          lines(
            'import heapq',
            'heap = [(3, 4), (3, 2), (1, 9)]',
            'heapq.heapify(heap)',
            'print([heapq.heappop(heap)[1] for _ in range(3)])',
          ),
          ['[9, 4, 2]', '[9, 2, 4]', '[2, 4, 9]', '[4, 2, 9]'],
          1,
          'Distance 1 goes first; the two distance-3 entries are ordered by vertex, 2 before 4.',
        ),
        choose(
          'How do (6, 3) and (6, 1) compare in the heap?',
          [
            '(6, 3) first, since it was pushed first',
            'They cannot be compared',
            'They are merged into one entry',
            '(6, 1) first, by the second field',
          ],
          3,
          'The distances tie, so the tuples compare their vertex fields.',
        ),
      ],
    },
    {
      title: 'Discard stale proposals until a current one appears',
      explanation: [
        'The smallest entry in the heap may be stale. Pop it, compare with distance[vertex], and if it does not match, discard it and pop again. The first matching entry is the smallest valid proposal.',
        'If every entry is stale, the heap empties and no usable work remains.',
      ],
      example: {
        code: lines(
          nextEntry,
          'print(next_entry([(2, 0), (5, 1), (4, 0)], [4, 5]))',
          'print(next_entry([(8, 1)], [0, 3]))',
        ),
        output: '(4, 0)\nNone',
        explanation:
          '(2, 0) is popped first but stale, so (4, 0) is the answer. A heap holding only stale work gives None.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            nextEntry,
            'print(next_entry([(1, 1), (2, 0), (3, 1)], [2, 3]))',
          ),
          '(2, 0)',
          '(1, 1) is stale because distance[1] is 3; the next entry (2, 0) matches.',
        ),
        typeOutput(
          'What is printed?',
          lines(nextEntry, 'print(next_entry([(5, 0), (6, 0)], [4, 9]))'),
          'None',
          'Neither entry matches distance[0] = 4, so no usable proposal remains.',
        ),
        choose(
          'The smallest heap entry is stale. What happens next?',
          [
            'It is expanded anyway',
            'Every distance is reset',
            'It is discarded and the next entry popped',
            'The search stops',
          ],
          2,
          'Stale entries are thrown away until a current one appears or the heap empties.',
        ),
        predictOutput(
          'How many entries are discarded before a current one appears?',
          lines(
            'import heapq',
            'heap = [(1, 0), (2, 1), (3, 0), (4, 1)]',
            'distances = [3, 4]',
            'discarded = 0',
            'entry = heapq.heappop(heap)',
            'while entry[0] != distances[entry[1]]:',
            '    discarded += 1',
            '    entry = heapq.heappop(heap)',
            'print(discarded, entry)',
          ),
          ['2 (3, 0)', '0 (1, 0)', '3 (4, 1)', '1 (2, 1)'],
          0,
          '(1, 0) and (2, 1) are stale; (3, 0) matches distances[0].',
        ),
      ],
    },
  ],
  'cp-dijkstra': [
    {
      title: 'Relax edges from the closest unfinished vertex',
      explanation: [
        'Dijkstra’s algorithm starts with distance[source] = 0, every other distance None, and (0, source) in a heap. It pops the smallest entry, skips it if stale, and otherwise relaxes each outgoing edge, pushing (candidate, neighbor) whenever the candidate improves distance[neighbor].',
        'Here graph[u] lists (neighbor, weight) pairs. Unreachable vertices keep None.',
      ],
      example: {
        code: lines(
          dijkstra('[[(1, 4), (2, 1)], [(3, 1)], [(1, 2), (3, 5)], [], []]'),
          'print(distance)',
        ),
        output: '[0, 3, 1, 4, None]',
        explanation:
          'The route 0 → 2 → 1 costs 3 and beats the direct edge of weight 4; vertex 3 is then reached through 1 at cost 4. Vertex 4 is unreachable.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            dijkstra('[[(1, 2), (2, 7)], [(2, 3)], [], []]'),
            'print(distance)',
          ),
          '[0, 2, 5, None]',
          '0 → 1 → 2 costs 2 + 3 = 5, which beats the direct edge of weight 7.',
        ),
        typeOutput(
          'What is printed?',
          lines(dijkstra('[[(1, 0)], [(2, 0)], [(0, 0)]]'), 'print(distance)'),
          '[0, 0, 0]',
          'Zero-weight edges are allowed, and crossing them adds nothing to the distance.',
        ),
        choose(
          'Which graph property does this Dijkstra contract require?',
          [
            'Every weight is exactly 1',
            'The graph has no cycles',
            'Every weight is nonnegative',
            'Every vertex is reachable',
          ],
          2,
          'Cycles and unreachable vertices are fine; negative weights are not.',
        ),
        typeOutput(
          'What does this program print?',
          lines(dijkstra('[[(1, 5), (1, 2)], []]'), 'print(distance)'),
          '[0, 2]',
          'Both parallel edges are relaxed, and the cheaper one gives distance 2.',
        ),
      ],
    },
    {
      title: 'Trace which entries are processed and which are stale',
      explanation: [
        'Printing each popped entry with whether it is current shows the algorithm’s order: current entries come out in nondecreasing distance, and each vertex is processed exactly once, at its final distance.',
        'Stale entries still come out of the heap, after the improved entry for the same vertex, and are skipped.',
      ],
      example: {
        code: dijkstra(
          '[[(1, 4), (2, 1)], [(3, 1)], [(1, 2), (3, 5)], [], []]',
          'print(cost, vertex, cost == distance[vertex])',
        ),
        output: '0 0 True\n1 2 True\n3 1 True\n4 1 False\n4 3 True\n6 3 False',
        explanation:
          'Vertex 1’s first proposal 4 and vertex 3’s first proposal 6 were both improved, so those entries come out stale.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          dijkstra(
            '[[(1, 5), (2, 1)], [], [(1, 1)]]',
            'print(cost, vertex, cost == distance[vertex])',
          ),
          [
            '0 0 True\n1 2 True\n2 1 True\n5 1 False',
            '0 0 True\n5 1 True\n1 2 True\n2 1 False',
            '0 0 True\n1 2 True\n2 1 True',
            '0 0 True\n1 2 True\n5 1 False\n2 1 True',
          ],
          0,
          'The route through 2 improves vertex 1 to 2, so (2, 1) is current and the older (5, 1) comes out stale at the end.',
        ),
        choose(
          'In what order do the current entries leave the heap?',
          [
            'In the order they were pushed',
            'In nondecreasing order of distance',
            'In increasing vertex number',
            'In the order of the input edges',
          ],
          1,
          'The heap always yields the smallest distance, and later relaxations never go below it.',
        ),
        choose(
          'How many times is each reachable vertex’s edge list scanned?',
          [
            'Once per heap entry for it',
            'Once per incoming edge',
            'Once, when its current entry is popped',
            'Twice',
          ],
          2,
          'Stale entries are skipped, and each vertex has exactly one current entry popped.',
        ),
        predictOutput(
          'Which popped entries are current?',
          lines(
            'checks = []',
            dijkstra(
              '[[(1, 9), (2, 1)], [], [(1, 1)]]',
              'checks.append(cost == distance[vertex])',
            ),
            'print(checks)',
          ),
          [
            '[True, True, True, True]',
            '[True, False, True, True]',
            '[True, True, False]',
            '[True, True, True, False]',
          ],
          3,
          'Vertices 0, 2 and 1 are processed in turn; the original (9, 1) proposal comes out last and is stale.',
        ),
      ],
    },
    {
      title: 'Reject negative weights and bound the cost',
      explanation: [
        'With nonnegative weights, a popped current distance is final: any other route must pass through a vertex whose distance is at least as large, and adding nonnegative weights cannot make it smaller. A negative edge breaks that argument, so this contract rejects negative weights with ValueError, even in an unreachable part of the graph.',
        'The lazy heap gets at most one entry per improvement, so it holds O(V + E) entries. Each push and pop costs O(log(V + E)), for O((V + E) log(V + E)) time and O(V + E) space in total.',
      ],
      example: {
        code: lines(
          shortestCosts,
          'print(shortest_costs(3, [(0, 1, 4), (1, 2, 0)], 0))',
          'try:',
          '    shortest_costs(2, [(1, 0, -1)], 0)',
          'except ValueError as error:',
          '    print("rejected:", error)',
        ),
        output: '[0, 4, 4]\nrejected: negative weight',
        explanation:
          'The zero-weight edge keeps vertex 2 at 4. The second graph is rejected even though its negative edge starts at a vertex the source never reaches.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            shortestCosts,
            'print(shortest_costs(3, [(0, 1, 3), (1, 0, 0), (0, 1, 1), (1, 2, 2)], 0))',
          ),
          '[0, 1, 3]',
          'The cheaper parallel edge gives 1 its distance 1, and 2 follows at 1 + 2 = 3; the zero-weight edge back to 0 changes nothing.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            shortestCosts,
            'try:',
            '    print(shortest_costs(3, [(0, 1, 2), (2, 2, -1)], 0))',
            'except ValueError as error:',
            '    print("rejected:", error)',
          ),
          'rejected: negative weight',
          'Weights are checked while the graph is built, before any search, so the unreachable negative self-loop is still rejected.',
        ),
        choose(
          'Why can a popped current distance be treated as final when all weights are nonnegative?',
          [
            'Other routes pass a vertex at least as far, and weights cannot reduce it',
            'The heap stores each vertex only once',
            'Vertices are popped in index order',
            'Each edge is relaxed exactly once',
          ],
          0,
          'Any alternative route leaves the processed region through a vertex no closer, and nonnegative weights only add to that.',
        ),
        choose(
          'With parallel edges allowed, which time bound fits the lazy-heap Dijkstra?',
          ['O(V + E)', 'O(V · E)', 'O(V²)', 'O((V + E) log(V + E))'],
          3,
          'Up to V + E heap entries are pushed and popped, each at logarithmic cost.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------- disjoint sets
  'cp-parent-root': [
    {
      title: 'Follow parent links until a vertex points to itself',
      explanation: [
        'A disjoint-set forest stores parent[v] for every vertex. A root is its own parent, parent[r] == r, and represents its whole set. Following parent links from any member eventually reaches that root.',
        'Two vertices are in the same set exactly when they reach the same root.',
      ],
      example: {
        code: lines(
          findRoot,
          'parent = [0, 0, 1, 3, 3]',
          'print(find_root(parent, 2), find_root(parent, 4), find_root(parent, 3))',
        ),
        output: '0 3 3',
        explanation:
          '2 climbs to 1 and then to the root 0. 4 climbs to 3, which is its own parent.',
      },
      questions: [
        choose(
          'What identifies a root in a parent array?',
          [
            'Its index is 0',
            'parent[r] == r',
            'It has the most children',
            'parent[r] is None',
          ],
          1,
          'A root is the one vertex in its set that points to itself.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            findRoot,
            'parent = [1, 1, 1, 2]',
            'print(find_root(parent, 3), find_root(parent, 0))',
          ),
          '1 1',
          '3 climbs to 2 and then to 1; 0 climbs straight to 1. Vertex 1 points to itself.',
        ),
        predictOutput(
          'Are these pairs in the same set?',
          lines(
            findRoot,
            'parent = [0, 0, 2, 2, 0]',
            'print(find_root(parent, 4) == find_root(parent, 1), find_root(parent, 3) == find_root(parent, 1))',
          ),
          ['True False', 'True True', 'False False', 'False True'],
          0,
          '4 and 1 both reach root 0, while 3 reaches root 2.',
        ),
        typeNumber(
          'parent = [0, 1, 2, 3]. How many sets are there?',
          4,
          'Every vertex is its own parent, so each is a root of a one-vertex set.',
        ),
      ],
    },
    {
      title: 'Find roots with a loop on tall chains',
      explanation: [
        'The loop takes one step per link, so a find costs the length of the path to the root. In an unbalanced forest that path can include every vertex.',
        'A loop handles such tall chains safely; a recursive find would add one Python call per link and can exceed the recursion limit.',
      ],
      example: {
        code: lines(
          countHops,
          'chain = [0, 0, 1, 2, 3, 4]',
          'print(hops(chain, 5), hops(chain, 0))',
        ),
        output: '5 0',
        explanation:
          '5 climbs through 4, 3, 2 and 1 to reach 0: five links. The root needs none.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(countHops, 'print(hops([0, 0, 1, 2], 3))'),
          '3',
          '3 → 2 → 1 → 0 follows three links.',
        ),
        choose(
          'A forest is a single chain of 100,000 vertices. Why is a recursive find risky in Python?',
          [
            'It returns the wrong root',
            'One call per link exceeds the recursion limit',
            'Recursion cannot read lists',
            'It changes the parent array',
          ],
          1,
          'Python allows only about 1,000 nested calls by default.',
        ),
        typeOutput(
          'What is printed?',
          lines(countHops, 'print(hops(list(range(6)), 4))'),
          '0',
          'Every vertex in list(range(6)) is its own parent, so 4 is already a root.',
        ),
        choose(
          'Without balancing or compression, what does one find cost?',
          [
            'The length of the path to the root, up to n',
            'O(1) always',
            'O(log n) always',
            'O(n²)',
          ],
          0,
          'It follows one link per step, and an unbalanced chain can make that path long.',
        ),
      ],
    },
  ],
  'cp-compress-path': [
    {
      title: 'Point every vertex on the path at the root',
      explanation: [
        'Path compression first finds the root of vertex, then walks the same path again, setting each visited vertex’s parent to the root. Later finds from those vertices take one step.',
        'Only the vertices on that path change. Other branches and other sets keep their parent entries, and no vertex changes sets.',
      ],
      example: {
        code: lines(compressPath, 'print(compress([1, 2, 2, 1, 3], 4))'),
        output: '[1, 2, 2, 2, 2]',
        explanation:
          '4, 3 and 1 lie on the path to root 2 and now point straight at it. Vertex 0 hangs off 1 but was not on the path, so it still points to 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(compressPath, 'print(compress([0, 0, 1, 2], 3))'),
          '[0, 0, 0, 0]',
          '3, 2 and 1 are all on the path to root 0, so each now points to 0.',
        ),
        typeOutput(
          'What is printed?',
          lines(compressPath, 'print(compress([0, 0, 1, 2, 2], 3))'),
          '[0, 0, 0, 0, 2]',
          'Only 3, 2 and 1 are on the searched path. Vertex 4 hangs off 2 and keeps its parent.',
        ),
        choose(
          'Does path compression change which set a vertex belongs to?',
          [
            'No, every rewritten vertex keeps the same root',
            'Yes, it moves the vertex to the root’s set',
            'Only for vertices off the path',
            'Only when the root is 0',
          ],
          0,
          'Each rewritten vertex points to the root it already reached, so membership is unchanged.',
        ),
        choose(
          'Why does the second loop save next_vertex = result[vertex] before rewriting result[vertex]?',
          [
            'To count the set size',
            'To find a second root',
            'To continue along the original path',
            'To sort the path',
          ],
          2,
          'After the rewrite, result[vertex] is the root, so the old next step would be lost.',
        ),
      ],
    },
    {
      title: 'Compressed paths make later finds shorter',
      explanation: [
        'After compression, every vertex on the searched path is one link from its root, so repeating the find costs a single step. Over many operations this keeps the forest shallow.',
        'The iterative variant used in full DSU code redirects each vertex to its grandparent while climbing, parent[v] = parent[parent[v]], which roughly halves the path in a single pass.',
      ],
      example: {
        code: lines(
          countHops,
          compressPath,
          'parent = [0, 0, 1, 2, 3]',
          'print(hops(parent, 4))',
          'parent = compress(parent, 4)',
          'print(hops(parent, 4), hops(parent, 2))',
        ),
        output: '4\n1 1',
        explanation:
          'Before compression vertex 4 is four links from the root; afterwards it and every vertex on its path are one link away.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            countHops,
            compressPath,
            'parent = compress([0, 0, 1, 2], 3)',
            'print(hops(parent, 3), parent)',
          ),
          '1 [0, 0, 0, 0]',
          'Every vertex on the path now points at the root 0, so 3 needs one link.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'def find_halving(parent, vertex):',
            '    while parent[vertex] != vertex:',
            '        parent[vertex] = parent[parent[vertex]]',
            '        vertex = parent[vertex]',
            '    return vertex',
            '',
            'parent = [0, 0, 1, 2, 3]',
            'print(find_halving(parent, 4), parent)',
          ),
          '0 [0, 0, 0, 2, 2]',
          '4 jumps to its grandparent 2, then 2 jumps to its grandparent 0; vertex 3 is skipped and keeps its parent.',
        ),
        choose(
          'After compress(parent, v), how many links does a find from v follow?',
          ['None', 'The same as before', 'Twice as many', 'At most one'],
          3,
          'v now points directly at its root, or is the root itself.',
        ),
        choose(
          'What does parent[v] = parent[parent[v]] do during a find?',
          [
            'Points v at its grandparent, shortening the path',
            'Makes v a root',
            'Moves v to another set',
            'Swaps v with its parent',
          ],
          0,
          'The grandparent is in the same set and closer to the root.',
        ),
      ],
    },
  ],
  'cp-union-size': [
    {
      title: 'Attach the smaller root under the larger',
      explanation: [
        'To merge two sets whose roots are known, make one root the parent of the other. Union by size attaches the root of the smaller set under the root of the larger set and adds the sizes at the surviving root.',
        'Only root sizes are read later, so the attached root’s old size entry can stay as it is. Under this course’s contract, equal sizes keep the first root.',
      ],
      example: {
        code: lines(joinRoots, 'print(join_roots([0, 0, 2], [2, 1, 1], 2, 0))'),
        output: '([0, 0, 0], [3, 1, 1])',
        explanation:
          'Root 2’s set has size 1 and root 0’s has size 2, so 2 is attached under 0, whose size becomes 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            joinRoots,
            'print(join_roots([0, 1, 1, 1], [1, 3, 1, 1], 0, 1))',
          ),
          '([1, 1, 1, 1], [1, 4, 1, 1])',
          'Root 0’s set is smaller (1 against 3), so 0 goes under 1, and size[1] becomes 4.',
        ),
        typeOutput(
          'What is printed?',
          lines(joinRoots, 'print(join_roots([0, 1], [1, 1], 1, 0))'),
          '([1, 1], [1, 2])',
          'The sizes tie, so the first root, 1, survives and 0 is attached under it.',
        ),
        choose(
          'A set of size 10 with root 4 is merged with a set of size 3 with root 7. What changes?',
          [
            'parent[4] becomes 7',
            'Both roots point to 0',
            'size[7] becomes 13',
            'parent[7] becomes 4, and size[4] becomes 13',
          ],
          3,
          'The smaller set’s root, 7, goes under the larger set’s root, 4, which records the combined size.',
        ),
        choose(
          'Where is the merged size stored?',
          [
            'At the surviving root',
            'At every member',
            'At the attached root',
            'Nowhere; it is recomputed',
          ],
          0,
          'Sizes are read only at roots, so the survivor’s entry is the one that matters.',
        ),
      ],
    },
    {
      title: 'Skip self-merges and keep trees shallow',
      explanation: [
        'If both roots are the same, the vertices are already in one set: nothing changes, and the size must not double.',
        'Attaching the smaller set under the larger means a vertex gets one link deeper only when its set at least doubles in size, so no path to a root is longer than about log₂ n links, even without compression.',
      ],
      example: {
        code: lines(
          joinRoots,
          'print(join_roots([0, 0, 2], [2, 1, 1], 0, 0))',
          'print(join_roots([0, 0, 2], [2, 1, 1], 0, 2))',
        ),
        output: '([0, 0, 2], [2, 1, 1])\n([0, 0, 0], [3, 1, 1])',
        explanation:
          'Joining root 0 with itself changes nothing. Joining it with root 2 attaches the smaller set and adds the sizes.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(joinRoots, 'print(join_roots([1, 1], [1, 2], 1, 1))'),
          '([1, 1], [1, 2])',
          'Both arguments are the same root, so both arrays are returned unchanged.',
        ),
        choose(
          'What goes wrong if the same-root check is skipped and a root is joined with itself?',
          [
            'Its parent stays itself, but its size doubles',
            'The root gets a new parent',
            'An IndexError is raised',
            'Nothing at all',
          ],
          0,
          'parent[r] = r changes nothing, but size[r] += size[r] counts the set twice.',
        ),
        predictOutput(
          'Each union here attaches the larger set’s root under a single new vertex. How deep does vertex 0 end up?',
          lines(
            countHops,
            'parent = list(range(4))',
            'for root in [0, 1, 2]:',
            '    parent[root] = root + 1',
            'print(hops(parent, 0))',
          ),
          ['1', '2', '4', '3'],
          3,
          'Ignoring sizes builds the chain 0 → 1 → 2 → 3, so 0 is three links deep; union by size would keep it at 1.',
        ),
        choose(
          'With union by size on n vertices, how long can the path from a vertex to its root get?',
          [
            'Up to n − 1 links',
            'Exactly 1 link',
            'About log₂ n links',
            'About n / 2 links',
          ],
          2,
          'Each extra link means the vertex’s set at least doubled, which can happen only about log₂ n times.',
        ),
      ],
    },
  ],
  'cp-dsu': [
    {
      title: 'Merge components as undirected edges arrive',
      explanation: [
        'Disjoint set union starts with every vertex as its own set: parent = list(range(n)), every size 1, and n components. For each undirected edge (u, v), find both roots; if they differ, union them by size and decrease the component count by one.',
        'An edge whose endpoints already share a root, including a repeated edge or a self-loop, changes nothing.',
      ],
      example: {
        code: lines(
          dsuRun(6, '[(1, 2), (3, 4), (2, 1), (5, 5), (4, 1)]'),
          'print(counts)',
        ),
        output: '[5, 4, 4, 4, 3]',
        explanation:
          'The repeated edge (2, 1) and the self-loop (5, 5) connect vertices already together. (4, 1) joins two sets.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(dsuRun(4, '[(0, 1), (1, 0), (2, 3), (0, 2)]'), 'print(counts)'),
          '[3, 3, 2, 1]',
          'The repeated edge (1, 0) changes nothing; the other three edges each merge two sets.',
        ),
        typeOutput(
          'What is printed?',
          lines(dsuRun(3, '[(2, 2), (0, 0)]'), 'print(counts)'),
          '[3, 3]',
          'A self-loop’s endpoints share a root, so neither edge merges anything.',
        ),
        choose(
          'Vertices 3 and 8 already share a root when the edge (3, 8) arrives. What changes?',
          [
            'Nothing; they are already connected',
            'The count drops by one',
            'Both get new roots',
            'The count rises by one',
          ],
          0,
          'The edge adds no new connection between different components.',
        ),
        choose(
          'Before any edge arrives, how many components do n vertices form?',
          ['0', '1', 'n', 'n − 1'],
          2,
          'Every vertex starts as its own set.',
        ),
      ],
    },
    {
      title: 'Answer connectivity questions with find',
      explanation: [
        'After the edges are processed, u and v are connected exactly when find(u) == find(v). A set’s size is read at its root, size[find(v)].',
        'DSU answers undirected connectivity only. It does not store paths, distances or edge directions.',
      ],
      example: {
        code: lines(
          dsuRun(5, '[(0, 1), (3, 4), (1, 3)]'),
          'print(find(0) == find(4), find(2) == find(0), size[find(4)])',
        ),
        output: 'True False 4',
        explanation:
          '0 and 4 are joined through 1 and 3; vertex 2 never received an edge. The set holding 4 has four members.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            dsuRun(6, '[(0, 5), (1, 2), (2, 5)]'),
            'print(find(1) == find(0), find(3) == find(4), size[find(5)])',
          ),
          'True False 4',
          '0, 5, 1 and 2 end up in one set of size 4; 3 and 4 never received an edge.',
        ),
        choose(
          'A road network is processed with DSU. Which question can it answer directly?',
          [
            'How many roads lie on the shortest route',
            'Whether two towns are connected at all',
            'Which town must be visited first',
            'The cheapest route between two towns',
          ],
          1,
          'DSU tracks which vertices share a component, nothing about routes.',
        ),
        typeOutput(
          'What is printed?',
          lines(dsuRun(3, '[(0, 1)]'), 'print(size[1], size[find(1)])'),
          '1 2',
          'Vertex 1 was attached under root 0; its own size entry is stale, and the true size is read at the root.',
        ),
        choose(
          'Directed edges 0 → 1 and 1 → 2 are fed to DSU as pairs. What does DSU conclude about 2 and 0?',
          [
            '2 can reach 0',
            '0 cannot reach 2',
            'Nothing, since the edges are directed',
            'They are connected, ignoring direction',
          ],
          3,
          'DSU treats every pair as an undirected connection.',
        ),
      ],
    },
    {
      title: 'Rely on amortized near-constant operations',
      explanation: [
        'With union by size and path compression together, a sequence of operations takes amortized O(α(n)) time each, where the inverse Ackermann function α(n) is at most 4 for any realistic n. That is an average over the sequence, not a promise that every single find takes one step.',
        'Initialization costs O(n), and the parent and size arrays use O(n) space. Union by size alone already keeps every path within about log₂ n links.',
      ],
      example: {
        code: sizeOnlyUnions(
          8,
          '[(0, 1), (2, 3), (4, 5), (6, 7), (0, 2), (4, 6), (0, 4)]',
        ),
        output: '[0, 1, 1, 2, 1, 2, 2, 3]',
        explanation:
          'Every merge joins two equal-sized sets, the worst case for depth, yet the deepest vertex, 7, is only 3 = log₂ 8 links from its root.',
      },
      questions: [
        choose(
          'What does amortized O(α(n)) per operation promise for DSU?',
          [
            'Every single find takes one step',
            'The average over a sequence is almost constant',
            'Each union takes exactly O(log n)',
            'Finds never change the parent array',
          ],
          1,
          'Amortized bounds average the cost over many operations; one find can still climb several links.',
        ),
        choose(
          'What does initializing DSU for n vertices cost?',
          ['O(1)', 'O(n log n)', 'O(n)', 'O(n²)'],
          2,
          'It fills a parent and a size entry for each vertex.',
        ),
        predictOutput(
          'How many links from the root is each vertex?',
          sizeOnlyUnions(4, '[(0, 1), (2, 3), (0, 2)]'),
          ['[0, 1, 2, 3]', '[0, 1, 1, 1]', '[0, 0, 1, 1]', '[0, 1, 1, 2]'],
          3,
          '1 and 2 hang directly under root 0, and 3 sits under 2: the deepest path is two links, which is log₂ 4.',
        ),
        choose(
          'Which combination gives DSU its near-constant amortized time?',
          [
            'Union by size with path compression',
            'Sorting the edges first',
            'Recursive find without compression',
            'Storing every set as a list',
          ],
          0,
          'Size-based unions keep trees shallow, and compression flattens the paths that finds use.',
        ),
      ],
    },
  ],
  // --------------------------------------------------- spanning trees
  'cp-edge-weight-order': [
    {
      title: 'Sort (u, v, weight) edges by their third field',
      explanation: [
        'Kruskal’s algorithm considers edges from cheapest to most expensive. With edges stored as (u, v, weight), plain sorted(edges) orders by u first, so the key must pick out the weight: key=lambda edge: edge[2].',
        'Negative weights sort before positive ones like any other numbers, and every edge occurrence, including duplicates, stays in the list.',
      ],
      example: {
        code: lines(
          'edges = [(0, 1, 7), (1, 2, 2), (0, 2, 4)]',
          'print(sorted(edges))',
          'print(sorted(edges, key=lambda edge: edge[2]))',
        ),
        output:
          '[(0, 1, 7), (0, 2, 4), (1, 2, 2)]\n[(1, 2, 2), (0, 2, 4), (0, 1, 7)]',
        explanation:
          'Without a key the tuples compare by their first endpoint; the key orders them by weight.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'edges = [(2, 3, 5), (0, 1, 9), (1, 4, -2)]',
            'print(sorted(edges, key=lambda edge: edge[2]))',
          ),
          [
            '[(0, 1, 9), (1, 4, -2), (2, 3, 5)]',
            '[(1, 4, -2), (2, 3, 5), (0, 1, 9)]',
            '[(2, 3, 5), (0, 1, 9), (1, 4, -2)]',
            '[(0, 1, 9), (2, 3, 5), (1, 4, -2)]',
          ],
          1,
          'Weights −2, 5 and 9 in ascending order; the negative weight comes first.',
        ),
        choose(
          'Edges are stored as (u, v, weight). Why is sorted(edges) without a key wrong for Kruskal?',
          [
            'It orders edges by their first endpoint',
            'It removes duplicate edges',
            'It cannot compare tuples',
            'It sorts in descending order',
          ],
          0,
          'Tuples compare field by field, starting with u.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            'edges = [(0, 1, 3), (0, 1, 3), (1, 2, 1)]',
            'print(len(sorted(edges, key=lambda edge: edge[2])))',
          ),
          '3',
          'Sorting keeps every occurrence, including the duplicate edge.',
        ),
        choose(
          'Where does an edge of weight −4 go in Kruskal’s order?',
          [
            'Last, after every positive weight',
            'It is discarded',
            'Before every larger weight, as a normal number',
            'Wherever it appeared in the input',
          ],
          2,
          'Negative weights are ordinary numbers and are the cheapest candidates.',
        ),
      ],
    },
    {
      title: 'Break ties for a reproducible order',
      explanation: [
        'Several edges may share a weight. Any order among them still yields a minimum total, but a fixed tie rule makes traces reproducible: sort by (weight, u, v).',
        'Python’s sort is stable, so with the weight alone as the key, equal-weight edges keep their input order instead.',
      ],
      example: {
        code: lines(
          'edges = [(2, 3, 4), (0, 1, 4), (1, 2, 1)]',
          'print(sorted(edges, key=lambda edge: (edge[2], edge[0], edge[1])))',
          'print(sorted(edges, key=lambda edge: edge[2]))',
        ),
        output:
          '[(1, 2, 1), (0, 1, 4), (2, 3, 4)]\n[(1, 2, 1), (2, 3, 4), (0, 1, 4)]',
        explanation:
          'With the full key, (0, 1, 4) precedes (2, 3, 4). With the weight alone, the two weight-4 edges stay in input order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'edges = [(3, 1, 2), (0, 4, 2), (0, 2, 2)]',
            'print(sorted(edges, key=lambda edge: (edge[2], edge[0], edge[1])))',
          ),
          [
            '[(3, 1, 2), (0, 4, 2), (0, 2, 2)]',
            '[(0, 4, 2), (0, 2, 2), (3, 1, 2)]',
            '[(0, 2, 2), (0, 4, 2), (3, 1, 2)]',
            '[(0, 2, 2), (3, 1, 2), (0, 4, 2)]',
          ],
          2,
          'All weights tie, so u decides, and v settles the two edges with u = 0.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'edges = [(3, 1, 2), (0, 4, 2), (0, 2, 2)]',
            'print(sorted(edges, key=lambda edge: edge[2]))',
          ),
          [
            '[(3, 1, 2), (0, 4, 2), (0, 2, 2)]',
            '[(0, 2, 2), (0, 4, 2), (3, 1, 2)]',
            '[(0, 4, 2), (0, 2, 2), (3, 1, 2)]',
            '[(0, 2, 2), (3, 1, 2), (0, 4, 2)]',
          ],
          0,
          'Every key is 2, and a stable sort leaves equal keys in their input order.',
        ),
        choose(
          'Which key sorts (u, v, weight) edges by weight, then u, then v?',
          [
            'lambda edge: (edge[0], edge[1], edge[2])',
            'lambda edge: (edge[2], edge[1], edge[0])',
            'lambda edge: edge[2]',
            'lambda edge: (edge[2], edge[0], edge[1])',
          ],
          3,
          'The key lists the fields in priority order: weight first, then u, then v.',
        ),
        choose(
          'Two edges tie on weight. Does their order change the total weight Kruskal’s algorithm finds?',
          [
            'Yes; the lower-numbered edge is always cheaper',
            'No; it may change which edges are chosen, not the total',
            'Yes; ties make the result invalid',
            'No; tied edges are never chosen',
          ],
          1,
          'Swapping equal-weight edges cannot change the sum, though a different tree may result.',
        ),
      ],
    },
  ],
  'cp-forest-cycle-check': [
    {
      title: 'Accept an edge only between different components',
      explanation: [
        'The selected edges form a forest. An edge whose endpoints are already in the same component would close a cycle, so it is rejected. An edge between two different components joins them without a cycle.',
        'Here equal labels mark the same component. A self-loop always has both endpoints in one component, so it is always rejected.',
      ],
      example: {
        code: lines(
          acceptEdge,
          'print(accept([0, 0, 2, 2], 1, 2))',
          'print(accept([0, 0, 2, 2], 3, 2))',
        ),
        output: '(True, [0, 0, 0, 0])\n(False, [0, 0, 2, 2])',
        explanation:
          '1 and 2 are in different components, so the edge is accepted and the components merge. 3 and 2 already share label 2.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(acceptEdge, 'print(accept([0, 1, 1, 3], 1, 2))'),
          '(False, [0, 1, 1, 3])',
          '1 and 2 both carry label 1, so the edge would close a cycle and the labels are unchanged.',
        ),
        choose(
          'Why is a self-loop never accepted into the forest?',
          [
            'Its weight is always negative',
            'Its endpoints are in different components',
            'Its single endpoint is already in its own component',
            'It would disconnect the graph',
          ],
          2,
          'Both ends are the same vertex, so they trivially share a component.',
        ),
        typeOutput(
          'What is printed?',
          lines(acceptEdge, 'print(accept([5, 5, 7, 7, 9], 4, 0))'),
          '(True, [9, 9, 7, 7, 9])',
          'Labels 9 and 5 differ, so the edge is accepted and every 5 is relabelled 9, the label of u = 4.',
        ),
        choose(
          'The components so far are {0, 1, 2} and {3}. Which candidate edge would close a cycle?',
          ['(2, 3)', '(1, 3)', '(0, 3)', '(0, 2)'],
          3,
          '0 and 2 are already connected; every other edge joins the two components.',
        ),
      ],
    },
    {
      title: 'Merge the two components after accepting',
      explanation: [
        'Accepting an edge joins its two components into one. In this small model, every vertex carrying v’s label is relabelled with u’s label, so later checks see a single component.',
        'Forgetting to merge would let a later edge between the same two components be accepted again, creating a cycle.',
      ],
      example: {
        code: lines(
          acceptEdge,
          'labels = [0, 1, 2, 3]',
          'for u, v in [(0, 1), (2, 3), (1, 0), (1, 3)]:',
          '    accepted, labels = accept(labels, u, v)',
          '    print(accepted, labels)',
        ),
        output:
          'True [0, 0, 2, 3]\nTrue [0, 0, 2, 2]\nFalse [0, 0, 2, 2]\nTrue [0, 0, 0, 0]',
        explanation:
          '(1, 0) is rejected because the first edge already merged 0 and 1. (1, 3) joins the two remaining components.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            acceptEdge,
            'labels = [0, 1, 2]',
            'results = []',
            'for u, v in [(0, 1), (1, 2), (2, 0)]:',
            '    accepted, labels = accept(labels, u, v)',
            '    results.append(accepted)',
            'print(results)',
          ),
          '[True, True, False]',
          'The first two edges join all three vertices, so (2, 0) would close a triangle.',
        ),
        typeOutput(
          'This check never merges labels. What does it print?',
          lines(
            'def accept_no_merge(labels, u, v):',
            '    return labels[u] != labels[v]',
            '',
            'labels = [0, 1, 2]',
            'print([accept_no_merge(labels, u, v) for u, v in [(0, 1), (1, 2), (0, 2)]])',
          ),
          '[True, True, True]',
          'The labels never change, so the third edge is wrongly accepted and the selection contains a cycle.',
        ),
        choose(
          'Labels are [4, 4, 6, 6], and edge (0, 3) is accepted. Which labels result?',
          ['[4, 4, 4, 4]', '[6, 6, 6, 6]', '[4, 4, 6, 4]', '[4, 6, 6, 6]'],
          0,
          'Every vertex with v’s label 6 takes u’s label 4, not just vertex 3.',
        ),
        choose(
          'n vertices start as n components. At most how many edges can be accepted?',
          ['n', 'n / 2', 'n − 1', 'Any number'],
          2,
          'Each accepted edge removes one component, and at least one component always remains.',
        ),
      ],
    },
  ],
  'cp-spanning-completion': [
    {
      title: 'A spanning forest needs exactly n − 1 edges',
      explanation: [
        'Each accepted forest edge joins two components, lowering the count by one. Starting from n separate vertices, n − 1 accepted edges leave a single component: a spanning tree.',
        'If fewer than n − 1 edges were accepted after every candidate was considered, some components never joined and the graph has no spanning tree. An empty or one-vertex graph needs no edges and costs 0 under this course’s convention.',
      ],
      example: {
        code: lines(
          completedCost,
          'print(completed_cost(4, [2, 5, 1]))',
          'print(completed_cost(4, [2, 5]))',
          'print(completed_cost(1, []))',
        ),
        output: '8\nNone\n0',
        explanation:
          'Three edges span four vertices. Two edges leave two components. One vertex is already spanned.',
      },
      questions: [
        typeNumber(
          'A forest on 9 vertices must become a spanning tree. How many edges must be accepted?',
          8,
          'Nine separate vertices need eight merges to become one component.',
        ),
        typeOutput(
          'What does this program print?',
          lines(
            completedCost,
            'print(completed_cost(3, [4, -1]), completed_cost(3, [4]))',
          ),
          '3 None',
          'Two edges span three vertices, and negative costs are allowed; one edge does not.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            completedCost,
            'print(completed_cost(0, []), completed_cost(2, []))',
          ),
          '0 None',
          'An empty graph needs no edges; two vertices need one.',
        ),
        choose(
          'After all candidates, an acyclic selection on 7 vertices has 5 edges. What does that mean?',
          [
            'It is a spanning tree',
            'One more edge must be a self-loop',
            'Two components remain, so no spanning tree exists',
            'The total weight must be zero',
          ],
          2,
          'Five merges from seven components leave two.',
        ),
      ],
    },
    {
      title: 'Count edges only after filtering cycles',
      explanation: [
        'The n − 1 test is valid only for an acyclic selection. Arbitrary edges can number n − 1 while containing a cycle and leaving another vertex isolated.',
        'So the completion check comes after the forest check: count only the accepted edges.',
      ],
      example: {
        code: acceptedCount(4, '[(0, 1), (1, 2), (2, 0)]'),
        output: '2 False',
        explanation:
          'Three candidates is n − 1 for n = 4, but the third closes a cycle. Only two are accepted, and vertex 3 is still alone.',
      },
      questions: [
        choose(
          'Edges (0, 1), (1, 2) and (2, 0) are chosen on 4 vertices. Why is this not a spanning tree, though it has n − 1 edges?',
          [
            'The edges form a cycle and vertex 3 is isolated',
            'The weights are not sorted',
            'A spanning tree needs n edges',
            'Vertex 0 appears twice',
          ],
          0,
          'A cycle wastes an edge, so the remaining edges cannot reach every vertex.',
        ),
        typeOutput(
          'What does this program print?',
          acceptedCount(5, '[(0, 1), (2, 3), (1, 0), (3, 4), (4, 2)]'),
          '3 False',
          '(1, 0) and (4, 2) close cycles, so only three edges join the five vertices, leaving two components.',
        ),
        choose(
          'Which statement holds for an acyclic selection on n vertices?',
          [
            'It is spanning exactly when it has n edges',
            'It is spanning whenever every vertex has an edge',
            'It is never spanning',
            'It is spanning exactly when it has n − 1 edges',
          ],
          3,
          'Without cycles, every edge merges two components, so n − 1 edges leave exactly one.',
        ),
        typeOutput(
          'What is printed?',
          acceptedCount(3, '[(0, 1), (0, 1), (1, 2)]'),
          '2 True',
          'The repeated (0, 1) is rejected; the other two edges span all three vertices.',
        ),
      ],
    },
  ],
  'cp-mst': [
    {
      title: 'Build a minimum spanning tree with Kruskal’s algorithm',
      explanation: [
        'Kruskal’s algorithm sorts the edges by weight, then scans them cheapest first, accepting an edge exactly when its endpoints have different DSU roots. Each accepted edge merges two components and adds its weight to the total.',
        'The cut property makes this safe: the cheapest edge crossing between two components can always be part of some minimum spanning tree.',
      ],
      example: {
        code: kruskal(
          4,
          '[(0, 1, 4), (1, 2, 2), (0, 2, 5), (2, 3, 1), (1, 3, 3)]',
        ),
        output: '[1, 2, 4] 7',
        explanation:
          'Weights 1 and 2 join 1, 2 and 3; the weight-3 edge would close a cycle; weight 4 brings in vertex 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          kruskal(3, '[(0, 1, 5), (1, 2, 3), (0, 2, 4)]'),
          '[3, 4] 7',
          'Edges 3 and 4 connect all three vertices; the weight-5 edge would close a cycle.',
        ),
        choose(
          'Why does Kruskal reject an edge whose endpoints already share a DSU root?',
          [
            'It would close a cycle in the chosen forest',
            'Its weight must be negative',
            'It must be the most expensive edge',
            'It would disconnect a vertex',
          ],
          0,
          'The endpoints are already connected by chosen edges.',
        ),
        typeOutput(
          'What is printed?',
          kruskal(3, '[(0, 1, 2), (0, 1, -1), (1, 2, 0), (2, 0, 5)]'),
          '[-1, 0] -1',
          'The cheaper parallel edge −1 and the edge 0 span all three vertices; the other two edges would close cycles.',
        ),
        choose(
          'How does a minimum spanning tree differ from shortest paths from vertex 0?',
          [
            'It is always identical to the shortest-path tree',
            'It minimizes the number of edges on every route',
            'It only works on directed graphs',
            'It minimizes total weight joining all vertices, not routes from 0',
          ],
          3,
          'An MST optimizes the whole network’s cost; a route from 0 inside it may be longer than the shortest one.',
        ),
      ],
    },
    {
      title: 'Report None when the graph is disconnected',
      explanation: [
        'If the scan ends with fewer than n − 1 accepted edges, some components could not be joined: no spanning tree exists, so return None rather than the partial total. For n = 0 or n = 1, the empty tree costs 0.',
        'Self-loops never join two components, and of several parallel edges at most one is accepted: the cheapest, because it is scanned first.',
      ],
      example: {
        code: lines(
          minimumLinkCost,
          'print(minimum_link_cost(4, [(0, 1, 3), (2, 3, 1)]))',
          'print(minimum_link_cost(1, []))',
          'print(minimum_link_cost(2, [(0, 1, 6), (0, 1, 2), (1, 1, -5)]))',
        ),
        output: 'None\n0\n2',
        explanation:
          'The first graph keeps two components. A single vertex costs 0. The negative self-loop is rejected, and the cheaper parallel edge 2 is chosen.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          lines(
            minimumLinkCost,
            'print(minimum_link_cost(3, [(0, 1, 1), (1, 1, -9), (0, 1, 4)]), minimum_link_cost(0, []))',
          ),
          'None 0',
          'Vertex 2 has no edge, so three vertices cannot be spanned; an empty graph costs 0.',
        ),
        choose(
          'A graph on 5 vertices yields only 3 accepted edges. What should the function return?',
          [
            'The total of those 3 edges',
            'None, because the graph is disconnected',
            '0',
            'The weight of the cheapest edge',
          ],
          1,
          'A spanning tree on 5 vertices needs 4 edges, so none exists.',
        ),
        typeOutput(
          'What is printed?',
          lines(
            minimumLinkCost,
            'print(minimum_link_cost(2, [(1, 0, 7), (0, 1, 7), (0, 1, 9)]))',
          ),
          '7',
          'One edge of weight 7 joins the two vertices; every other parallel edge is rejected.',
        ),
        choose(
          'Why can a self-loop never be accepted?',
          [
            'Its weight is counted twice',
            'Self-loops are removed when sorting',
            'It would leave a vertex isolated',
            'Both endpoints always share a root',
          ],
          3,
          'Its two endpoints are the same vertex, so they are already in one component.',
        ),
      ],
    },
    {
      title: 'Account for sorting and DSU costs',
      explanation: [
        'Sorting m edges costs O(m log m) and dominates; the scan then makes about 2m finds and at most n − 1 unions, each amortized O(α(n)). Including initialization, Kruskal takes O(n + m log(m + 1) + m · α(n)) time and O(n + m) space.',
        'Once n − 1 edges are accepted the tree is complete: every later edge has both endpoints in the single remaining component.',
      ],
      example: {
        code: kruskalCompletion(
          4,
          '[(0, 1, 2), (1, 3, 9), (2, 3, 1), (0, 2, 4), (1, 2, 3)]',
        ),
        output: '3 5',
        explanation:
          'The three cheapest edges, weights 1, 2 and 3, already connect all four vertices; the last two would only close cycles.',
      },
      questions: [
        choose(
          'Which step dominates Kruskal’s running time on a large graph?',
          [
            'Initializing the parent array',
            'Sorting the m edges',
            'The unions',
            'Printing the total',
          ],
          1,
          'O(m log m) for sorting outgrows the nearly constant amortized DSU work per edge.',
        ),
        choose(
          'Kruskal has accepted n − 1 edges, and more candidates remain. Why can it stop?',
          [
            'Every remaining edge joins two vertices already connected',
            'Heavier edges would lower the total',
            'Sorting failed for the rest',
            'DSU cannot handle more unions',
          ],
          0,
          'All vertices are in one component, so every later edge would close a cycle.',
        ),
        predictOutput(
          'After how many sorted edges is the tree complete?',
          kruskalCompletion(3, '[(0, 1, 5), (1, 2, 1), (0, 2, 2), (0, 1, 7)]'),
          ['4 4', '3 4', '2 4', '2 2'],
          2,
          'The two cheapest edges already join all three vertices.',
        ),
        choose(
          'What extra space does Kruskal with DSU use for n vertices and m edges?',
          ['O(1)', 'O(n²)', 'O(m log m)', 'O(n + m)'],
          3,
          'The sorted edge list takes O(m), and the parent and size arrays take O(n).',
        ),
      ],
    },
  ],
};
