import type { CurriculumCatalog, Unit } from '../curriculum';
import { competitiveFoundations } from './competitive/foundations';
import { competitiveStructures } from './competitive/structures';
import { competitiveAdvanced } from './competitive/advanced';
import {
  competitiveMicroFoundations,
  competitiveFoundationStages,
} from './competitive/micro-foundations';
import {
  competitiveMicroStructures,
  competitiveStructureStages,
} from './competitive/micro-structures';
import {
  competitiveMicroAdvanced,
  competitiveAdvancedStages,
} from './competitive/micro-advanced';
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
export const competitiveTopicStages = {
  ...competitiveFoundationStages,
  ...competitiveStructureStages,
  ...competitiveAdvancedStages,
};
const atoms = new Map(
  [
    ...competitiveMicroFoundations,
    ...competitiveMicroStructures,
    ...competitiveMicroAdvanced,
  ].map((item) => [item.id, item]),
);
const skills = [
  ...competitiveFoundations,
  ...competitiveStructures,
  ...competitiveAdvanced,
]
  .flatMap((item) => {
    const stages = competitiveTopicStages[item.id];
    if (!stages || stages.length !== 3)
      throw new Error(`Missing atomic sequence for ${item.id}`);
    const metadata = { topicId: item.id, stageCount: 4 };
    return [
      ...stages.map((id, index) => {
        const atom = atoms.get(id);
        if (!atom) throw new Error(`Missing atomic skill ${id}`);
        return { ...atom, ...metadata, stage: index + 1, estimatedMinutes: 5 };
      }),
      {
        ...item,
        ...metadata,
        stage: 4,
        prerequisites: [...new Set([...item.prerequisites, stages[2]])],
      },
    ];
  })
  .map((item, order) => ({ ...item, order }));

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
