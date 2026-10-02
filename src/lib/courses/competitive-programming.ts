import type { CurriculumCatalog, Unit } from '../curriculum';
import { competitiveFoundations } from './competitive/foundations';
import { competitiveStructures } from './competitive/structures';
import { competitiveAdvanced } from './competitive/advanced';
import { courseId } from './competitive/shared';

const definitions = [
  [
    'cp-foundations',
    'Think like a contestant',
    'Read constraints, parse input, simulate, and enumerate cases.',
  ],
  [
    'cp-collections',
    'Organize the data',
    'Choose sorting, hashing, linked structures, and string representations.',
  ],
  [
    'cp-linear',
    'Reuse work across an array',
    'Maintain prefix information and moving-window invariants.',
  ],
  [
    'cp-search',
    'Search and order events',
    'Use monotone decisions, coordinate ranks, and sweep events.',
  ],
  [
    'cp-structures',
    'Keep the right next item',
    'Use stacks, heaps, and prefix trees for focused queries.',
  ],
  [
    'cp-trees',
    'Explore recursive structure',
    'Define smaller subproblems, backtrack, and traverse trees.',
  ],
  [
    'cp-graphs',
    'Model and traverse connections',
    'Represent edges and explore reachability and grid components.',
  ],
  [
    'cp-paths',
    'Solve routes and connectivity',
    'Order dependencies, find weighted routes, and connect components.',
  ],
  [
    'cp-dynamic',
    'Remember subproblems',
    'Build memoized and tabulated solutions with precise states.',
  ],
  [
    'cp-strategy',
    'Choose and justify a strategy',
    'Reason about intervals, greedy choices, bitmasks, and geometry.',
  ],
  [
    'cp-number-theory',
    'Count with integer structure',
    'Use divisibility, modular arithmetic, primes, and combinations.',
  ],
  [
    'cp-range',
    'Answer changing queries',
    'Maintain range aggregates, jump through trees, and condense cycles.',
  ],
] as const;
const units: Unit[] = definitions.map(([id, title, description]) => ({
  id,
  courseId,
  title,
  description,
}));
const skills = [
  ...competitiveFoundations,
  ...competitiveStructures,
  ...competitiveAdvanced,
].map((item, order) => ({ ...item, order }));

export const competitiveProgrammingCatalog: CurriculumCatalog = {
  courses: [
    {
      id: courseId,
      title: 'Competitive Programming',
      description:
        'Solve original contest-style problems in Python. Build algorithms from USACO and NeetCode topic paths, with tested code and connected prerequisites.',
      domain: 'programming',
      language: 'python',
      skillIds: skills.map((item) => item.id),
      resources: [
        { label: 'USACO Guide', url: 'https://usaco.guide/' },
        { label: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap' },
      ],
    },
  ],
  units,
  skills,
};
