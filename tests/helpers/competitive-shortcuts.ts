/**
 * Brute-force and library-shortcut solutions for the hardened Competitive
 * Programming exercises. Each "time" solution is correct (it passes every
 * small check) but too slow for the hidden large case; each "rule" solution
 * relies on a shortcut the checks disable. Most come from an audit in which
 * every one of them passed the earlier, small-input assessments.
 */
export interface Shortcut {
  rejectedBy: 'time' | 'rule';
  idea: string;
  code: string;
}

const time = (idea: string, code: string): Shortcut => ({
  rejectedBy: 'time',
  idea,
  code,
});
const rule = (idea: string, code: string): Shortcut => ({
  rejectedBy: 'rule',
  idea,
  code,
});

export const shortcuts: Record<string, Shortcut[]> = {
  'cp-complexity': [
    time(
      'walk every value up to n to count doublings',
      `def work_counts(n):
    rounds = 0
    reach = 1
    for value in range(1, n + 1):
        if value > reach:
            reach *= 2
            rounds += 1
    return (n, n * n, rounds)`,
    ),
  ],
  'cp-work-pairs': [
    time(
      'run the nested loops',
      `def pair_checks(rows, columns):
    count = 0
    for _ in range(rows):
        for _ in range(columns):
            count += 1
    return count`,
    ),
  ],
  'cp-hashing': [
    time(
      'call list.count for each label',
      `def repeat_report(labels):
    report = {}
    for label in labels:
        if label not in report:
            count = labels.count(label)
            if count >= 2:
                report[label] = count
    return report`,
    ),
  ],
  'cp-prefix-sums': [
    time(
      'sum each slice',
      `def range_totals(values, queries):
    return [sum(values[left:right]) for left, right in queries]`,
    ),
  ],
  'cp-difference-arrays': [
    time(
      'add to every position of each range',
      `def apply_additions(size, updates):
    values = [0] * size
    for left, right, delta in updates:
        for index in range(left, right):
            values[index] += delta
    return values`,
    ),
  ],
  'cp-two-pointers': [
    time(
      'test every pair',
      `def count_light_pairs(sorted_values, limit):
    count = 0
    for i in range(len(sorted_values)):
        for j in range(i + 1, len(sorted_values)):
            if sorted_values[i] + sorted_values[j] <= limit:
                count += 1
    return count`,
    ),
  ],
  'cp-sliding-window': [
    time(
      'grow a fresh window from every start',
      `def longest_variety(labels, max_types):
    best = 0
    for start in range(len(labels)):
        seen = set()
        for end in range(start, len(labels)):
            seen.add(labels[end])
            if len(seen) > max_types:
                break
            best = max(best, end - start + 1)
    return best`,
    ),
  ],
  'cp-window-repair': [
    time(
      'recount the distinct labels of every suffix',
      `def repair_left(labels, max_types):
    left = 0
    while len(set(labels[left:])) > max_types:
        left += 1
    return left`,
    ),
  ],
  'cp-binary-search': [
    time(
      'scan from the left',
      `def first_at_least(values, target):
    for index, value in enumerate(values):
        if value >= target:
            return index
    return len(values)`,
    ),
    rule(
      'call bisect_left',
      `import bisect

def first_at_least(values, target):
    return bisect.bisect_left(values, target)`,
    ),
  ],
  'cp-search-answer': [
    time(
      'try capacities upward one at a time',
      `def minimum_capacity(weights, max_groups):
    if not weights:
        return 0
    capacity = max(weights)
    while True:
        groups, current = 1, 0
        for weight in weights:
            if current + weight > capacity:
                groups += 1
                current = weight
            else:
                current += weight
        if groups <= max_groups:
            return capacity
        capacity += 1`,
    ),
  ],
  'cp-compression': [
    time(
      'search the sorted distinct list for every value',
      `def compress_values(values):
    unique = sorted(set(values))
    return [unique.index(value) for value in values]`,
    ),
  ],
  'cp-sweep-line': [
    time(
      'count active intervals at every start',
      `def maximum_overlap(intervals):
    best = 0
    for start, end in intervals:
        if start < end:
            best = max(best, sum(1 for a, b in intervals if a <= start < b))
    return best`,
    ),
  ],
  'cp-monotonic-stack': [
    time(
      'scan forward from every index',
      `def later_larger(values):
    result = []
    for index, value in enumerate(values):
        answer = None
        for later in values[index + 1:]:
            if later > value:
                answer = later
                break
        result.append(answer)
    return result`,
    ),
  ],
  'cp-heaps': [
    time(
      'take min() of a plain list for every removal',
      `def take_cheapest(stock, events):
    available = list(stock)
    taken = []
    for event in events:
        if event[0] == "add":
            available.append(event[1])
        elif available:
            cheapest = min(available)
            available.remove(cheapest)
            taken.append(cheapest)
        else:
            taken.append(None)
    return taken`,
    ),
  ],
  'cp-tries': [
    time(
      'compare every word with every prefix',
      `def prefix_counts(words, prefixes):
    return [sum(1 for word in words if word.startswith(prefix)) for prefix in prefixes]`,
    ),
  ],
  'cp-recursion': [
    rule(
      'use the ** operator',
      `def binary_power(base, exponent):
    return base ** exponent`,
    ),
  ],
  'cp-backtracking': [
    rule(
      'call itertools.combinations',
      `import itertools

def choose_channels(n, k):
    return [list(selection) for selection in itertools.combinations(range(n), k)]`,
    ),
    rule(
      'import combinations at module level',
      `from itertools import combinations

def choose_channels(n, k):
    return [list(selection) for selection in combinations(range(n), k)]`,
    ),
  ],
  'cp-bst': [
    time(
      'visit every node',
      `def bst_floor(tree, limit):
    best = None
    pending = [tree]
    while pending:
        node = pending.pop()
        if node is None:
            continue
        key, left, right = node
        if key <= limit and (best is None or key > best):
            best = key
        pending.append(left)
        pending.append(right)
    return best`,
    ),
  ],
  'cp-tree-traversal': [
    time(
      'search every subtree separately',
      `def subtree_sizes(children):
    sizes = []
    for root in range(len(children)):
        count = 0
        pending = [root]
        while pending:
            vertex = pending.pop()
            count += 1
            pending.extend(children[vertex])
        sizes.append(count)
    return sizes`,
    ),
  ],
  'cp-dfs': [
    time(
      'keep discovered vertices in a list',
      `def reachable_count(graph, start):
    if not graph:
        return 0
    seen = [start]
    stack = [start]
    while stack:
        vertex = stack.pop()
        for neighbor in graph[vertex]:
            if neighbor not in seen:
                seen.append(neighbor)
                stack.append(neighbor)
    return len(seen)`,
    ),
  ],
  'cp-bfs': [
    time(
      'relax every edge in rounds until nothing changes',
      `def hop_distances(graph, source):
    if not graph:
        return []
    distance = [-1] * len(graph)
    distance[source] = 0
    changed = True
    while changed:
        changed = False
        for vertex in range(len(graph)):
            if distance[vertex] == -1:
                continue
            for neighbor in graph[vertex]:
                if distance[neighbor] == -1 or distance[vertex] + 1 < distance[neighbor]:
                    distance[neighbor] = distance[vertex] + 1
                    changed = True
    return distance`,
    ),
  ],
  'cp-grids': [
    time(
      'flood-fill again from every land cell',
      `def island_summary(grid):
    rows = len(grid)
    cols = len(grid[0]) if grid else 0
    count = 0
    largest = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] != 1:
                continue
            seen = {(row, col)}
            pending = [(row, col)]
            while pending:
                r, c = pending.pop()
                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        pending.append((nr, nc))
            if min(seen) == (row, col):
                count += 1
            largest = max(largest, len(seen))
    return count, largest`,
    ),
  ],
  'cp-topological': [
    time(
      'rescan the edges for a ready vertex each time',
      `def dependency_order(n, edges):
    remaining = set(range(n))
    order = []
    while remaining:
        ready = [v for v in sorted(remaining) if not any(b == v and a in remaining for a, b in edges)]
        if not ready:
            return None
        order.append(ready[0])
        remaining.discard(ready[0])
    return order`,
    ),
  ],
  'cp-dijkstra': [
    time(
      'Bellman-Ford rounds with an early stop',
      `def shortest_costs(n, edges, source):
    if any(weight < 0 for _, _, weight in edges):
        raise ValueError("negative weight")
    distance = [None] * n
    distance[source] = 0
    for _ in range(n):
        changed = False
        for first, second, weight in edges:
            if distance[first] is not None and (distance[second] is None or distance[first] + weight < distance[second]):
                distance[second] = distance[first] + weight
                changed = True
        if not changed:
            break
    return distance`,
    ),
  ],
  'cp-dsu': [
    time(
      'relabel a whole component on each merge',
      `def component_counts(n, edges):
    label = list(range(n))
    components = n
    result = []
    for first, second in edges:
        old, new = label[second], label[first]
        if old != new:
            label = [new if value == old else value for value in label]
            components -= 1
        result.append(components)
    return result`,
    ),
    time(
      'link roots without union by size or path compression',
      `def component_counts(n, edges):
    parent = list(range(n))
    def find(vertex):
        while parent[vertex] != vertex:
            vertex = parent[vertex]
        return vertex
    components = n
    result = []
    for first, second in edges:
        a, b = find(first), find(second)
        if a != b:
            parent[a] = b
            components -= 1
        result.append(components)
    return result`,
    ),
  ],
  'cp-mst': [
    time(
      'Kruskal with relabeled components',
      `def minimum_link_cost(n, edges):
    if n <= 1:
        return 0
    label = list(range(n))
    total = 0
    chosen = 0
    for first, second, weight in sorted(edges, key=lambda edge: edge[2]):
        old, new = label[second], label[first]
        if old != new:
            label = [new if value == old else value for value in label]
            total += weight
            chosen += 1
    return total if chosen == n - 1 else None`,
    ),
  ],
  'cp-memoization': [
    time(
      'recurse without a cache',
      `def count_routes(distance):
    if distance == 0:
        return 1
    if distance < 0:
        return 0
    return count_routes(distance - 1) + count_routes(distance - 3)`,
    ),
  ],
  'cp-tabulation': [
    time(
      'recurse over totals without a table',
      `def min_packets(sizes, target):
    if target == 0:
        return 0
    best = -1
    for size in sizes:
        if size <= target:
            rest = min_packets(sizes, target - size)
            if rest != -1 and (best == -1 or rest + 1 < best):
                best = rest + 1
    return best`,
    ),
  ],
  'cp-knapsack': [
    time(
      'try all 2^n subsets',
      `def best_value(items, capacity):
    best = 0
    for mask in range(1 << len(items)):
        weight = value = 0
        for index, (item_weight, item_value) in enumerate(items):
            if mask >> index & 1:
                weight += item_weight
                value += item_value
        if weight <= capacity:
            best = max(best, value)
    return best`,
    ),
  ],
  'cp-subsequences': [
    time(
      'quadratic longest-increasing-subsequence table',
      `def increasing_length(values):
    lengths = []
    for i, value in enumerate(values):
        lengths.append(1 + max([lengths[j] for j in range(i) if values[j] < value], default=0))
    return max(lengths, default=0)`,
    ),
  ],
  'cp-intervals': [
    time(
      'merge overlapping pairs until none remain',
      `def merge_bookings(bookings):
    spans = list(bookings)
    merged = True
    while merged:
        merged = False
        for i in range(len(spans)):
            for j in range(i + 1, len(spans)):
                a, b = spans[i], spans[j]
                if a[0] <= b[1] and b[0] <= a[1]:
                    spans[i] = (min(a[0], b[0]), max(a[1], b[1]))
                    del spans[j]
                    merged = True
                    break
            if merged:
                break
    return sorted(spans)`,
    ),
  ],
  'cp-greedy': [
    time(
      'try every subset of sessions',
      `def max_sessions(sessions):
    best = 0
    for mask in range(1 << len(sessions)):
        chosen = sorted(sessions[i] for i in range(len(sessions)) if mask >> i & 1)
        if all(chosen[i][1] <= chosen[i + 1][0] for i in range(len(chosen) - 1)):
            best = max(best, len(chosen))
    return best`,
    ),
  ],
  'cp-bitmasks': [
    time(
      'scan every mask below 1 << n and skip non-submasks',
      `def selection_counts(values, changes, target):
    mask = 0
    counts = []
    for index, present in changes:
        mask = mask | (1 << index) if present else mask & ~(1 << index)
        count = 0
        for sub in range(1 << len(values)):
            if sub & ~mask:
                continue
            total = 0
            for position, value in enumerate(values):
                if sub >> position & 1:
                    total += value
            if total == target:
                count += 1
        counts.append(count)
    return counts`,
    ),
  ],
  'cp-gcd': [
    rule(
      'call math.gcd',
      `import math

def gcd_lcm(a, b):
    divisor = math.gcd(a, b)
    return divisor, (abs(a * b) // divisor if divisor else 0)`,
    ),
  ],
  'cp-modular': [
    rule(
      'call three-argument pow',
      `def mod_power(base, exponent, modulus):
    return pow(base, exponent, modulus)`,
    ),
  ],
  'cp-sieve': [
    time(
      'trial division up to the square root',
      `def primes_up_to(limit):
    return [p for p in range(2, limit + 1) if all(p % d for d in range(2, int(p ** 0.5) + 1))]`,
    ),
    time(
      'trial division by earlier primes',
      `def primes_up_to(limit):
    primes = []
    for candidate in range(2, limit + 1):
        for prime in primes:
            if prime * prime > candidate:
                primes.append(candidate)
                break
            if candidate % prime == 0:
                break
        else:
            primes.append(candidate)
    return primes`,
    ),
  ],
  'cp-combinatorics': [
    time(
      'recurse on both smaller counts without a table',
      `def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1 % modulus
    return (choose_mod(n - 1, k - 1, modulus) + choose_mod(n - 1, k, modulus)) % modulus`,
    ),
    rule(
      'import math.comb',
      `from math import comb

def choose_mod(n, k, modulus):
    return comb(n, k) % modulus if 0 <= k <= n else 0`,
    ),
  ],
  'cp-fenwick': [
    time(
      'update a list and sum each slice',
      `def range_sums(values, operations):
    current = list(values)
    answers = []
    for kind, first, second in operations:
        if kind == "add":
            current[first] += second
        else:
            answers.append(sum(current[first:second]))
    return answers`,
    ),
  ],
  'cp-segment-tree': [
    time(
      'assign into a list and take min of each slice',
      `def range_minima(values, operations):
    current = list(values)
    answers = []
    for kind, first, second in operations:
        if kind == "set":
            current[first] = second
        else:
            answers.append(min(current[first:second]) if second > first else None)
    return answers`,
    ),
  ],
  'cp-segment-query-boundaries': [
    time(
      'take min of the leaf slice',
      `def query_minimum(tree, size, left, right):
    if left == right:
        return None
    return min(tree[size + left:size + right])`,
    ),
  ],
  'cp-binary-lifting': [
    time(
      'step one parent at a time',
      `def kth_ancestors(parents, queries):
    answers = []
    for vertex, steps in queries:
        while steps and vertex != -1:
            vertex = parents[vertex]
            steps -= 1
        answers.append(vertex)
    return answers`,
    ),
  ],
  'cp-lifting-query-bits': [
    time(
      'walk the first table row one step at a time',
      `def jump_ancestor(table, vertex, steps):
    while steps and vertex != -1:
        vertex = table[0][vertex]
        steps -= 1
    return vertex`,
    ),
  ],
  'cp-scc': [
    time(
      'search from every vertex and compare reachability',
      `def scc_groups(n, edges):
    graph = [[] for _ in range(n)]
    for source, target in edges:
        graph[source].append(target)
    reach = []
    for start in range(n):
        seen = {start}
        stack = [start]
        while stack:
            vertex = stack.pop()
            for neighbor in graph[vertex]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)
        reach.append(seen)
    groups = []
    placed = set()
    for vertex in range(n):
        if vertex not in placed:
            group = sorted(other for other in reach[vertex] if vertex in reach[other])
            placed.update(group)
            groups.append(group)
    return sorted(groups)`,
    ),
  ],
};
