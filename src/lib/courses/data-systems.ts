import type { ChoiceQuestion, CurriculumCatalog, Skill } from '../curriculum';

const courseId = 'data-systems-foundations';
const q = (
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  hint: string,
): Omit<ChoiceQuestion, 'id'> => ({
  type: 'choice',
  prompt,
  choices,
  answer,
  explanation,
  hint,
});

function node(
  id: string,
  unitId: string,
  title: string,
  summary: string,
  prerequisites: string[],
  paragraphs: string[],
  scenario: string,
  decision: string,
  explanation: string,
  questions: Omit<ChoiceQuestion, 'id'>[],
  cards: [string, string][],
): Omit<Skill, 'order'> {
  return {
    id,
    unitId,
    courseId,
    domain: 'programming',
    title,
    summary,
    prerequisites,
    estimatedMinutes: 8,
    assessment: { requiredTypes: ['choice'], reviewAnswers: 2 },
    lesson: {
      paragraphs,
      example: {
        kind: 'text',
        label: 'Design scenario',
        code: scenario,
        output: decision,
        explanation,
      },
    },
    questions: questions.map((question, index) => ({
      ...question,
      id: `${id}-q${index + 1}`,
    })),
    flashcards: cards.map(([front, back], index) => ({
      id: `${id}-card${index + 1}`,
      skillId: id,
      front,
      back,
    })),
  };
}

