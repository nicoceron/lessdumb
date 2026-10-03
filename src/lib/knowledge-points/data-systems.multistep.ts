import {
  choose,
  part,
  typeNumber,
  typeOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Data Systems (CEN-163). Small Python models stand in
// for storage engines and services; a part's code runs after the setup's.

export const multistepProblems: MultistepModule = {
  'ds-hotspots': [
    {
      title: 'Serve a celebrity’s profile',
      setup: {
        text: [
          'A social app hashes user IDs onto 8 shards, so each shard holds about as many users as the others. Of its 10,000 profile reads per second, 4,000 are for one celebrity; the other 6,000 spread evenly over all shards.',
        ],
      },
      parts: [
        part(
          'ds-partitioning-kp2',
          typeNumber(
            'A request for a user goes to shard `hash(id) % 8`. If `hash(id)` is 1203, which shard is that?',
            3,
            '$1203 = 150 \\times 8 + 3$, so the remainder, and the shard, is 3.',
          ),
        ),
        part(
          'ds-hash-range-kp2',
          choose(
            'Why does hashing spread users evenly over the shards?',
            [
              'A stable hash scatters neighbouring IDs to unrelated shards',
              'Each shard stores only the users created in its time range',
              'The hash keeps every user’s data on all eight shards',
              'Hashing sorts the IDs so each shard gets one contiguous run',
            ],
            0,
            'A good hash maps similar keys to unrelated values, so no range of IDs piles up on one shard, and the same ID always maps to the same shard.',
          ),
        ),
        part(
          'ds-hotspots-kp1',
          typeNumber(
            'How many reads per second reach the celebrity’s shard?',
            4750,
            'All 4,000 celebrity reads land on one shard, plus its even share of the rest: $4000 + 6000 / 8 = 4750$.',
          ),
        ),
        part(
          'ds-hotspots-kp2',
          choose(
            'The profile is read far more often than it is written. What relieves its shard?',
            [
              'Serve it from a cache or from extra read replicas',
              'Add shards so the profile’s key spreads more thinly',
              'Switch the whole app from hash to range partitioning',
              'Rehash every user ID with a different hash function',
            ],
            0,
            'Balanced keys do not mean balanced load: one key always lives on one shard, so more shards or another hash cannot split it. Copies of a read-mostly value can.',
          ),
        ),
      ],
    },
  ],
  'ds-rebalancing': [
    {
      title: 'Add a fourth node',
      setup: {
        text: [
          'A small store places 12 keys on its nodes with `key % N`, where N is the number of nodes. It is growing from 3 nodes to 4.',
        ],
        code: `keys = range(12)
before = {k: k % 3 for k in keys}
after = {k: k % 4 for k in keys}
moved = [k for k in keys if before[k] != after[k]]`,
      },
      parts: [
        part(
          'ds-partitioning-kp2',
          typeNumber(
            'Before the change, which node holds key 10?',
            1,
            '$10 \\bmod 3 = 1$.',
          ),
        ),
        part(
          'ds-rebalancing-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(len(moved))',
            '9',
            'Only keys 0, 1, and 2 have the same remainder modulo 3 and 4; the other 9 of 12 change node, far more than a fair share.',
          ),
        ),
        part(
          'ds-rebalancing-kp2',
          typeNumber(
            'Instead, the store keeps 12 fixed logical shards, 4 per node, and moves whole shards to the new node until all 4 nodes are even. How many shards move?',
            3,
            'Even means 3 shards per node, so each old node hands one shard to the new node: 3 moves, and every other key stays put.',
          ),
        ),
        part(
          'ds-rebalancing-kp3',
          choose(
            'Writes keep arriving while a shard is copied to the new node. What keeps them from being lost?',
            [
              'Replay the writes made during the copy, then switch ownership',
              'Pause all reads of the shard until the copy has finished',
              'Send each write to whichever of the two nodes answers first',
              'Delete the old copy first, before the new node starts serving it',
            ],
            0,
            'The old owner keeps serving while the copy runs; the writes it accepted meanwhile are applied to the new copy before ownership moves in one step.',
          ),
        ),
      ],
    },
  ],
  'ds-serializable': [
    {
      title: 'Keep a doctor on call',
      setup: {
        text: [
          'A hospital rule says at least one doctor must stay on call. Alice and Bob are both on call. At the same moment, each starts a transaction that counts the doctors on call, sees two, and takes themself off call.',
        ],
      },
      parts: [
        part(
          'ds-isolation-kp2',
          choose(
            'Under snapshot isolation, why does each transaction count two doctors?',
            [
              'Each reads a snapshot taken before either change committed',
              'Each reads the other’s change before it has committed',
              'The count is cached by the database and refreshed once a minute',
              'Snapshot isolation lets a transaction skip its reads',
            ],
            0,
            'A snapshot shows the data as committed when the transaction began, and neither change had committed yet.',
          ),
        ),
        part(
          'ds-serializable-kp1',
          choose(
            'Both transactions commit. What kind of anomaly is this?',
            [
              'Write skew: each changed a different row from a shared read',
              'A lost update: one transaction overwrote the other’s change to a row',
              'A dirty read: one saw the other’s uncommitted change',
              'None: each transaction’s check was true when it ran',
            ],
            0,
            'The two transactions wrote different rows, so no row was overwritten, but together they broke a rule that both had checked.',
          ),
        ),
        part(
          'ds-serializable-kp2',
          typeNumber(
            'How many doctors are on call after both commit?',
            0,
            'Each took only themself off call, and together that removes both.',
          ),
        ),
        part(
          'ds-serializable-kp2',
          typeNumber(
            'Under serializable isolation, at most how many of the two transactions can commit?',
            1,
            'In any serial order the second would count only one doctor and refuse, so a serializable database aborts one; it can retry and will then refuse.',
          ),
        ),
      ],
    },
  ],
  'ds-indexes': [
    {
      title: 'Speed up a customer’s order list',
      setup: {
        text: [
          'An `orders` table has 1,000,000 rows and the primary key `id`. A page of the B-tree holds 100 keys. The common query is `WHERE customer_id = ? ORDER BY created_at`.',
        ],
      },
      parts: [
        part(
          'ds-btrees-kp2',
          typeNumber(
            'With 100 keys per page, how many levels of pages does a B-tree need to reach any of 1,000,000 keys?',
            3,
            'Each level multiplies the reach by 100: $100^3 = 1000000$.',
          ),
        ),
        part(
          'ds-indexes-kp1',
          choose(
            'Without an index on `customer_id`, how does the database find one customer’s orders?',
            [
              'It scans every row and checks its customer',
              'It walks the primary key tree to the customer',
              'It reads only the newest page of the table',
              'It asks each customer row for its order IDs',
            ],
            0,
            'The primary key orders rows by `id`, which says nothing about the customer, so every row must be checked.',
          ),
        ),
        part(
          'ds-indexes-kp2',
          choose(
            'Which composite index serves the query best?',
            [
              '`(customer_id, created_at)`',
              '`(created_at, customer_id)`',
              '`(id, customer_id)`',
              '`(created_at)`',
            ],
            0,
            'Equality fields come first: the index jumps to the customer, whose entries are then already in `created_at` order.',
          ),
        ),
        part(
          'ds-key-values-kp3',
          choose(
            'What does the new index cost?',
            [
              'Each insert or change must also update the index',
              'Reads by primary key become slower than they were before',
              'The table can no longer have a primary key',
              'Queries that ignore the index stop working',
            ],
            0,
            'An index is a second copy of some data, kept in step with the table on every write.',
          ),
        ),
      ],
    },
  ],
  'ds-quorums': [
    {
      title: 'Tune five replicas',
      setup: {
        text: [
          'Each key is stored on N = 5 replicas. A write waits for W replicas to acknowledge it, and a read asks R replicas and keeps the newest value it sees.',
        ],
      },
      parts: [
        part(
          'ds-quorums-kp1',
          typeNumber(
            'With W = 3, what is the smallest R for which every read overlaps the latest write?',
            3,
            'Overlap needs $R + W > N$: $R + 3 > 5$, so $R = 3$.',
          ),
        ),
        part(
          'ds-quorums-kp2',
          typeNumber(
            'To make reads as cheap as R = 1 and keep that overlap, what must W be?',
            5,
            '$1 + W > 5$ means every replica must acknowledge each write.',
          ),
        ),
        part(
          'ds-replication-lag-kp1',
          typeNumber(
            'One replica has applied log entry 1180 while the leader is at entry 1250. How many entries behind is it?',
            70,
            '$1250 - 1180 = 70$ entries it has not applied yet.',
          ),
        ),
        part(
          'ds-conflicts-kp2',
          choose(
            'Two clients write the same key at once, and the store keeps the write with the later timestamp. What happens to the other write?',
            [
              'It is discarded without either client being told',
              'It is merged into the kept write field by field',
              'It is retried until both clients agree on a value',
              'It is kept as an older version the next read returns',
            ],
            0,
            'Last-write-wins resolves the conflict by throwing one write away; both clients saw their write acknowledged.',
          ),
        ),
      ],
    },
  ],
  'ds-lsm': [
    {
      title: 'Trace an LSM tree’s writes',
      setup: {
        text: [
          'A tiny log-structured store buffers writes in a memtable. When it holds two keys, it is written out as a sorted run and emptied. Reads check the memtable, then the runs from newest to oldest.',
        ],
        code: `memtable = {}
runs = []

def put(key, value):
    memtable[key] = value
    if len(memtable) == 2:
        runs.append(dict(sorted(memtable.items())))
        memtable.clear()

def get(key):
    if key in memtable:
        return memtable[key]
    for run in reversed(runs):
        if key in run:
            return run[key]
    return None

put("a", 1)
put("b", 2)
put("a", 3)
put("c", 4)
put("b", 5)`,
      },
      parts: [
        part(
          'ds-lsm-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(len(runs), memtable)',
            "2 {'b': 5}",
            'The memtable flushed after the second and fourth writes; the fifth write is still buffered.',
          ),
        ),
        part(
          'ds-lsm-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(get("a"), get("b"), get("d"))',
            '3 5 None',
            'The newest version wins: `"a"` is 3 in the newer run, `"b"` is 5 in the memtable, and `"d"` was never written.',
          ),
        ),
        part(
          'ds-lsm-kp3',
          typeNumber(
            'Compaction merges both runs into one, keeping only the newest value of each key. How many entries does the merged run have?',
            3,
            'The runs hold `a`, `b`, and `a`, `c`; merging keeps one entry per key: `a` (3), `b` (2), and `c` (4).',
          ),
        ),
        part(
          'ds-key-values-kp2',
          choose(
            'The memtable lives only in memory. What protects its writes if the process crashes before a flush?',
            [
              'Appending each write to a log on disk before applying it',
              'Flushing each run to disk in sorted key order, oldest first',
              'Searching the newest runs before the oldest',
              'Keeping at most two keys in the memtable',
            ],
            0,
            'A write-ahead log on disk lets a restart rebuild the memtable; the sorted runs only hold what was already flushed.',
          ),
        ),
      ],
    },
  ],
  'ds-dataflow': [
    {
      title: 'Retry a payment safely',
      setup: {
        text: [
          'A checkout service asks a payment service to charge a card. Each request carries an ID, and the payment service remembers the IDs it has processed.',
        ],
        code: `processed = {}

def charge(request_id, amount, balance):
    if request_id in processed:
        return balance
    processed[request_id] = amount
    return balance - amount

balance = 100
balance = charge("r1", 30, balance)
balance = charge("r1", 30, balance)
balance = charge("r2", 20, balance)`,
      },
      parts: [
        part(
          'ds-dataflow-kp1',
          choose(
            'Checkout must know the charge succeeded before showing the receipt. Which style fits?',
            [
              'Request and response: the caller waits for the result',
              'A message on a queue: send it and move on at once',
              'A nightly batch job that settles the day’s charges',
              'A broadcast event that every service may act on or ignore',
            ],
            0,
            'The next step depends on the outcome, so the caller needs an answer before it continues.',
          ),
        ),
        part(
          'ds-dataflow-kp2',
          choose(
            'A charge request times out. What does the checkout service know?',
            [
              'Nothing: the charge may or may not have happened',
              'The charge failed, so it is safe to charge again',
              'The charge succeeded, since no error came back',
              'The payment service has crashed and lost the charge',
            ],
            0,
            'A timeout only says no reply arrived; the request may have been applied with the reply lost on the way back.',
          ),
        ),
        part(
          'ds-dataflow-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(balance)',
            '50',
            'The retry of `"r1"` is recognized and changes nothing, so only 30 and 20 are charged.',
          ),
        ),
        part(
          'ds-deployment-kp1',
          choose(
            'Why does a lost reply not arise when checkout and payment run as one program?',
            [
              'A function call returns or raises; no network can drop it',
              'A single program never needs to charge the same card twice',
              'A single program processes requests faster than two',
              'Programs on one machine cannot fail in the middle',
            ],
            0,
            'Distribution adds a network between the parts, and with it partial failures such as a reply that never arrives.',
          ),
        ),
      ],
    },
  ],
};
