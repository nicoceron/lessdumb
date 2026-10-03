import type { CurriculumCatalog, Skill } from '../curriculum';

const courseId = 'data-systems-foundations';

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
    // Choice practice lives in knowledge points; there is no code exercise.
    questions: [],
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
    ['ds-workloads', 'indexing'],
    [
      'Throughput measures completed work per unit of time. Response time measures how long a request takes from the caller’s perspective. A service can complete many requests per second while a minority of users experience very slow responses.',
      'A percentile describes a boundary in the response-time distribution: the p95 is the time within which 95% of requests finish, so only the slowest 5% take longer. Unlike an average, it exposes the slow tail. Also specify the load under which the target should hold; an unloaded benchmark does not establish behavior at peak demand.',
      'Reliability targets separate faults from failures. A fault is one component misbehaving, such as a broken disk or a crashed process; a failure is the service as a whole not delivering what it promised. Fault-tolerant designs keep faults from becoming failures.',
    ],
    'Two services both average 80 ms. One has p99 of 130 ms; the other has p99 of 2 seconds.',
    'Inspect the tail distribution instead of declaring the services equivalent.',
    'The average hides the experience of unusually slow requests.',
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