const nodes = [
  node(
    'ds-workloads',
    'ds-foundations',
    'Describe the workload',
    'Distinguish operational requests from analytical scans.',
    [],
    [
      'A data system serves a workload: the reads, writes, data volumes, and response expectations of its users. Operational work usually accesses a small number of records to perform a specific action. Analytical work often scans many records to discover aggregate patterns.',
      'Describe concrete operations before choosing a database. Record which keys are queried, how much data each request examines, how often writes occur, and what freshness is needed. A product can contain both operational and analytical workloads.',
    ],
    'A workshop site accepts one registration at a time. A weekly report compares attendance across every workshop.',
    'Treat registration as operational work and the weekly comparison as analytical work.',
    'The distinction comes from the access pattern, not the name of the product.',
    [
      q(
        'Which request is most clearly analytical?',
        [
          'Fetch one reservation by ID',
          'Change one attendee name',
          'Count attendance by city across a year',
          'Confirm one seat',
        ],
        2,
        'The yearly grouped count examines many records to summarize patterns.',
        'Look for an aggregate over a broad dataset.',
      ),
      q(
        'Before choosing a database for a new service, what information is most useful?',
        [
          'The logo color',
          'Representative reads, writes, volumes, and latency needs',
          'The largest vendor name',
          'The programming font',
        ],
        1,
        'The workload reveals the trade-offs a storage system must support.',
        'Describe what the service actually does.',
      ),
      q(
        'A service has small point lookups and a daily full-history report. What follows?',
        [
          'It can contain both operational and analytical workloads',
          'Every request is analytical',
          'Every request needs a distributed database',
          'The report must use the same physical layout',
        ],
        0,
        'Different features of one service can have different access patterns.',
        'A product is not limited to one workload category.',
      ),
      q(
        'Which workload description is most actionable?',
        [
          'The system must be fast',
          'The system should scale forever',
          'Use whatever is newest',
          'Read one record by ID at 500 requests per second, with 95% answered within 150 ms',
        ],
        3,
        'A specific operation, load, and response target can be measured and tested.',
        'Prefer quantities and concrete operations.',
      ),
    ],
    [
      [
        'How do operational and analytical workloads usually differ?',
        'Operational requests act on a small set of records; analytical requests scan and aggregate broader datasets.',
      ],
      [
        'What should a workload description include?',
        'Representative operations, data volume, read/write frequency, response targets, and freshness needs.',
      ],
    ],
  ),

  node(
    'ds-requirements',
    'ds-foundations',
    'Measure service behavior',
    'Use throughput, response percentiles, and failure targets.',
    ['ds-workloads'],
    [
      'Throughput measures completed work per unit of time. Response time measures how long a request takes from the caller’s perspective. A service can complete many requests per second while a minority of users experience very slow responses.',
      'A percentile describes a boundary in the response-time distribution: the p95 is the time within which 95% of requests finish, so only the slowest 5% take longer. Unlike an average, it exposes the slow tail. Also specify the load under which the target should hold; an unloaded benchmark does not establish behavior at peak demand.',
      'Reliability targets separate faults from failures. A fault is one component misbehaving, such as a broken disk or a crashed process; a failure is the service as a whole not delivering what it promised. Fault-tolerant designs keep faults from becoming failures.',
    ],
    'Two services both average 80 ms. One has p99 of 130 ms; the other has p99 of 2 seconds.',
    'Inspect the tail distribution instead of declaring the services equivalent.',
    'The average hides the experience of unusually slow requests.',
    [
      q(
        'Which is a throughput measurement?',
        [
          '200 completed requests per second',
          'A request took 120 ms',
          'p99 is 900 ms',
          'A file is 40 MB',
        ],
        0,
        'Throughput counts completed work over time.',
        'Look for work divided by a time unit.',
      ),
      q(
        'Why can an average response time hide an important problem?',
        [
          'It measures only disk space',
          'It guarantees all requests are equally fast',
          'A small set of very slow requests can be obscured',
          'It cannot be calculated',
        ],
        2,
        'A distribution can contain a long slow tail while retaining a modest mean.',
        'Consider the users with the slowest responses.',
      ),
      q(
        'A service is quick at 10 requests per second. What must be checked before claiming it meets a 1,000-request-per-second target?',
        [
          'Whether its name is short',
          'Its response and failure behavior at the required load',
          'Whether it has a graph logo',
          'Only its idle CPU temperature',
        ],
        1,
        'Queueing and resource contention can change behavior as load rises.',
        'Test the stated workload, not only an idle system.',
      ),
      q(
        'One storage device breaks, but redundant storage keeps the promised service available. How should this be classified?',
        [
          'No component fault occurred',
          'The whole service necessarily failed',
          'A schema migration occurred',
          'A component fault was tolerated without the required service failing',
        ],
        3,
        'A component fault does not necessarily become a system-level service failure.',
        'Distinguish a broken component from the user-visible result.',
      ),
    ],
    [
      [
        'What is the difference between throughput and response time?',
        'Throughput is work completed per time unit; response time is the elapsed time for an individual request.',
      ],
      [
        'Why measure response-time percentiles?',
        'They reveal distribution boundaries and slow-tail behavior that an average may hide.',
      ],
    ],
  ),

  node(
    'ds-authority',
    'ds-foundations',
    'Separate facts from derived views',
    'Identify authoritative data and rebuildable representations.',
    ['ds-workloads'],
    [
      'A system of record holds the authoritative version of a fact. A derived representation transforms those facts for another purpose: a cache, search index, report, or precomputed view. Naming the authority makes disagreements easier to resolve.',
      'Derived data can be rebuilt only when the source and the transformation remain available. Plan how changes reach each view, how stale a view may be, and how a failed update is repaired. Redundancy improves access patterns but creates synchronization work.',
    ],
    'The registration database records confirmed seats. A dashboard stores a precomputed attendance total.',
    'Treat confirmations as authoritative and reconstruct the dashboard total from them.',
    'The total is useful for fast reads, but it is not an independent source of truth.',
    [
      q(
        'Which is usually derived data?',
        [
          'The sole original contract record',
          'An authoritative event log',
          'The original submitted measurement',
          'A search index built from stored articles',
        ],
        3,
        'The search index transforms existing article data for retrieval.',
        'Ask which representation can be reconstructed from another.',
      ),
      q(
        'A cache disagrees with its designated system of record. Which value is authoritative?',
        [
          'Whichever has more characters',
          'The system-of-record value',
          'The cache because it is faster',
          'Neither can ever be trusted',
        ],
        1,
        'Authority is a design decision; speed does not make a cache canonical.',
        'Use the documented source of truth.',
      ),
      q(
        'What is necessary to rebuild a lost derived view?',
        [
          'The original source and the transformation needed to produce it',
          'Only the view’s old filename',
          'A larger font',
          'A random sample unrelated to the source',
        ],
        0,
        'Reconstruction requires sufficient source facts and the derivation logic.',
        'A label alone cannot recreate the contents.',
      ),
      q(
        'What trade-off follows from storing a precomputed summary?',
        [
          'Updates always become free',
          'Every read becomes perfectly current automatically',
          'Reads may become cheaper, while updates and repair become more complex',
          'The original data must be deleted',
        ],
        2,
        'Maintaining a redundant representation shifts work toward synchronization.',
        'Consider both reading the view and keeping it current.',
      ),
    ],
    [
      [
        'What is a system of record?',
        'The designated authoritative representation of a set of facts.',
      ],
      [
        'What must be retained to rebuild derived data?',
        'Sufficient authoritative source data and the transformation or processing logic.',
      ],
    ],
  ),

  node(
    'ds-deployment',
    'ds-foundations',
    'Choose an operating model',
    'Compare single-node, distributed, managed, and self-hosted designs.',
    ['ds-requirements'],
    [
      'A distributed system uses communicating processes on different nodes. It can add capacity, geographic proximity, or fault tolerance, but also introduces partial failures and uncertain network delays. Distribution is a response to requirements, not proof that a design is better.',
      'Managed services transfer some operational responsibilities to a provider; they do not remove responsibility for data modeling, access control, budgets, or recovery expectations. A simple single-node system can be appropriate when its capacity and recovery plan meet the workload.',
      'A replica is a live copy of the data on another node, kept up to date as changes happen; it helps when a node is lost. Replicas also copy mistakes, such as an accidental deletion, so recovering from those needs backups: separate copies taken at earlier points in time.',
    ],
    'A community directory fits on one server. Its owners can tolerate a short recovery window and have tested backups.',
    'Start with the simplest design that meets the measured capacity and recovery requirements.',
    'Additional nodes would add coordination work without automatically solving a present limitation.',
    [
      q(
        'What new challenge appears when processes communicate over a network?',
        [
          'Variables stop having values',
          'Messages may be delayed or lost independently of local computation',
          'All operations become instantaneous',
          'Every component fails at exactly the same time',
        ],
        1,
        'Network communication introduces delay and partial failure.',
        'One participant may be healthy while another is unreachable.',
      ),
      q(
        'Which statement about managed databases is sound?',
        [
          'They eliminate all application responsibilities',
          'They guarantee a correct schema',
          'They transfer some operations while leaving application and recovery decisions to the owner',
          'They make every service free',
        ],
        2,
        'A provider can operate infrastructure while the application still owns its semantics.',
        'Separate infrastructure operation from application design.',
      ),
      q(
        'When is a single-node database a reasonable starting point?',
        [
          'When its measured capacity and recovery plan meet the service requirements',
          'Only when the data is worthless',
          'Never, regardless of workload',
          'Only if backups are forbidden',
        ],
        0,
        'Requirements, not fashion, determine whether the simpler design suffices.',
        'Check capacity and tolerated downtime.',
      ),
      q(
        'Two replicas contain the same accidentally deleted records. Why are replicas not a complete backup strategy?',
        [
          'Copies cannot store data',
          'Replication always stops deletions',
          'Backups and replicas are identical',
          'Replication can propagate the unwanted deletion to every live copy',
        ],
        3,
        'A backup strategy must support recovery from logical mistakes, not just node loss.',
        'A replicated mistake is still a mistake.',
      ),
    ],
    [
      [
        'What does distribution add besides capacity or redundancy?',
        'Network delays, partial failures, coordination, and additional operational complexity.',
      ],
      [
        'Why do replicas not replace backups?',
        'Replicas can copy accidental deletion or corruption, while backups provide separate recovery points.',
      ],
    ],
  ),

  node(
    'ds-relational',
    'ds-models',
    'Model entities and relationships',
    'Use rows, keys, and joins to represent connected facts.',
    ['ds-workloads'],
    [
      'A relational model organizes facts into tables of rows with named columns. A primary key identifies a row; a foreign key refers to a row in another table. A join combines related rows using a matching condition.',
      'Start with entities and their relationships. A many-to-many relationship often needs a linking table, such as one row for each attendee-workshop registration. Keys separate identity from names that can change or be shared.',
    ],
    'Attendees and workshops each have stable IDs. Registration rows contain attendee_id and workshop_id.',
    'Join through registrations to answer which workshops an attendee booked.',
    'The linking rows represent a many-to-many relationship without duplicating each whole entity.',
    [
      q(
        'What is the purpose of a primary key?',
        [
          'To force alphabetical sorting',
          'To identify a row within a table',
          'To encrypt every column',
          'To replace all constraints',
        ],
        1,
        'A primary key gives each row a stable identity.',
        'Think about referring to one specific row.',
      ),
      q(
        'How can a relational schema represent attendees booking many workshops, with many attendees per workshop?',
        [
          'Store every name in one comma-separated field',
          'Forbid all repeated attendees',
          'Use only one row for the entire service',
          'Use a registration table referring to attendee and workshop IDs',
        ],
        3,
        'The linking table represents one association per row.',
        'The relationship itself needs a representation.',
      ),
      q(
        'What does a join do?',
        [
          'Combines rows according to a matching relationship',
          'Deletes every duplicate name automatically',
          'Makes all writes atomic globally',
          'Guarantees a table is always small',
        ],
        0,
        'A join connects records using a specified condition, commonly matching keys.',
        'It connects related rows; it is not a durability mechanism.',
      ),
      q(
        'Why prefer an ID to a person’s displayed name as an identity key?',
        [
          'IDs make every query instantaneous',
          'Names cannot contain spaces',
          'Names may change or be shared by different people',
          'Names are always numeric',
        ],
        2,
        'A stable identifier distinguishes identity from presentation.',
        'Two people can have the same name.',
      ),
    ],
    [
      [
        'What does a foreign key represent?',
        'A reference from one row to an identified row in another table.',
      ],
      [
        'How is a many-to-many relationship commonly modeled?',
        'With a linking table containing references to both participating entities.',
      ],
    ],
  ),

  node(
    'ds-documents',
    'ds-models',
    'Recognize document-shaped data',
    'Match nested records to their access and update patterns.',
    ['ds-relational'],
    [
      'A document stores a record with nested fields and collections. It can keep a tree of related data together when the application usually reads that tree as a unit. Documents are a modeling choice, not a promise that data has no structure.',
      'Embedding duplicates a shared fact when several documents contain it. References are often useful when nested items have independent identities or when many records share the same entity. Relational systems may support document fields too; evaluate the required queries rather than a rigid product category.',
    ],
    'A workshop draft contains its own outline, sections, and checklist. Many workshops also refer to one organizer.',
    'Embed the draft’s private outline, but consider a shared organizer record for organizer details.',
    'Private nested data and widely shared data have different update relationships.',
    [
      q(
        'Which access pattern particularly suits an embedded document?',
        [
          'One private tree of fields usually loaded together',
          'An arbitrary number of unrelated joins across all records',
          'A field that must disappear after each read',
          'A global ordering guarantee for all writes',
        ],
        0,
        'Document locality can help when the nested record is read as one unit.',
        'Look for data that naturally travels together.',
      ),
      q(
        'Ten documents copy the same organizer address. What happens when the address changes?',
        [
          'Only the oldest copy can ever change',
          'No update is required',
          'The copies need coordinated updates or may disagree',
          'All copies update automatically by definition',
        ],
        2,
        'Duplication creates a consistency obligation across representations.',
        'Each stored copy is a separate update target.',
      ),
      q(
        'What is a sensible interpretation of flexible document structure?',
        [
          'No reader makes assumptions about fields',
          'Documents may evolve, but readers still need to handle their shapes',
          'Validation is impossible',
          'All documents contain identical fields forever',
        ],
        1,
        'Flexibility moves some schema responsibilities toward application readers and validation.',
        'A reader still needs to interpret the data.',
      ),
      q(
        'A nested item must be referenced independently by several records. What deserves consideration?',
        [
          'Deleting its identity',
          'Increasing indentation',
          'Using only its position in a changing array forever',
          'Giving it a stable ID and modeling references',
        ],
        3,
        'Independent identity helps other records refer to the same item reliably.',
        'Array positions can change when items are reordered.',
      ),
    ],
    [
      [
        'When can document embedding be useful?',
        'When a private tree of related data is normally accessed as one unit.',
      ],
      [
        'What is a cost of embedding a shared fact into many documents?',
        'Multiple copies must be kept consistent when the fact changes.',
      ],
    ],
  ),

  node(
    'ds-normalization',
    'ds-models',
    'Control duplicated facts',
    'Compare normalization with deliberate denormalization.',
    ['ds-relational', 'ds-authority'],
    [
      'Normalization places an independently changing fact in an authoritative location and refers to it with keys. This reduces update anomalies: one change need not be repeated across many copied representations.',
      'Denormalization deliberately stores redundant representations to improve a specific read pattern. It can be worthwhile, but requires an explicit update or rebuilding strategy. The right question is which consistency work the workload can afford, not whether duplication is always good or bad.',
    ],
    'Every workshop card displays an organizer name. The organizer can rename their organization.',
    'Keep the authoritative name once; either join it at read time or maintain a clearly derived display copy.',
    'A faster copied display field needs an update path when its source changes.',
    [
      q(
        'Which problem does normalization primarily reduce?',
        [
          'All network failures',
          'Any need for indexes',
          'Every read cost',
          'Inconsistent updates to duplicated facts',
        ],
        3,
        'Keeping a fact in one authoritative place reduces conflicting copies.',
        'Think about updating one fact stored in many places.',
      ),
      q(
        'Why might a team intentionally denormalize?',
        [
          'To optimize a known read pattern while accepting maintenance work',
          'Because duplicated values cannot disagree',
          'To remove every authoritative source',
          'Because joins are mathematically impossible',
        ],
        0,
        'Redundancy can speed a targeted read at the cost of keeping copies current.',
        'A deliberate trade-off has both a benefit and a cost.',
      ),
      q(
        'Two rows contain different addresses for the same organizer after an incomplete update. What is this?',
        [
          'A successful join',
          'An update anomaly caused by duplicated facts',
          'A beneficial compression ratio',
          'A primary-key lookup',
        ],
        1,
        'The stored copies disagree because only some were updated.',
        'The error concerns conflicting representations of one fact.',
      ),
      q(
        'Before adding a duplicated summary field, what should be designed?',
        [
          'Only its text color',
          'A longer table name',
          'Its update, freshness, and repair strategy',
          'A rule forbidding all future changes',
        ],
        2,
        'Derived copies require a plan for synchronization and recovery.',
        'Specify how the summary follows its source.',
      ),
    ],
    [
      [
        'What does normalization help avoid?',
        'Update anomalies caused by storing independently changing facts in multiple places.',
      ],
      [
        'What must accompany deliberate denormalization?',
        'A plan for updating, freshness, reconciliation, or rebuilding the redundant representation.',
      ],
    ],
  ),

  node(
    'ds-graphs',
    'ds-models',
    'Model connected paths',
    'Represent entities as nodes and relationships as edges.',
    ['ds-relational'],
    [
      'A graph model represents entities as nodes and relationships as edges. Edges may have direction, a type, and properties. This structure is useful when questions involve following several relationships rather than reading one isolated record.',
      'A traversal follows edges to reach connected nodes. Specify which edge types and directions matter, and whether repeated visits are allowed. Graphs can be represented in relational tables or dedicated graph systems; the data model and the database product are separate choices.',
    ],
    'A learning graph has an edge from Skill A to Skill B when A is a prerequisite of B.',
    'Follow prerequisite edges backward to find foundations that need attention.',
    'Direction expresses the meaning of the relationship; reversing it changes the question.',
    [
      q(
        'In a graph model, what usually represents an entity?',
        ['An edge label only', 'A disk sector', 'A node', 'A column header'],
        2,
        'Nodes represent entities, while edges represent relationships between them.',
        'Separate things from connections.',
      ),
      q(
        'If A → B means A is a prerequisite of B, what does following incoming edges from B find?',
        [
          'B’s prerequisites',
          'Only B’s output text',
          'Every independent course',
          'The most recent timestamp',
        ],
        0,
        'Incoming prerequisite edges identify the foundations B depends on.',
        'Use the stated edge direction.',
      ),
      q(
        'Which query is naturally a graph traversal?',
        [
          'Fetch the length of one string',
          'Overwrite one unrelated integer',
          'Count all bytes on disk',
          'Find skills reachable through several prerequisite relationships',
        ],
        3,
        'Reachability across repeated relationships is a path question.',
        'Look for multiple steps through connections.',
      ),
      q(
        'Must graph-shaped data use a dedicated graph database?',
        [
          'Yes, relational tables cannot hold edges',
          'No, nodes and edges can also be modeled in tables',
          'Yes, every node needs a different server',
          'No, because graphs never need storage',
        ],
        1,
        'The model can be represented in different storage systems.',
        'Distinguish the model from its implementation.',
      ),
    ],
    [
      [
        'What is the difference between graph nodes and edges?',
        'Nodes represent entities; edges represent relationships between entities.',
      ],
      [
        'What must a traversal specify?',
        'Which relationship types and directions to follow, and how to handle repeated visits or cycles.',
      ],
    ],
  ),

  node(
    'ds-key-values',
    'ds-storage',
    'Store records by key',
    'Extend map concepts into persistent storage and indexing.',
    ['ds-authority', 'dictionaries'],
    [
      'A key-value store associates a key with a stored value. Like a Python dictionary, a point lookup asks for the value of one key. Persistence adds new requirements: recovering after a process stops and finding records without scanning every stored byte.',
      'An index is an auxiliary structure that speeds selected access patterns. It consumes space and must be updated when data changes. Describe point lookups, range queries, and writes separately because one index design may favor one operation over another.',
    ],
    'Record w-17 holds one workshop. Repeated requests ask for w-17 rather than all workshops.',
    'Maintain a key-based access path and a recovery strategy for the authoritative stored value.',
    'A fast in-memory lookup alone does not establish durable storage.',
    [
      q(
        'Which Python concept transfers directly to key-value storage?',
        [
          'String capitalization',
          'A mapping from keys to values',
          'Only floating-point division',
          'An infinite while loop',
        ],
        1,
        'A dictionary provides the same basic key-to-value association.',
        'Think about retrieving a value by a name-like key.',
      ),
      q(
        'Why is a plain in-memory map insufficient for durable storage?',
        [
          'It cannot look up keys',
          'It always stores duplicate keys',
          'Its contents can disappear when the process stops',
          'It cannot store strings',
        ],
        2,
        'Durability needs a persistent representation and a recovery path.',
        'Consider a restart with no surviving memory.',
      ),
      q(
        'What is a typical index trade-off?',
        [
          'Faster supported reads in exchange for space and write maintenance',
          'All reads and writes become free',
          'The source records must be deleted',
          'Keys no longer identify values',
        ],
        0,
        'Indexes store additional structure that writes must keep current.',
        'An access path has to be maintained.',
      ),
      q(
        'Which operation is a point lookup?',
        [
          'Scan every record for a year',
          'Compute an average across all rows',
          'Read all keys between two boundaries',
          'Fetch the record whose key is w-17',
        ],
        3,
        'A point lookup targets one specified key.',
        'It asks for one known identity.',
      ),
    ],
    [
      [
        'What is a key-value store?',
        'A persistent mapping that retrieves stored values using their keys.',
      ],
      [
        'Why does an index add write cost?',
        'Changes to authoritative data may also require changes to the auxiliary access structure.',
      ],
    ],
  ),

  node(
    'ds-lsm',
    'ds-storage',
    'Understand log-structured storage',
    'Follow buffered writes, sorted files, and compaction.',
    ['ds-key-values'],
    [
      'Log-structured designs often buffer writes in memory and persist sorted immutable files. An update may create a newer version instead of overwriting every old location immediately. A read must identify the newest relevant version across memory and stored runs.',
      'Compaction merges stored runs and discards obsolete versions when safe. This reduces fragmentation and read work but consumes I/O and creates write amplification: one logical change may cause multiple physical writes over time. Performance depends on the workload and configuration.',
    ],
    'A key has an old value in one sorted file and a newer value in a later run.',
    'Resolve the newest visible version, then let compaction reconcile obsolete storage.',
    'Several physical versions can represent one current logical value.',
    [
      q(
        'Why can a read need to inspect more than one sorted run?',
        [
          'A key may have newer and older versions in different runs',
          'Sorted files contain no keys',
          'Every run is guaranteed to have identical contents',
          'Memory cannot hold metadata',
        ],
        0,
        'Updates can create new versions while old runs remain immutable.',
        'A newer version can be stored separately from the old one.',
      ),
      q(
        'What does compaction commonly do?',
        [
          'Disables all writes forever',
          'Makes every operation synchronous',
          'Merges runs and removes obsolete versions where safe',
          'Converts every key into a random name',
        ],
        2,
        'Compaction reorganizes immutable runs and reconciles redundant versions.',
        'It is background maintenance of stored runs.',
      ),
      q(
        'What is write amplification?',
        [
          'The number of user names in a record',
          'Physical writing exceeds the size of logical writes',
          'Every write is returned twice to the caller',
          'A stronger password',
        ],
        1,
        'Flushing and compaction can rewrite data beyond the original update.',
        'Compare logical changes with physical storage work.',
      ),
      q(
        'Which conclusion about LSM-style storage is justified?',
        [
          'It is always faster for every operation',
          'It never needs crash recovery',
          'It has no background work',
          'Its trade-offs must be measured for the read/write workload',
        ],
        3,
        'No storage structure wins independently of access patterns and maintenance costs.',
        'Include compaction and reads in the evaluation.',
      ),
    ],
    [
      [
        'What does compaction do in log-structured storage?',
        'It merges stored runs and can discard obsolete versions while preserving needed data.',
      ],
      [
        'What is write amplification?',
        'The ratio or excess of physical data written compared with the logical updates requested.',
      ],
    ],
  ),

  node(
    'ds-btrees',
    'ds-storage',
    'Navigate a tree of pages',
    'Understand ordered indexes and page updates.',
    ['ds-key-values'],
    [
      'A B-tree organizes sorted keys into a balanced tree of storage pages. Internal pages guide a lookup toward the page containing a key. Keeping the tree shallow helps bound the number of page accesses as the dataset grows.',
      'Pages can be changed in place, and splits reorganize the tree when a page fills. Crash recovery must account for interrupted updates, commonly with a write-ahead log or another recovery mechanism. Ordered structure also supports range access.',
    ],
    'An index page directs keys below m-50 to one child and larger keys to another.',
    'Follow the appropriate child page for a point lookup; use key order for a range query.',
    'The structure narrows the search while preserving ordering.',
    [
      q(
        'What is stored in internal B-tree pages?',
        [
          'Only unordered copies of all user photos',
          'No routing information',
          'A separate server for every value',
          'Keys and child-page references that guide the search',
        ],
        3,
        'Internal pages direct a lookup toward the appropriate subtree.',
        'The tree needs a way to choose its next page.',
      ),
      q(
        'Why is keeping a B-tree shallow useful?',
        [
          'It reduces the number of page steps needed for a lookup',
          'It eliminates the need for all storage',
          'It turns every range into one value',
          'It guarantees no key will ever change',
        ],
        0,
        'A shallow balanced structure limits lookup depth.',
        'Think about how many pages a search visits.',
      ),
      q(
        'What can happen when a B-tree page becomes too full?',
        [
          'The whole dataset becomes a string',
          'The page can split and parent references can be updated',
          'Every primary key must disappear',
          'All readers become leaders',
        ],
        1,
        'A split preserves the structure while distributing entries across pages.',
        'The tree must make room without losing order.',
      ),
      q(
        'Why is a recovery mechanism needed for in-place page changes?',
        [
          'It proves every query is analytical',
          'It removes all network latency',
          'A crash can interrupt a multi-step page update',
          'It makes indexes cost no space',
        ],
        2,
        'Recovery protects the structure and committed data from partially completed storage work.',
        'Consider stopping between two page changes.',
      ),
    ],
    [
      [
        'What makes B-trees useful for ordered lookups?',
        'They maintain sorted keys in a balanced tree of pages.',
      ],
      [
        'Why can page updates require crash recovery?',
        'A crash can interrupt structural changes or data writes before all needed storage steps finish.',
      ],
    ],
  ),

  node(
    'ds-indexes',
    'ds-storage',
    'Design an access path',
    'Choose secondary and composite indexes for actual queries.',
    ['ds-btrees', 'ds-relational'],
    [
      'A secondary index provides access through a field other than the primary key. A composite index orders several fields together. The order of those fields matters because it determines which groups and ranges are contiguous.',
      'Design indexes from representative queries and verify their effect with the query plan, the engine’s report of which access path a query uses, and with measurements. Every additional index adds storage and write maintenance. An index that covers the needed fields may avoid a separate record lookup, but larger entries can increase index size.',
    ],
    'Requests find workshops for one city and then restrict their start date.',
    'Consider an ordered index on (city, start_date) and test the target query.',
    'Grouping by the first field creates a contiguous range for one city’s dates.',
    [
      q(
        'What does a secondary index provide?',
        [
          'Access through a field other than the primary key',
          'A second source of truth by definition',
          'A guarantee that all writes are free',
          'Only a list of backups',
        ],
        0,
        'It supports a different lookup path into the same records.',
        'A query may search by something other than identity.',
      ),
      q(
        'Why does field order matter in an ordered composite index?',
        [
          'Only the field names change color',
          'It makes all combinations equally contiguous',
          'It determines grouping and usable ordered ranges',
          'It changes the meaning of arithmetic',
        ],
        2,
        'The leading fields determine how subsequent values are grouped in the order.',
        'Compare sorting by city first with sorting by date first.',
      ),
      q(
        'What cost usually grows when several additional indexes are created?',
        [
          'Only the number of lessons',
          'Storage and write-maintenance work',
          'The number of user passwords',
          'The number of replica leaders by definition',
        ],
        1,
        'Writes must maintain each affected access structure.',
        'Additional copies of access information need updates.',
      ),
      q(
        'What should confirm that a proposed index is useful?',
        [
          'Its vendor’s slogan',
          'Its shortest possible name',
          'The fact that an index exists',
          'A query plan and measurement under the relevant workload',
        ],
        3,
        'An access structure should be validated against the actual query behavior.',
        'Measure the proposed improvement.',
      ),
    ],
    [
      [
        'Why does the order of fields in a composite index matter?',
        'It determines which prefixes, groups, and ranges follow the stored ordering.',
      ],
      [
        'What is a covering index?',
        'An index containing the fields needed by a query, potentially avoiding a separate record lookup.',
      ],
    ],
  ),

  node(
    'ds-columnar',
    'ds-evolution',
    'Store data for broad scans',
    'Explain why column layouts suit many analytical workloads.',
    ['ds-relational'],
    [
      'A row-oriented layout keeps fields of one row together. A column-oriented layout groups values of the same column. Analytical scans that need a few fields across many rows can avoid reading unrelated columns.',
      'Similar values in a column often compress well, and engines can process batches with efficient vectorized operations. The advantage is workload-dependent: fetching or modifying one whole record has different locality needs from summing one column over a large history.',
    ],
    'A report sums duration_minutes across millions of sessions and ignores their long description fields.',
    'Read the duration column without loading every description.',
    'Separating columns can reduce the amount of irrelevant data read for this scan.',
    [
      q(
        'Which query most directly benefits from reading only selected columns?',
        [
          'Fetch one complete profile by ID',
          'Sum one numeric field across millions of rows',
          'Replace one private document',
          'Verify one password',
        ],
        1,
        'A broad scan of a few fields avoids loading unrelated row contents.',
        'Look for many rows but few columns.',
      ),
      q(
        'Why can column storage compress effectively?',
        [
          'It deletes every repeated fact permanently',
          'It stores no values',
          'It makes all strings the same length',
          'Nearby values belong to the same field and may have similar structure',
        ],
        3,
        'Same-column values often share type and repeated patterns useful for compression.',
        'Compression can exploit repetition and similarity.',
      ),
      q(
        'What does vectorized query execution commonly process?',
        [
          'Only one network cable',
          'One whole database name at a time',
          'Batches of values through operations',
          'Only comments in the query',
        ],
        2,
        'Batch processing can reduce overhead and use modern CPUs efficiently.',
        'Think about applying one operation to many values together.',
      ),
      q(
        'Which claim is appropriately limited?',
        [
          'Column layouts often help broad scans of a few columns, but do not dominate every workload',
          'Column storage makes all writes instantaneous',
          'Row storage cannot support analytics',
          'Compression guarantees perfect freshness',
        ],
        0,
        'Physical layout is a trade-off tied to access patterns.',
        'Avoid an absolute claim across all operations.',
      ),
    ],
    [
      [
        'Why can column storage reduce analytical scan I/O?',
        'A query can read only its selected columns rather than every field of each row.',
      ],
      [
        'What is vectorized query execution?',
        'Applying operations to batches of values rather than handling every value through a separate high-overhead path.',
      ],
    ],
  ),

  node(
    'ds-materialized',
    'ds-evolution',
    'Maintain a precomputed view',
    'Balance faster reads against freshness and update work.',
    ['ds-authority'],
    [
      'A materialized view stores the result of a transformation or query instead of recomputing it on every read. It is derived data: its meaning depends on the source and the rules used to construct it.',
      'A view can be refreshed in batches or updated incrementally as source data changes. Batch refreshes create an explicit freshness window; incremental updates require handling retries, deletions, and missed changes. Decide how readers detect and tolerate staleness.',
    ],
    'A dashboard stores registrations per workshop and refreshes every ten minutes.',
    'Show the refresh time and accept the stated freshness window, or change the update design.',
    'A cached total is not guaranteed to include the newest registration.',
    [
      q(
        'What is a materialized view?',
        [
          'Only a live query with no stored result',
          'An unrelated authoritative dataset',
          'A stored result derived from source data',
          'A new physical server by definition',
        ],
        2,
        'It persists the transformed result for later access.',
        'The output is stored rather than recomputed for every read.',
      ),
      q(
        'A view refreshes every ten minutes. Which expectation is sound?',
        [
          'It may omit changes since the latest completed refresh',
          'It is necessarily current to the millisecond',
          'It cannot be rebuilt',
          'It automatically prevents all source mistakes',
        ],
        0,
        'Batch refresh introduces a freshness window.',
        'Consider an update immediately after a refresh.',
      ),
      q(
        'What is an advantage of incrementally updating a count view?',
        [
          'It eliminates the need to interpret events',
          'It guarantees no event can be duplicated',
          'It deletes the source',
          'It can avoid recomputing the whole aggregate after every change',
        ],
        3,
        'Incremental maintenance updates the affected result rather than scanning all source data.',
        'Update the small changed contribution.',
      ),
      q(
        'What must a reliable incremental view handle?',
        [
          'Only insertions arriving exactly once forever',
          'Retries, deletions, and gaps in delivered changes',
          'Only its display color',
          'No relationship to source data',
        ],
        1,
        'Real change propagation needs recovery from repetition, removal, and missing events.',
        'A derived view needs a repair plan.',
      ),
    ],
    [
      [
        'What trade-off does materialization make?',
        'Faster reads in exchange for storage, maintenance, and possible staleness.',
      ],
      [
        'What distinguishes batch refresh from incremental maintenance?',
        'Batch refresh recomputes periodically; incremental maintenance applies changes to the existing result.',
      ],
    ],
  ),

  node(
    'ds-schema-evolution',
    'ds-evolution',
    'Evolve an encoded contract',
    'Check compatibility between old and new readers and writers.',
    ['ds-documents'],
    [
      'Encoding turns structured values into bytes that another process or future version can read. During a rolling deployment, old and new application versions can overlap, so a schema change must account for both readers and writers.',
      'Backward compatibility means a newer reader can understand older data. Forward compatibility means an older reader can handle newer data. Optional fields, defaults, and stable field identities can support evolution, but the actual format and reader behavior must be checked.',
    ],
    'Version 2 adds an optional subtitle. Version 1 ignores unknown fields, and version 2 supplies a default when subtitle is absent.',
    'Test old-reader/new-writer and new-reader/old-writer combinations.',
    'Testing both directions matches the mixed-version deployment rather than only a clean upgrade.',
    [
      q(
        'What is backward compatibility for a data format?',
        [
          'An older reader understands all future data automatically',
          'A newer reader can understand older data',
          'All bytes are read in reverse',
          'No schema may ever change',
        ],
        1,
        'Backward compatibility supports newer code reading data produced previously.',
        'The newer reader looks back at old data.',
      ),
      q(
        'What is forward compatibility?',
        [
          'Only new writers reading their own data',
          'Deleting every unknown field globally',
          'An older reader can handle data produced by a newer writer',
          'All old versions are impossible to run',
        ],
        2,
        'Forward compatibility concerns an existing reader encountering a newer representation.',
        'The older reader encounters data from the future version.',
      ),
      q(
        'Why test mixed reader/writer versions before a rolling release?',
        [
          'Both versions may be active and exchange stored or transmitted data',
          'Only one version can ever run at a time',
          'Byte encodings ignore all fields',
          'It replaces operational monitoring',
        ],
        0,
        'A rollout can temporarily pair old readers with new writers and vice versa.',
        'Think about overlap during the deployment.',
      ),
      q(
        'What is the safest statement about adding an optional field?',
        [
          'It is always safe in every format',
          'It guarantees all old readers accept it',
          'It requires deleting all old data',
          'It may be compatible if absence and unknown-field behavior are supported and tested',
        ],
        3,
        'Compatibility depends on the format and the concrete reader implementations.',
        'Check both missing fields and extra fields.',
      ),
    ],
    [
      [
        'What is backward compatibility?',
        'New readers can understand data produced by older writers.',
      ],
      [
        'What is forward compatibility?',
        'Old readers can handle data produced by newer writers.',
      ],
    ],
  ),

  node(
    'ds-dataflow',
    'ds-evolution',
    'Move data between services',
    'Compare request-response calls with asynchronous event delivery.',
    ['ds-deployment'],
    [
      'A request-response call asks another service to perform work and return a result. An asynchronous message places work or a fact in a channel for later processing. A broker can buffer work and decouple processing time, but it does not remove the need for delivery and failure semantics.',
      'After a timeout, a caller may not know whether remote work finished. Retrying can repeat effects. An idempotent operation has the same intended effect when repeated; a stable operation ID and duplicate detection can help provide this property.',
    ],
    'A registration event has ID e-42. A consumer receives it twice after reconnecting.',
    'Record the applied event identity so the derived attendance count increases once.',
    'Repeated delivery should not accidentally create repeated business effects.',
    [
      q(
        'What can an asynchronous broker provide?',
        [
          'A buffer between a producer and a temporarily slow consumer',
          'A proof that all messages are processed instantly',
          'A guarantee that schema changes need no testing',
          'A replacement for every source of truth',
        ],
        0,
        'Buffering can decouple production from consumer availability and speed.',
        'The sender and receiver need not work at the same moment.',
      ),
      q(
        'A remote call times out. What is known?',
        [
          'The remote operation definitely never started',
          'The operation definitely succeeded',
          'The caller lacks a confirmed outcome; the operation may or may not have completed',
          'The database was necessarily deleted',
        ],
        2,
        'The missing response leaves uncertainty about remote execution.',
        'A lost reply and a failed operation can look the same to the caller.',
      ),
      q(
        'What does idempotent processing aim to ensure?',
        [
          'No request ever needs a reply',
          'Repeating the same operation does not repeat its intended effect',
          'Every message has the same contents',
          'All nodes share one memory address',
        ],
        1,
        'Duplicate attempts should converge to one intended result.',
        'Compare the effect of one attempt with several identical attempts.',
      ),
      q(
        'Which mechanism can help avoid applying an event twice?',
        [
          'Only a longer topic name',
          'Removing all event identities',
          'Relying on receipt order alone forever',
          'A stable event ID with durable duplicate detection',
        ],
        3,
        'An identity can be checked against previously applied work.',
        'Recognize the same operation across retries.',
      ),
    ],
    [
      [
        'Why is a timeout an uncertain outcome for remote work?',
        'The request or reply may be delayed or lost even if the remote operation completed.',
      ],
      [
        'What is idempotence?',
        'Repeating an operation has the same intended effect as applying it once.',
      ],
    ],
  ),

  node(
    'ds-replication',
    'ds-replication',
    'Keep multiple copies',
    'Compare synchronous and asynchronous follower updates.',
    ['ds-deployment'],
    [
      'Replication maintains copies of data on multiple nodes. In a single-leader design, writes go through the leader and followers receive the ordered changes. Copies can support recovery from node failure and distribute reads.',
      'Synchronous replication waits for specified replica acknowledgments before confirming a write. Asynchronous replication can confirm before followers catch up. Waiting changes response time and availability; not waiting changes which acknowledged changes may be missing during a failure.',
    ],
    'A leader acknowledges an update while its asynchronous follower is still one change behind.',
    'Do not assume a follower read immediately includes the acknowledged update.',
    'Acknowledgment and replication progress are different events in this design.',
    [
      q(
        'Where do writes normally enter a single-leader replication design?',
        [
          'Every follower independently without a leader',
          'The leader',
          'Only the user’s display cache',
          'A random backup file',
        ],
        1,
        'The designated leader orders writes and sends changes to followers.',
        'The name identifies the write coordinator.',
      ),
      q(
        'What distinguishes synchronous acknowledgment?',
        [
          'The write ignores every replica',
          'Followers cannot store data',
          'A required replica confirmation is awaited before success is reported',
          'The clock always moves faster',
        ],
        2,
        'The success path waits for the configured acknowledgment condition.',
        'Which event must happen before the caller sees success?',
      ),
      q(
        'What is a possible cost of waiting for a required replica?',
        [
          'Higher response time or reduced write availability if it is unreachable',
          'Guaranteed zero latency',
          'No durability trade-off',
          'Automatic removal of every logical mistake',
        ],
        0,
        'An additional dependency can delay or prevent acknowledgment.',
        'The caller may have to wait for another node.',
      ),
      q(
        'Why can asynchronous replication lose an acknowledged update after leader failure?',
        [
          'All replicated data is always random',
          'Asynchronous replicas never receive any updates',
          'A write acknowledgment proves every follower is current',
          'The failed leader may have confirmed a change not yet copied to a surviving node',
        ],
        3,
        'Confirmation may precede successful propagation to a follower.',
        'Consider the timing between acknowledgment and copying.',
      ),
    ],
    [
      [
        'How do synchronous and asynchronous replication differ?',
        'Synchronous acknowledgment waits for specified replica confirmation; asynchronous acknowledgment can precede follower catch-up.',
      ],
      [
        'Does replication automatically protect against accidental deletion?',
        'No. A logical mistake can propagate to all live replicas.',
      ],
    ],
  ),

  node(
    'ds-replication-lag',
    'ds-replication',
    'Reason about stale reads',
    'Distinguish reading your writes from monotonic reads.',
    ['ds-replication'],
    [
      'A lagging follower can return an older value than the leader. This may be acceptable for some workloads and confusing for others. Reading your own writes requires that a client sees changes it has already successfully made.',
      'Monotonic reads prevent one client from moving backward to an earlier observed version. These are different guarantees: a client can avoid going backward yet still miss its own recent write. Routing, version tokens, or waiting for replica progress can help, but the implementation must match the promise.',
    ],
    'A learner saves a title on the leader, then refreshes through a follower that has not applied the change.',
    'Route the needed read to a sufficiently current replica or wait for the recorded version.',
    'The behavior requires a freshness mechanism rather than just another replica.',
    [
      q(
        'What causes a stale follower read?',
        [
          'The follower has not applied a newer change yet',
          'The user used a short name',
          'The record has a primary key',
          'Every replica is equally current by definition',
        ],
        0,
        'Replication delay can leave a follower at an earlier version.',
        'Consider whether the write has reached that replica.',
      ),
      q(
        'Which promise is specifically reading your own writes?',
        [
          'Every user sees every write instantly',
          'A client sees updates it has already successfully made',
          'A response contains no timestamps',
          'A client can read only one table',
        ],
        1,
        'The guarantee connects a client’s successful writes to its later reads.',
        'Focus on the same client’s update.',
      ),
      q(
        'A client sees version 7 and then version 5 of the same record. Which guarantee is violated?',
        ['Compression', 'Data locality', 'Monotonic reads', 'Key uniqueness'],
        2,
        'The observed state moves backward to an older version.',
        'The sequence of observed versions should not decrease.',
      ),
      q(
        'Why is simply adding more replicas insufficient to guarantee read freshness?',
        [
          'Replica count decides every schema',
          'A larger number makes networks synchronous',
          'Replicas never accept changes',
          'Replica progress and routing still determine which version is read',
        ],
        3,
        'More copies do not ensure the selected copy has applied a particular write.',
        'Count and currency are different properties.',
      ),
    ],
    [
      [
        'What are monotonic reads?',
        'A client does not observe an older version after it has already observed a newer one.',
      ],
      [
        'What is reading your own writes?',
        'A client’s later reads reflect its earlier successfully completed writes.',
      ],
    ],
  ),

  node(
    'ds-conflicts',
    'ds-replication',
    'Resolve concurrent changes',
    'Recognize concurrency and choose an explicit merge rule.',
    ['ds-replication'],
    [
      'Changes are concurrent when neither is known to follow from the other. Two offline clients can both edit the same earlier version. Different arrival orders at replicas must not be mistaken for one universally agreed causal order.',
      'Conflict resolution is part of application semantics. Last-write-wins chooses one value and can discard another valid change; wall clocks may also disagree. Merging sets, retaining alternatives, or asking a user to resolve a conflict can be appropriate depending on the meaning of the data.',
    ],
    'Two disconnected planners add different checklist items to the same workshop draft.',
    'Use a merge rule that preserves both additions if that matches the checklist’s meaning.',
    'Choosing one entire draft merely by arrival time can lose a legitimate edit.',
    [
      q(
        'Which pair of edits is clearly concurrent?',
        [
          'One edit intentionally made after reading the other',
          'A rename and its explicitly dependent confirmation',
          'A repeated read of one unchanged value',
          'Two disconnected clients edit the same earlier version without seeing each other',
        ],
        3,
        'Neither client’s operation incorporates or follows the other’s edit.',
        'Look for absent causal knowledge between operations.',
      ),
      q(
        'What can last-write-wins discard?',
        [
          'A valid concurrent change that loses the selection rule',
          'Only blank field names',
          'All network packets in every system',
          'The need for any tie-breaking rule',
        ],
        0,
        'Selecting one winner may overwrite a meaningful competing value.',
        'A single winner does not preserve every contribution.',
      ),
      q(
        'Why is wall-clock time alone a risky causal-order detector?',
        [
          'All clocks are forbidden in software',
          'Clocks can disagree and time order does not establish that one writer observed another',
          'Every timestamp is a primary key',
          'Timestamps encode the full read history',
        ],
        1,
        'A later clock reading is not proof of causality, especially with clock skew.',
        'A writer’s knowledge matters, not only its clock.',
      ),
      q(
        'Two clients independently add different tags. Which merge may fit an additive tag collection?',
        [
          'Delete both additions',
          'Keep whichever text is alphabetically shorter',
          'Combine both additions using a defined set merge',
          'Change the record ID every read',
        ],
        2,
        'A set-like union can preserve independent additions when that matches the semantics.',
        'The data represents a collection of contributions.',
      ),
    ],
    [
      [
        'When are two updates concurrent?',
        'Neither is known to follow causally from the other.',
      ],
      [
        'What is an application cost of last-write-wins?',
        'It can discard valid concurrent changes rather than preserving or resolving them.',
      ],
    ],
  ),

  node(
    'ds-quorums',
    'ds-replication',
    'Check replica overlap',
    'Reason about read/write quorum intersections and their limits.',
    ['ds-replication-lag', 'ds-conflicts'],
    [
      'In a fixed replica set of size N, a write may wait for W replicas and a read may wait for R. When R + W > N, the responding sets must overlap, provided they are drawn from that same replica set.',
      'Overlap is a useful building block, not a complete proof of linearizable behavior: acting as if there were a single copy, so every read after a completed write sees it. Concurrent writes, version selection, failed writes, and alternative replica placement can complicate the result. State the assumptions before turning a quorum inequality into a guarantee.',
    ],
    'A record has N = 5 replicas. A completed write reached W = 3, and a read receives R = 3 responses from that same set.',
    'The response sets must overlap in at least one replica.',
    'The inequality proves overlap; the protocol still needs correct version and concurrency handling.',
    [
      q(
        'For N = 5, which R/W pair forces overlap within the same fixed replica set?',
        ['R = 1, W = 1', 'R = 3, W = 3', 'R = 2, W = 2', 'R = 1, W = 3'],
        1,
        '3 + 3 is greater than 5, so disjoint response sets are impossible.',
        'Check whether R + W exceeds N.',
      ),
      q(
        'If R + W = N, must the sets overlap?',
        [
          'Yes, equality always forces overlap',
          'Yes, because all reads use leaders',
          'No, they may be disjoint',
          'Only if field names are short',
        ],
        2,
        'One set can contain exactly the replicas not present in the other.',
        'Consider splitting the replica set into two separate groups.',
      ),
      q(
        'What does quorum overlap alone establish?',
        [
          'Every operation is automatically linearizable',
          'All concurrent writes have identical values',
          'No failures can occur',
          'At least one replica belongs to both responding sets under the stated assumptions',
        ],
        3,
        'The arithmetic proves set intersection, while stronger consistency needs protocol assumptions.',
        'Separate a set fact from the full consistency guarantee.',
      ),
      q(
        'What can smaller acknowledgment thresholds trade for better availability?',
        [
          'A greater chance of stale or incomplete observations',
          'A guarantee that no write ever fails',
          'A proof that clocks agree',
          'Perfectly current reads with no protocol',
        ],
        0,
        'Fewer required responses can allow progress while weakening overlap and freshness properties.',
        'Fewer responses provide less evidence about the copies.',
      ),
    ],
    [
      [
        'When must read and write response sets overlap?',
        'For a common fixed replica set of size N, R + W > N forces an intersection.',
      ],
      [
        'Does quorum overlap alone prove linearizability?',
        'No. Correct version handling, concurrency, failure, and replica-placement assumptions still matter.',
      ],
    ],
  ),

  node(
    'ds-partitioning',
    'ds-sharding',
    'Split ownership by key',
    'Distinguish sharding from replication and choose a partition key.',
    ['ds-key-values', 'ds-replication'],
    [
      'Sharding distributes different parts of a dataset across nodes. Replication copies the same part to multiple nodes. A deployment can combine both: each shard owns a subset of keys and has replicas of that subset.',
      'The partition key determines which records travel together. It affects load distribution, query routing, and whether related work stays local. Choose it from access patterns and the largest expected tenants (customer organizations whose data is grouped together) or entities, not only from the current number of records.',
    ],
    'Workshop records are assigned to shards by organizer ID. Each shard has two replicas.',
    'Understand organizer ID as the ownership boundary and replicas as extra copies within that boundary.',
    'Splitting data and copying data solve different parts of the design.',
    [
      q(
        'How does sharding differ from replication?',
        [
          'They are always exactly the same',
          'Sharding copies the whole dataset to every node',
          'Replication never duplicates data',
          'Sharding distributes different subsets; replication keeps copies',
        ],
        3,
        'Ownership splitting and redundant copying are distinct mechanisms.',
        'Ask whether nodes hold different pieces or the same piece.',
      ),
      q(
        'What does a partition key primarily determine?',
        [
          'Which ownership group receives a record',
          'The font size of its value',
          'Its password hash algorithm automatically',
          'Whether every query is analytical',
        ],
        0,
        'The routing rule uses the key to locate the responsible shard.',
        'The key selects a place in the distributed dataset.',
      ),
      q(
        'Why might partitioning by organizer ID help an organizer-specific query?',
        [
          'It guarantees every organizer is equally large',
          'It makes all global scans free',
          'Related organizer records may be colocated',
          'It removes all future rebalancing',
        ],
        2,
        'Grouping by the query’s key can reduce cross-shard work for that query.',
        'Look for locality among the records requested together.',
      ),
      q(
        'What risk should be checked before putting all of one tenant on one shard?',
        [
          'Whether the tenant uses punctuation',
          'Whether a very large tenant can exceed one shard’s capacity',
          'Whether integer keys have names',
          'Whether every tenant has the same logo',
        ],
        1,
        'Uneven tenant size or traffic can overload the single responsible shard.',
        'One ownership group can be much larger than others.',
      ),
    ],
    [
      [
        'How can sharding and replication be combined?',
        'Each shard owns a distinct data subset, and several replicas keep copies of that subset.',
      ],
      [
        'What does the partition key influence?',
        'Record ownership, locality, load distribution, and query routing.',
      ],
    ],
  ),

  node(
    'ds-hash-range',
    'ds-sharding',
    'Choose hash or range routing',
    'Compare locality, distribution, and routing stability.',
    ['ds-partitioning'],
    [
      'Range sharding assigns ordered intervals of keys to shards. It preserves locality for range queries, but sequential new keys can concentrate writes in one interval. Hash sharding spreads different keys according to a deterministic hash, a function that turns a key into a number unrelated to the key’s order and always gives the same number for the same key; it usually gives up useful original-key ordering.',
      'A distributed routing hash must produce the same result wherever it is used. A process-randomized language hash is not necessarily suitable. Distribution across many distinct keys also does not guarantee balanced traffic when one key is unusually popular.',
    ],
    'New measurements have increasing timestamps, and all newest timestamps fall in the final key range.',
    'Recognize a write hot spot; consider a different partition design based on the query requirements.',
    'An ordered range preserves time locality while concentrating the newest writes.',
    [
      q(
        'Which property is a strength of range sharding?',
        [
          'Every hot key is automatically split',
          'Nearby ordered keys can be kept together',
          'All range queries need every shard by definition',
          'The partition key is never needed',
        ],
        1,
        'Preserving key order supports locality for bounded intervals.',
        'Consider requesting consecutive keys.',
      ),
      q(
        'What can sequential timestamps cause with simple range sharding?',
        [
          'No new writes',
          'Automatic equal load forever',
          'Concentrated writes to the newest interval',
          'A full replica of every old interval on the client',
        ],
        2,
        'The current end of the ordered key space can receive most new writes.',
        'All new values fall near one end.',
      ),
      q(
        'Why must a routing hash be stable across processes?',
        [
          'All routers must agree on the owner for the same key',
          'It makes every value encrypted',
          'It sorts names alphabetically',
          'It replaces failure detection',
        ],
        0,
        'Different routing results would send one key to inconsistent owners.',
        'The same key must select the same destination.',
      ),
      q(
        'Does hashing keys guarantee balanced request rates?',
        [
          'Yes, one popular key becomes every possible key',
          'Yes, traffic is always identical to key count',
          'Yes, reads can no longer be skewed',
          'No, a single highly requested key can still overload its owner',
        ],
        3,
        'Hashing spreads keys, but requests may be distributed very unevenly across them.',
        'Count requests per key, not just keys per shard.',
      ),
    ],
    [
      [
        'What trade-off does hash sharding make compared with range sharding?',
        'It can spread distinct keys more evenly but sacrifices useful original-key range locality.',
      ],
      [
        'Why should process-randomized hashes not be assumed suitable for routing?',
        'Different processes may map the same key differently, while routing requires agreement.',
      ],
    ],
  ),

  node(
    'ds-hotspots',
    'ds-sharding',
    'Diagnose uneven load',
    'Separate balanced key counts from balanced traffic.',
    ['ds-hash-range'],
    [
      'A hot spot is an ownership group receiving disproportionate traffic or storing disproportionate data. Equal numbers of keys do not imply equal work: one record may receive most requests. Measure load by shard and by the keys responsible for it.',
      'Different remedies move different costs. Caching or extra read replicas can help repeated reads; splitting a logical counter across several keys can spread writes but makes reads combine the pieces. Any split must preserve the application’s update and query semantics.',
    ],
    'One public workshop receives 80% of all page reads while the remaining keys are evenly assigned.',
    'Measure the dominant key and consider read caching or serving replicas before assuming more uniform hashing will solve it.',
    'The skew is in popularity, not in the number of assigned keys.',
    [
      q(
        'Why can equally sized shards have different CPU load?',
        [
          'Key counts prove equal request rates',
          'All CPUs must have identical utilization',
          'Some keys receive much more traffic than others',
          'Shards cannot serve reads',
        ],
        2,
        'The distribution of requests may differ from the distribution of stored keys.',
        'Popularity can be highly uneven.',
      ),
      q(
        'Which measure helps identify a hot key?',
        [
          'Request counts and work attributed to individual keys',
          'Only the application’s title',
          'Only average key length',
          'The browser theme',
        ],
        0,
        'Attributing load to keys reveals whether a small set dominates traffic.',
        'Measure where the work comes from.',
      ),
      q(
        'A counter is split into several subkeys to spread writes. What must a total read do?',
        [
          'Ignore all but one subkey',
          'Delete the subkeys',
          'Assume the total is always zero',
          'Combine the relevant subkey contributions correctly',
        ],
        3,
        'Splitting write ownership shifts aggregation work to readers or another derived view.',
        'The pieces still represent one logical total.',
      ),
      q(
        'Which remedy is directly aimed at repeated reads of one rarely changing record?',
        [
          'Randomly deleting the record',
          'Caching with an appropriate freshness strategy',
          'Changing every primary key per read',
          'Forcing every request to scan all shards',
        ],
        1,
        'Caching can reduce repeated source reads while making freshness an explicit trade-off.',
        'Reuse a result when its staleness policy allows it.',
      ),
    ],
    [
      [
        'Why is uniform key distribution not enough to establish balanced load?',
        'Different keys can have very different data sizes or request frequencies.',
      ],
      [
        'What trade-off can splitting a hot logical key introduce?',
        'Writes can be spread, but reads or updates may need to combine and coordinate the pieces.',
      ],
    ],
  ),

  node(
    'ds-rebalancing',
    'ds-sharding',
    'Move data without losing ownership',
    'Plan shard migration, routing, and verification.',
    ['ds-partitioning'],
    [
      'Rebalancing moves ownership or data as capacity changes. A useful scheme limits unnecessary movement when nodes are added or removed. Fixed logical shards can be reassigned to physical nodes without changing every record’s logical shard.',
      'A live move must account for writes that occur during copying. Routing and ownership need a clear transition rule, and the destination must be checked before the source is retired. A copy operation alone is not proof that no concurrent updates were missed.',
    ],
    'A logical shard is copied from Node A to Node B while clients continue updating it.',
    'Transfer or replay concurrent changes, verify the destination, and change ownership with an explicit routing transition.',
    'The initial snapshot can become stale while the move is in progress.',
    [
      q(
        'What is the goal of rebalancing?',
        [
          'Make every key unreadable',
          'Redistribute ownership or data as capacity changes',
          'Remove all replicas permanently',
          'Make all queries return the same row',
        ],
        1,
        'Capacity changes may require moving subsets to different owners.',
        'The layout should adapt to available resources.',
      ),
      q(
        'Why can copying a snapshot be insufficient for a live shard move?',
        [
          'Snapshots contain no data',
          'The target can never receive writes',
          'Writes may occur after the snapshot was taken',
          'The source name is too short',
        ],
        2,
        'Concurrent changes must also reach the new owner.',
        'The source can change while copying takes time.',
      ),
      q(
        'What is a benefit of fixed logical shards?',
        [
          'They can be reassigned to physical nodes without redefining each record’s logical group',
          'They guarantee all traffic is equal',
          'They eliminate routing metadata',
          'They prevent any hardware failure',
        ],
        0,
        'Logical ownership can remain stable while placement changes.',
        'Separate a logical partition from its hosting node.',
      ),
      q(
        'Before retiring a moved shard’s old copy, what deserves verification?',
        [
          'Only the new node’s color',
          'Only its hostname length',
          'Whether all clients changed their passwords',
          'Destination completeness and the ownership/routing transition',
        ],
        3,
        'Retirement must not leave missing data or unclear routing.',
        'Data arrival and client routing both matter.',
      ),
    ],
    [
      [
        'What must live shard migration handle besides the initial copy?',
        'Concurrent updates, completeness verification, and a clear routing/ownership transition.',
      ],
      [
        'Why separate logical shards from physical nodes?',
        'Logical groups can be moved between nodes without changing every record’s logical ownership rule.',
      ],
    ],
  ),

  node(
    'ds-atomicity',
    'ds-transactions',
    'Group changes into a transaction',
    'Distinguish all-or-nothing updates from durable storage.',
    ['ds-key-values'],
    [
      'A transaction groups operations so the database can apply defined guarantees. Atomicity means the transaction’s changes succeed as a unit or are undone when it aborts. Durability concerns whether a committed result survives the failures covered by the storage guarantee.',
      'An application still defines its own valid-state rules and must express them through the database’s constraints (rules the database checks on every write, such as a unique email) and transactions. A transaction is not a promise that every business rule is automatically known. External effects, such as sending a message, may need additional coordination.',
    ],
    'Rescheduling a booking removes its old room assignment and inserts the new assignment.',
    'Commit both database changes together or abort both.',
    'Applying only one half can create an invalid intermediate outcome that persists.',
    [
      q(
        'What does atomicity mean for a transaction?',
        [
          'Its grouped changes are all applied or undone on abort',
          'Every query returns immediately',
          'No operation can ever fail',
          'Every user sees every replica instantly',
        ],
        0,
        'Atomicity concerns the unit of change, not speed or universal availability.',
        'Think about a failure partway through the group.',
      ),
      q(
        'How does durability differ from atomicity?',
        [
          'Durability is only a font setting',
          'Atomicity means backups are never needed',
          'Durability concerns survival of committed results under the stated failure model',
          'They have identical definitions',
        ],
        2,
        'Atomicity groups outcomes; durability preserves a committed outcome.',
        'One property concerns grouping and the other persistence.',
      ),
      q(
        'Who defines an application rule such as one active room assignment per booking?',
        [
          'The disk automatically knows it',
          'The application design, enforced with appropriate constraints and transactions',
          'Every replica invents a different rule',
          'The primary key’s spelling alone',
        ],
        1,
        'The database enforces rules that the schema and operations actually express.',
        'A business meaning must be represented explicitly.',
      ),
      q(
        'Why can an email sent before a database transaction aborts be problematic?',
        [
          'Email bodies are always empty',
          'Atomicity automatically recalls every email',
          'Database rollbacks change all external systems',
          'The external effect may already have happened despite database rollback',
        ],
        3,
        'Database atomicity does not automatically undo an independently performed external effect.',
        'The email is outside the database’s rollback boundary.',
      ),
    ],
    [
      [
        'What is transaction atomicity?',
        'A transaction’s changes succeed together or are undone together when it aborts.',
      ],
      [
        'Does database atomicity automatically roll back external effects?',
        'No. Messages, emails, and other external effects need their own coordination strategy.',
      ],
    ],
  ),

  node(
    'ds-isolation',
    'ds-transactions',
    'Choose what readers may observe',
    'Compare committed reads with a stable snapshot.',
    ['ds-atomicity'],
    [
      'Concurrent transactions can overlap. Isolation defines which interactions the database permits. Read committed prevents observing another transaction’s uncommitted values, but separate reads may still see different committed states.',
      'Snapshot isolation lets a transaction read from a consistent snapshot rather than a changing sequence of committed versions. This can help multi-read tasks, but it does not by itself prevent every application-level conflict. Names and details vary across engines, so verify the actual guarantees.',
    ],
    'A report reads a workshop total, then its category subtotals while other transactions update both.',
    'Use an appropriate consistent snapshot if the report must compare one coherent state.',
    'Committed individual reads can still come from different moments.',
    [
      q(
        'What is a dirty read?',
        [
          'Reading a record with whitespace',
          'Observing another transaction’s not-yet-committed data',
          'Reading a committed old backup intentionally',
          'Any query using an index',
        ],
        1,
        'The observed data could disappear if its writer aborts.',
        'Has the other transaction committed yet?',
      ),
      q(
        'What does read committed alone not generally promise?',
        [
          'That uncommitted changes are visible',
          'That all reads scan every shard',
          'That every statement in the transaction sees one unchanged snapshot',
          'That primary keys disappear',
        ],
        2,
        'Later statements may see later committed updates under read committed.',
        'Separate statement-level committed reads from a transaction-wide snapshot.',
      ),
      q(
        'What is a useful property of snapshot isolation?',
        [
          'Reads within the transaction can observe a coherent snapshot',
          'Every workload becomes serializable automatically',
          'Every transaction holds the only global CPU',
          'All external effects are rolled back',
        ],
        0,
        'A stable snapshot supports internally coherent multi-read work.',
        'The reads share a view of database state.',
      ),
      q(
        'Why check an engine’s documentation instead of relying only on an isolation-level name?',
        [
          'Names always have identical semantics everywhere',
          'Documentation cannot describe isolation',
          'Only the number of replicas matters',
          'Implementations and guarantees associated with names can differ',
        ],
        3,
        'Products may use the same label for different concrete behaviors.',
        'Verify the guarantee your operations need.',
      ),
    ],
    [
      [
        'What does read committed prevent for reads?',
        'Reading values written by another transaction that has not committed.',
      ],
      [
        'Does snapshot isolation automatically prevent all concurrency anomalies?',
        'No. It provides a coherent snapshot, but two transactions can each act on their own snapshot and together break a rule.',
      ],
    ],
  ),

  node(
    'ds-lost-update',
    'ds-transactions',
    'Preserve concurrent updates',
    'Detect stale read-modify-write operations.',
    ['ds-isolation'],
    [
      'A lost update occurs when two clients read an earlier value, compute separate replacements, and one replacement overwrites the other’s contribution. The problem is the interaction between reading and writing, not merely whether each individual write is atomic.',
      'An atomic update can apply a change to the current stored value. Compare-and-swap can instead write only if the version still matches what the client read; a failed comparison requires rereading and retrying or reporting a conflict. Appropriate locks or engine conflict detection are other possible mechanisms.',
    ],
    'Two organizers read revision 4. Each edits a different title detail and submits a replacement based on revision 4.',
    'Reject a replacement whose expected revision no longer matches, then reconcile with the current value.',
    'A version check exposes stale assumptions rather than silently overwriting the first edit.',
    [
      q(
        'Two clients read count 6 and each writes 7. What can be lost?',
        [
          'The fact that both intended an increment',
          'Only the field name',
          'The key’s type by definition',
          'Nothing, because two increments always produce 7',
        ],
        0,
        'Two increments should contribute twice, but stale replacements can retain only one.',
        'Compare the intended combined result with the final value.',
      ),
      q(
        'What does compare-and-swap check before writing?',
        [
          'Whether every replica has the same logo',
          'Whether the new string is longer',
          'Whether the current value or version matches the expected one',
          'Whether the client has ever used a graph',
        ],
        2,
        'The conditional write prevents applying a replacement based on a changed version.',
        'It compares the state the client expected with the state that exists.',
      ),
      q(
        'A revision-checked write fails because the record changed. What is a sound next step?',
        [
          'Retry the same stale replacement forever without reading',
          'Read the current state and reconcile or retry appropriately',
          'Delete every concurrent edit automatically',
          'Ignore the failure and claim success',
        ],
        1,
        'The failed check reveals that the input assumptions are stale.',
        'Update the premise before recomputing the change.',
      ),
      q(
        'Why can an atomic increment be safer than a client-side read followed by replacement?',
        [
          'It relies on every client reading identical clocks',
          'It forbids all increments',
          'It removes the field from storage',
          'It applies the increment to the current stored value as one coordinated update',
        ],
        3,
        'The database operation can combine the read and change without a stale client gap.',
        'Move the update logic into an operation with the required atomic semantics.',
      ),
    ],
    [
      [
        'What is a lost update?',
        'One read-modify-write replacement overwrites another concurrent contribution based on the same earlier state.',
      ],
      [
        'What does a failed compare-and-swap tell the caller?',
        'The stored value or revision changed from what the caller expected; the change must be reconsidered.',
      ],
    ],
  ),

  node(
    'ds-serializable',
    'ds-transactions',
    'Protect a multi-record invariant',
    'Recognize write skew and reason about serializable outcomes.',
    ['ds-lost-update', 'ds-relational'],
    [
      'Write skew can violate a rule involving several records even when concurrent transactions write different records. Each transaction checks the same earlier condition and then makes a change that would have been unsafe after observing the other’s change.',
      'Serializable isolation aims for a result equivalent to some one-at-a-time transaction order, even when execution overlaps. Engines may enforce it through locking or conflict detection and aborts. Applications must be prepared to retry suitable aborted transactions; stronger isolation is not a guarantee of no failures or unlimited throughput.',
    ],
    'An exhibit has one remaining display slot. Two transactions both see zero pending allocations for that slot and insert separate allocations.',
    'Enforce the capacity rule with an appropriate constraint or serializable transaction strategy.',
    'Different inserted rows can still conflict through a shared predicate about capacity.',
    [
      q(
        'What makes write skew different from a simple lost update?',
        [
          'It only changes text colors',
          'It cannot involve transactions',
          'It always writes the same row twice',
          'Different records can be changed while a shared multi-record rule is violated',
        ],
        3,
        'The conflict can be in the checked condition, even without replacing the same object.',
        'The invariant can span more than one row.',
      ),
      q(
        'What does serializable isolation promise about successful transaction outcomes?',
        [
          'Equivalence to some serial execution order',
          'All transactions always finish without retry',
          'Every write takes zero time',
          'Every replica receives every change instantly',
        ],
        0,
        'The outcome must be explainable as an ordering of nonoverlapping transactions.',
        'The guarantee concerns observable results.',
      ),
      q(
        'Why must an application be ready to retry some serializable transactions?',
        [
          'Serializable databases cannot store integers',
          'The database may abort a transaction to prevent a conflicting execution',
          'Every transaction must fail permanently',
          'The schema is deleted after every request',
        ],
        1,
        'Conflict detection can preserve the guarantee by aborting a participant.',
        'A prevented anomaly can appear as an abort.',
      ),
      q(
        'Two inserts separately satisfy a check that at most one allocation exists, but together create two. What needs protection?',
        [
          'Only the spelling of allocation IDs',
          'Only each row’s independent string length',
          'The shared predicate or invariant, not just individual row writes',
          'The application’s splash screen',
        ],
        2,
        'A rule about a set of records needs enforcement that accounts for concurrent changes to that set.',
        'Both decisions depended on the same capacity condition.',
      ),
    ],
    [
      [
        'What is serializable isolation?',
        'Successful transaction outcomes are equivalent to some serial, one-at-a-time execution order.',
      ],
      [
        'Why can separate row writes still conflict?',
        'They can jointly violate a shared predicate or multi-record invariant despite touching different rows.',
      ],
    ],
  ),
];

