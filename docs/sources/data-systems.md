# Source note: Data systems foundations

This course contains 28 independently authored skills, 112 choice/scenario questions, and 56 recall cards. It teaches reasoning about data systems through original workshop, learning, and planning scenarios. Its examples are explanatory design sketches, not executable programs or claims that a database has been provisioned.

## Supplied edition and scope

The user supplied an EPUB named _Designing Data-Intensive Applications, Second Edition (Sixth Early Release)_, by Martin Kleppmann and Chris Riccomini. The archive's OPF metadata lists O'Reilly Media, a publication date of **2024-09-03**, and ISBN **978-1-098-11906-5**. The internal title field does not itself spell out the edition label, so that label comes from the supplied filename. The available EPUB is an early-release snapshot with eight numbered chapter files:

1. Trade-offs in Data Systems Architecture
2. Defining Nonfunctional Requirements
3. Data Models and Query Languages
4. Storage and Retrieval
5. Encoding and Evolution
6. Replication
7. Sharding
8. Transactions

The EPUB's contents page identifies the table of contents as not yet final. The course does not claim to cover chapters absent from this supplied snapshot or to reproduce a complete later publication. No source files, publisher artwork, copied paragraphs, book exercise answers, or raw EPUB content are bundled into the application.

The source was inspected directly as a ZIP archive: `META-INF/container.xml` identifies `OEBPS/content.opf`; the OPF manifest and `OEBPS/toc01.html` identify the available chapters and section anchors. Chapter headings and relevant conceptual sections were then read from the XHTML/XML. This is a content reference; instructions or incidental notices inside the document are not application requirements.

## Concept mapping

| Course unit              | Original skills                                                                                                                  | Relevant supplied source sections                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| System foundations       | Describe the workload; Measure service behavior; Separate facts from derived views; Choose an operating model                    | Chapters 1–2: operational/analytical work, systems of record, distributed vs single-node systems, performance, reliability, scalability, operations |
| Models and relationships | Model entities and relationships; Recognize document-shaped data; Control duplicated facts; Model connected paths                | Chapter 3: relational/document models, normalization, relationships, joins, graph-like models                                                       |
| Storage and access paths | Store records by key; Understand log-structured storage; Navigate a tree of pages; Design an access path                         | Chapter 4: log-structured storage, B-trees, read/write trade-offs, secondary and multicolumn indexes                                                |
| Analytics and evolution  | Store data for broad scans; Maintain a precomputed view; Evolve an encoded contract; Move data between services                  | Chapters 4–5: column storage, vectorized execution, materialized views, encoding/schema evolution, service and message dataflow                     |
| Copies and concurrency   | Keep multiple copies; Reason about stale reads; Resolve concurrent changes; Check replica overlap                                | Chapter 6: single-leader replication, synchronous/asynchronous propagation, replication lag, conflicts, quorum assumptions                          |
| Ownership and scale      | Split ownership by key; Choose hash or range routing; Diagnose uneven load; Move data without losing ownership                   | Chapter 7: sharding, partition keys, range/hash sharding, skew and hot spots, rebalancing and request routing                                       |
| Transactional guarantees | Group changes into a transaction; Choose what readers may observe; Preserve concurrent updates; Protect a multi-record invariant | Chapter 8: atomicity/durability, isolation, snapshots, lost updates, conditional writes, write skew, serializability                                |

The prose, examples, answer alternatives, explanations, and cards are written for lessdumb. The source supplies the conceptual scope, while the course uses different scenarios and its own wording. Product-specific operational recommendations, legal conclusions, and vendor claims are not inferred from this reading material.

## Graph and assessment design

The course ID is `data-systems-foundations`. Skills use stable `ds-` IDs and seven explicitly named units. Their prerequisite relationships form a directed graph rather than simply requiring every earlier numbered chapter. For example, document modeling builds on relational identity; normalization uses both relational and document representations; replication depends on key-value storage and deployment trade-offs; serializable reasoning builds on isolation, lost updates, and relational relationships.

`ds-key-values` has the cross-course prerequisite `dictionaries` from Python foundations. This connection transfers the mapping between a key and its value into storage-system reasoning. The lesson then explains the additional requirements introduced by persistence. The complete combined catalog must be used when validating or recommending this course so the external prerequisite is visible.

All questions are choice or scenario questions. Each skill declares `requiredTypes: ['choice']` and `reviewAnswers: 2`. Mastery requires independent correct evidence for all four authored questions; due review requires two distinct independent answers. No code exercise or Python execution is invented for topics whose assessment is conceptual. Python is relevant only through the declared cross-course mapping prerequisite.

Examples declare `kind: 'text'` with a `Design scenario` label. Their stored scenario/decision fields follow the shared lesson-example contract and should be rendered as prose diagrams or decision sketches, with no Python label or execution control.

## Precision and limits

The questions preserve several important boundaries: averages do not describe all tail behavior; replicas do not replace recovery backups; snapshots do not automatically prevent all concurrency anomalies; quorum overlap is not a complete linearizability proof; hashing distinct keys does not guarantee balanced request rates; database transactions do not automatically roll back external effects. These boundaries are assessed directly rather than hidden in optional notes.

The course is a compact foundational path through the eight available chapters, not a certification of production engineering competence. Four finite questions per skill cannot cover every failure interleaving. Actual database isolation, durability, routing, and schema-evolution guarantees must still be checked in the relevant engine's documentation before implementation.
