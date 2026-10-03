import type {
  CodeQuestion,
  CurriculumCatalog,
  Skill,
  Unit,
} from '../curriculum';
import { rustDefinitions, rustTopics } from './rust/content';
import { rustPrerequisites } from './rust/prerequisites';
import { exerciseId } from './exercise';
import { withTeachingOrder } from './teaching-order';

const courseId = 'rust';
const unitDescriptions: Record<string, [string, string]> = {
  start: [
    'First Rust programs',
    'Values, control flow, and function contracts from zero.',
  ],
  ownership: [
    'Ownership and borrowing',
    'Moves, scoped borrows, slices, and UTF-8 storage.',
  ],
  models: [
    'Model values and failures',
    'Records, alternatives, optional values, and recoverable errors.',
  ],
  collections: [
    'Collections',
    'Contiguous vectors, hash collections, and ordered maps.',
  ],
  abstraction: [
    'Reusable abstractions',
    'Generics, traits, lifetimes, closures, and iterator pipelines.',
  ],
  tooling: [
    'Modules, Cargo, and testing',
    'Public APIs, build concepts, and meaningful assertions.',
  ],
  memory: [
    'Memory ownership tools',
    'Box, shared pointers, weak references, and interior mutability.',
  ],
  concurrency: [
    'Concurrency and async',
    'Real bounded threads, synchronization, atomics, and future mechanics.',
  ],
  systems: [
    'Systems and interoperability',
    'Unsafe invariants, C boundaries, binary layouts, and bounded storage.',
  ],
  applications: [
    'Algorithm and parser projects',
    'Search, graph traversal, heaps, and a complete framed-message codec.',
  ],
};

const units: Unit[] = Object.entries(unitDescriptions).map(
  ([id, [title, description]]) => ({
    id: `rust-${id}`,
    title,
    description,
    courseId,
  }),
);

const topicMembers = (slug: string) =>
  rustDefinitions.filter((definition) => definition.topic === slug);

/** Related skills form each visible topic, named by its final step; graph edges remain the unlock authority. */
export const rustTopicStages = Object.fromEntries(
  rustTopics.map((topic) => {
    const ids = topicMembers(topic.slug).map(
      (definition) => `rust-${definition.slug}`,
    );
    return [ids[ids.length - 1], ids];
  }),
) as Record<string, string[]>;

const authored: Skill[] = rustDefinitions.map((definition, index) => {
  const id = `rust-${definition.slug}`;
  const topic = rustTopics.find((item) => item.slug === definition.topic)!;
  const topicDefinitions = topicMembers(topic.slug);
  const topicId = `rust-${topicDefinitions[topicDefinitions.length - 1].slug}`;
  const solution = definition.solution;
  const exampleCode = definition.exampleCode;
  // Early examples print with {} until the Debug placeholder has been taught.
  const debugPrinted = exampleCode.includes('{:?}');
  const exampleNote =
    definition.printNote ??
    (debugPrinted
      ? "The complete program prints the returned value using Rust's Debug format, so strings retain quotes and compound values show their structure."
      : 'The complete program prints the returned value with the {} placeholder.');
  const tests = definition.testCode;
  // Choice practice lives in knowledge points; this is the code exercise.
  const exercise: CodeQuestion = {
    id: exerciseId(id),
    type: 'code',
    language: 'rust',
    prompt: `Implement ${definition.signature}. ${definition.rule} ${definition.decision} Match the required behavior shown below.`,
    starterCode: `${definition.signature} {\n    todo!("Implement this focused step")\n}`,
    solution,
    contract: tests,
    tests,
    explanation: `${definition.rule} ${definition.decision} The reference implementation follows this contract without external crates.`,
  };
  return {
    id,
    courseId,
    domain: 'programming',
    unitId: `rust-${topic.unit}`,
    title: definition.title,
    summary: definition.rule,
    prerequisites: rustPrerequisites[id],
    order: index + 1,
    estimatedMinutes: 5,
    topicId,
    topicTitle: topic.title,
    stage: topicDefinitions.indexOf(definition) + 1,
    stageCount: topicDefinitions.length,
    assessment: { requiredTypes: ['choice', 'code'], reviewAnswers: 2 },
    lesson: {
      paragraphs: [
        `${definition.rule} This step isolates that rule before combining it with later Rust features.`,
        `${definition.decision} The executable example shows one case; the assessment also checks the edge cases stated in its assertions.`,
      ],
      example: {
        language: 'rust',
        code: exampleCode,
        output: definition.output,
        explanation: `${definition.rule} ${exampleNote}`,
      },
    },
    questions: [exercise],
    flashcards: [
      {
        id: `${id}-card1`,
        skillId: id,
        front: `Rust — ${definition.title}: what is the central rule?`,
        back: definition.rule,
      },
      {
        id: `${id}-card2`,
        skillId: id,
        front: `Rust — ${definition.title}: what implementation decision prevents the common error?`,
        back: definition.decision,
      },
    ],
  };
});
const skills = withTeachingOrder(authored);

export const rustCatalog: CurriculumCatalog = {
  courses: [
    {
      id: courseId,
      title: 'Rust: from zero to systems',
      description: `${rustDefinitions.length} focused skills across ownership, lifetimes, traits, testing, concurrency, async mechanics, unsafe invariants, and a bounded binary codec.`,
      domain: 'programming',
      language: 'rust',
      skillIds: skills.map((skill) => skill.id),
      resources: [
        {
          label: 'The Rust Programming Language',
          url: 'https://doc.rust-lang.org/book/',
        },
        {
          label: 'Rust Reference',
          url: 'https://doc.rust-lang.org/reference/',
        },
        { label: 'Cargo Book', url: 'https://doc.rust-lang.org/cargo/' },
        {
          label: 'Rust standard library',
          url: 'https://doc.rust-lang.org/std/',
        },
        {
          label: 'Rustonomicon safety invariants',
          url: 'https://doc.rust-lang.org/nomicon/',
        },
      ],
    },
  ],
  units,
  skills,
};