export const dataSystemsCatalog: CurriculumCatalog = {
  courses: [
    {
      id: courseId,
      title: 'Data systems foundations',
      domain: 'programming',
      description:
        'Reason about data models, storage, replication, sharding, and transactions through original design scenarios informed by the supplied DDIA early-release edition.',
      skillIds: nodes.map((item) => item.id),
    },
  ],
  units: [
    {
      id: 'ds-foundations',
      courseId,
      title: 'System foundations',
      description:
        'Describe the workload, guarantees, authority, and operating model.',
    },
    {
      id: 'ds-models',
      courseId,
      title: 'Models and relationships',
      description:
        'Choose representations for identities, nested data, shared facts, and paths.',
    },
    {
      id: 'ds-storage',
      courseId,
      title: 'Storage and access paths',
      description:
        'Connect key-value maps to durable storage and workload-specific indexes.',
    },
    {
      id: 'ds-evolution',
      courseId,
      title: 'Analytics and evolution',
      description:
        'Support broad scans, derived views, compatible formats, and service dataflow.',
    },
    {
      id: 'ds-replication',
      courseId,
      title: 'Copies and concurrency',
      description:
        'Reason about replica timing, stale reads, conflicts, and quorum limits.',
    },
    {
      id: 'ds-sharding',
      courseId,
      title: 'Ownership and scale',
      description:
        'Distribute data without confusing key balance, traffic balance, and migration.',
    },
    {
      id: 'ds-transactions',
      courseId,
      title: 'Transactional guarantees',
      description:
        'Protect grouped updates and multi-record rules under concurrent work.',
    },
  ],
  skills: nodes.map((item, order) => ({ ...item, order })),
};
