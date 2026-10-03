import { choose, predictOutput, type KnowledgePointModule } from './authoring';
import type { LessonExample } from '../curriculum';

/** A worked design scenario: the situation, the decision, and why. */
const scenario = (
  situation: string,
  decision: string,
  explanation: string,
): LessonExample => ({
  kind: 'text',
  label: 'Design scenario',
  code: situation,
  output: decision,
  explanation,
});

export const knowledgePoints: KnowledgePointModule = {
  'ds-workloads': [
    {
      title: 'Separate operational requests from analytical scans',
      explanation: [
        'An operational request does one small piece of work for one user: fetch order 1187, reserve seat 14B. It touches a handful of records found by key, and someone is waiting for the answer.',
        'An analytical query summarises many records to find a pattern, such as revenue per month over three years. It may read millions of rows, and nobody needs it within milliseconds. Classify by access pattern, not by which product or team sends the request.',
      ],
      example: scenario(
        'A bike-share app (1) unlocks bike 5521 for rider 88, and (2) each night computes the average trip length per station across all trips this year.',
        'Unlocking is operational: one bike, one rider, found by key, with the rider waiting. The nightly average is analytical: it scans a year of trips and summarises them by station.',
        'One product contains both workloads; how many records a request touches and how they are found decides the category.',
      ),
      questions: [
        choose(
          'A clinic system books an appointment for patient 4410 and also computes the no-show rate of every clinic over two years. Which request is analytical?',
          [
            'Booking the appointment for patient 4410',
            'Both, because both concern appointments',
            'The no-show rate of every clinic over two years',
            'Neither, because both use the same table',
          ],
          2,
          'The rate scans two years of appointments and summarises them; the booking touches one patient’s records.',
        ),
        choose(
          'Which request is operational?',
          [
            'Total refunds per country for 2025',
            'Change the delivery address on order 9902',
            'Median basket size across this quarter’s orders',
            'Top 20 products by revenue last year',
          ],
          1,
          'It changes one order found by its ID while a user waits; the others summarise many orders.',
        ),
        choose(
          'Support agents look at a dashboard that counts open tickets per team across 4 million tickets every hour. How should that query be classified?',
          [
            'Operational, because agents use it',
            'Operational, because it runs every hour',
            'Neither, because dashboards are not workloads',
            'Analytical, because it scans and summarises many tickets',
          ],
          3,
          'Who looks at the result does not matter; the query reads millions of tickets to produce counts.',
        ),
        choose(
          'A request reads one customer’s 12 most recent orders by customer ID. How should it be classified?',
          [
            'Operational: a small, key-based read for one user',
            'Analytical, because it returns 12 rows',
            'Analytical, because orders are historical data',
            'Neither, because reads are not workloads',
          ],
          0,
          'It touches a few records found through one customer’s key while that customer waits.',
        ),
      ],
    },
    {
      title: 'Describe a workload with numbers',
      explanation: [
        'A useful workload description names concrete operations and quantities: which keys are queried, how many requests per second arrive at peak, how much data each one touches, how often data is written, and how fast responses must be, such as “95% of lookups answered within 100 ms”.',
        'Vague goals such as “fast” or “scalable” cannot be tested. The read/write mix and the growth rate matter too: 500 reads/s with 5 writes/s calls for a different design than 50 reads/s with 400 writes/s.',
      ],
      example: scenario(
        'A draft says: “The ticketing service must be fast and handle lots of users.” Logs show, at peak, 1,200 seat lookups per second by event ID, 40 purchases per second, and 2 GB of new orders per month.',
        'Rewrite it as: look up seats by event ID at 1,200/s and accept 40 purchases/s at peak; answer 95% of lookups within 100 ms; data grows by 2 GB per month.',
        'Each number can now be checked in a load test, and the read-heavy mix and growth rate inform the design.',
      ),
      questions: [
        choose(
          'Which requirement can be checked with a load test?',
          [
            'The service should feel snappy',
            'Use a modern database',
            'Handle 300 orders per minute with 99% answered within 2 seconds',
            'Scale to any number of users',
          ],
          2,
          'It names an operation, a rate and a measurable response target.',
        ),
        choose(
          'What is missing from the requirement “fetch a product by ID at 2,000 requests per second”?',
          [
            'The database vendor',
            'How quickly a response must arrive',
            'The programming language',
            'The colour of the product page',
          ],
          1,
          'Without a response-time target, the service could meet the rate while every caller waits seconds.',
        ),
        choose(
          'A store holds 50 GB today and grows by 5 GB per month. If growth stays steady, how large is it in 2 years?',
          ['55 GB', '100 GB', '120 GB', '170 GB'],
          3,
          '24 months × 5 GB = 120 GB of growth, added to the 50 GB already stored.',
        ),
        choose(
          'A design assumed a read-heavy service, but logs show 900 reads/s and 900 writes/s at peak. What should happen?',
          [
            'Re-evaluate the design for the much higher write rate',
            'Nothing, because reads and writes cost the same',
            'Only plan for the combined 1,800 requests/s',
            'Ignore the reads, since writes dominate',
          ],
          0,
          'Writes stress storage differently from reads, so the assumption behind the design no longer holds.',
        ),
      ],
    },
    {
      title: 'Recognise several workloads in one product',
      explanation: [
        'One product usually contains several workloads, and a design tuned for one can hurt another: a nightly report scanning a whole table can slow the small, latency-sensitive requests that share its database.',
        'List each workload with its access pattern, rate and freshness need (how out of date its data may be). That shows whether they can share one system or should use separate copies.',
      ],
      example: scenario(
        'A food-delivery app places orders (40/s, by key, user waiting), records courier locations (2,000 small writes/s), and builds a weekly restaurant report that scans 6 months of orders and accepts data up to a day old.',
        'Treat them as three workloads: low-latency key writes, a high rate of small writes, and a broad scan that tolerates day-old data and can run on a separate copy.',
        'Averaging their numbers would hide that each needs something different from storage.',
      ),
      questions: [
        choose(
          'A weekly report scans every order on the same database that serves checkout. What risk should you check?',
          [
            'Checkout making the report less accurate',
            'The report deleting orders',
            'The scan competing with checkout for the same resources',
            'None, because reads cannot slow other requests',
          ],
          2,
          'A large scan uses disk, memory and CPU that latency-sensitive checkout requests also need.',
        ),
        choose(
          'A finance report may use data up to 24 hours old. What does that freshness need allow?',
          [
            'Running it on a copy refreshed every night',
            'Skipping half of the orders',
            'Writing its results into the checkout tables',
            'Ignoring refunds',
          ],
          0,
          'A day-old copy satisfies the report and keeps its scan away from live traffic.',
        ),
        choose(
          'Which pair are clearly different workloads within one music app?',
          [
            'Play song 381 for user 12; play song 382 for user 12',
            'Like a song; unlike a song',
            'Search for an artist; search for an album',
            'Play song 381 for user 12; count monthly plays per artist across all users',
          ],
          3,
          'One is a single key-based action; the other scans every play to summarise.',
        ),
        choose(
          'Why list each workload separately instead of averaging their numbers?',
          [
            'Averages are always zero',
            'An average hides that one workload needs fast key lookups and another broad scans',
            'Separate lists make the database faster',
            'Workloads cannot be measured',
          ],
          1,
          'Combining them produces a profile that matches none of the real access patterns.',
        ),
      ],
    },
  ],

  'ds-requirements': [
    {
      title: 'Separate throughput from response time',
      explanation: [
        'Throughput is completed work per unit of time, such as 1,200 requests per second: completed requests ÷ elapsed seconds. Response time is how long one request takes from the caller’s point of view, including time spent waiting in queues.',
        'They answer different questions. A system can complete many requests per second while some callers wait a long time.',
      ],
      example: scenario(
        'In 60 seconds a service completes 30,000 requests. Two sampled requests took 40 ms and 900 ms.',
        'Throughput is 30,000 ÷ 60 = 500 requests per second. The two response times describe individual requests: one caller waited more than 20 times longer than the other.',
        'A single throughput number says nothing about how long any particular caller waited.',
      ),
      questions: [
        predictOutput(
          'What does this program print?',
          'requests = 18000\nseconds = 60\nprint(requests / seconds)',
          ['300', '1080000', '300.0', '0.0033'],
          2,
          'Throughput divides completed requests by elapsed seconds, and / always gives a float.',
        ),
        choose(
          'Which is a response-time measurement?',
          [
            '450 orders completed per minute',
            'One checkout took 2.3 seconds',
            '12 GB stored',
            'Three servers in the cluster',
          ],
          1,
          'Response time is the elapsed time for one request.',
        ),
        choose(
          'A batch job processes 1 million records per hour, but during the job one user’s single lookup takes 8 seconds. Which statement is right?',
          [
            'Throughput is high, but that request’s response time is poor',
            'High throughput guarantees fast responses',
            'The slow lookup proves throughput is low',
            'They measure the same thing',
          ],
          0,
          'The system completes a lot of work overall while an individual caller still waits.',
        ),
        predictOutput(
          'Each number is the requests completed in one second. What does this program print?',
          'completed = [120, 180, 150]\ntotal = 0\nfor n in completed:\n    total = total + n\nprint(total / len(completed))',
          ['450', '180', '3', '150.0'],
          3,
          '450 requests over 3 seconds is an average throughput of 150 requests per second.',
        ),
      ],
    },
    {
      title: 'Read percentiles of response time',
      explanation: [
        'Sort the response times of many requests. The p95 (95th percentile) is the time that 95% of requests finish within; only the slowest 5% take longer. p50, the median, is the middle request, and p99 describes the slowest 1%.',
        'With 20 sorted times, 95% of 20 is 19, so p95 is the 19th time. The mean adds all times and divides by the count, so a few very slow requests are blurred into one number, while percentiles show the slow tail directly.',
      ],
      example: scenario(
        '20 sorted response times: ten of 20 ms, eight of 30 ms, then 400 ms and 2,000 ms.',
        'p50 is the 10th time, 20 ms; p95 is the 19th, 400 ms; p99 is the 20th, 2,000 ms. The mean, 2,840 ÷ 20 = 142 ms, matches no actual request.',
        'Most users waited 30 ms or less, but the percentiles reveal two very slow requests that the mean hides.',
      ),
      questions: [
        predictOutput(
          'times holds 10 sorted response times in ms. What does this program print?',
          'times = [12, 15, 15, 18, 20, 22, 25, 30, 90, 400]\nrank = 90 * len(times) // 100\nprint(times[rank - 1])',
          ['400', '90', '30', '64.7'],
          1,
          'p90 of 10 requests is the 9th sorted time, so 9 of the 10 finish within 90 ms. 64.7 is the mean.',
        ),
        predictOutput(
          'times holds 20 sorted response times in ms. What does this program print?',
          'times = [5, 5, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 15, 15, 16, 18, 20, 25, 300, 900]\nrank = 95 * len(times) // 100\nprint(times[rank - 1])',
          ['900', '25', '70.9', '300'],
          3,
          '95% of 20 is 19, so p95 is the 19th sorted time.',
        ),
        choose(
          'Service X has p50 of 40 ms and p99 of 3 s. Service Y has p50 of 60 ms and p99 of 150 ms. Which statement is right?',
          [
            'X is better for every user',
            'Their slowest requests are similar',
            'Y is slower for a typical request but far better for the slowest 1%',
            'p50 describes the slowest request',
          ],
          2,
          'p50 describes the typical request; p99 the slowest 1%, where X is 20 times worse.',
        ),
        choose(
          'A target says p95 ≤ 200 ms. Over 10,000 requests, 600 took longer than 200 ms. Is the target met?',
          [
            'No: 6% exceeded 200 ms, more than the 5% allowed',
            'Yes, because most requests were fast',
            'Yes, if the mean is below 200 ms',
            'It cannot be known without p50',
          ],
          0,
          'p95 ≤ 200 ms allows at most 500 of 10,000 requests to be slower than 200 ms.',
        ),
      ],
    },
    {
      title: 'State the load and the failure target',
      explanation: [
        'A response-time target means little without the load it must hold under: a service that is quick at 10 requests per second can queue badly at 1,000. Measure at the required peak, not on an idle system.',
        'Reliability targets distinguish faults from failures. A fault is one component misbehaving, such as a dead disk or a crashed process; a failure is the service as a whole not delivering what it promised. Fault-tolerant designs keep faults from becoming failures, and a target names which faults must be survived.',
      ],
      example: scenario(
        'A new search service answers in 30 ms when tested alone. Production peak is 800 requests/s. Requirement: p99 ≤ 250 ms at 800 requests/s, with no errors if any one server is lost.',
        'Load-test at 800 requests/s and measure p99; then shut down one server during the test and check that callers see no errors.',
        'The idle 30 ms says nothing about the peak, and the server shutdown tests that a fault does not become a failure.',
      ),
      questions: [
        choose(
          'A benchmark reports 25 ms at 5 requests/s. The requirement is p95 ≤ 100 ms at 2,000 requests/s. What does the benchmark establish?',
          [
            'The requirement is met',
            'The service will fail at 2,000 requests/s',
            'p95 is 25 ms at any load',
            'Nothing about behaviour at 2,000 requests/s',
          ],
          3,
          'Queueing and contention appear as load rises, so the target must be measured at the stated load.',
        ),
        choose(
          'One of three servers loses its disk, and users notice nothing. How is this classified?',
          [
            'A failure without a fault',
            'A fault that did not become a failure',
            'Neither a fault nor a failure',
            'A failure of the whole service',
          ],
          1,
          'A component broke (a fault), but the service kept its promise (no failure).',
        ),
        choose(
          'Which reliability requirement is testable?',
          [
            'Keep serving with no errors when any single server is shut down',
            'The system should never break',
            'Use reliable hardware',
            'Be as available as possible',
          ],
          0,
          'It names a specific fault to inject and a specific outcome to check.',
        ),
        choose(
          'As load rises toward a service’s capacity, what typically happens to response times?',
          [
            'They fall, because caches warm up',
            'They stay constant',
            'They rise as requests wait in queues',
            'They become equal to the throughput',
          ],
          2,
          'Near capacity, arriving requests wait behind others, adding queueing time.',
        ),
      ],
    },
  ],

  'ds-authority': [
    {
      title: 'Name the system of record',
      explanation: [
        'For each fact, decide which store holds the authoritative version: the system of record. When a cache, report or copy disagrees with it, the system of record wins, and the copy is corrected from it.',
        'Being faster or more convenient does not make a copy authoritative. Two stores that both accept edits to the same fact leave conflicts with no defined winner.',
      ],
      example: scenario(
        'The warehouse database says 4 units of SKU 77 are in stock; the product page cache says 9.',
        'The warehouse database is the system of record: show 4, refresh the cache from it, and find out why the cache went stale.',
        'Naming the authority turns a disagreement into a repair task instead of a debate.',
      ),
      questions: [
        choose(
          'A dashboard shows 1,204 members; the membership database, the system of record, has 1,198 active rows. What should happen?',
          [
            'Update the database to 1,204',
            'Correct or rebuild the dashboard from the database',
            'Show the average, 1,201',
            'Trust whichever was updated most recently',
          ],
          1,
          'The copy is repaired from the authority, never the other way round.',
        ),
        choose(
          'Which store is most likely a system of record?',
          [
            'A nightly report of yesterday’s sales',
            'A search index of product descriptions',
            'A cache of the home page',
            'The payments ledger where each charge is first recorded',
          ],
          3,
          'The ledger is where the fact originates; the others are built from other data.',
        ),
        choose(
          'Why name the system of record before building copies?',
          [
            'So disagreements have a defined resolution',
            'So copies can never disagree',
            'So the copies can be deleted',
            'So every read goes to the slowest store',
          ],
          0,
          'Copies can still drift; the authority says which value to trust and repair from.',
        ),
        choose(
          'Customer emails are stored in both the CRM and the billing system, and both teams edit them. What is the problem?',
          [
            'None, because two copies are safer',
            'Billing becomes faster',
            'Two stores claim authority, so conflicting edits have no winner',
            'The CRM becomes a cache',
          ],
          2,
          'Without one authority, an email changed in each place has no correct value.',
        ),
      ],
    },
    {
      title: 'Recognise data that can be rebuilt',
      explanation: [
        'Derived data is computed from other data: a cache, a search index, a report, a precomputed total. If it is lost, re-running the transformation over the source rebuilds it, so rebuilding needs both the source facts and the transformation logic.',
        'If the source no longer contains the needed detail, for example only daily totals were kept, a view that needs per-hour detail can no longer be rebuilt.',
      ],
      example: scenario(
        'A search index built from 50,000 articles is corrupted. The articles table and the indexing job are intact.',
        'Rebuild the index by re-running the indexing job over the articles table; nothing authoritative was lost.',
        'The index is derived, so its loss costs time, not facts.',
      ),
      questions: [
        choose(
          'Which is derived data?',
          [
            'A signed contract as uploaded',
            'Customers’ submitted addresses',
            'A sensor’s raw readings',
            'Monthly revenue totals computed from orders',
          ],
          3,
          'The totals are computed from the orders and can be recomputed from them.',
        ),
        choose(
          'After 30 days the orders store keeps only daily totals. A new report needs last year’s hourly sales. Can it be derived?',
          [
            'Yes, by dividing each daily total by 24',
            'No, because the hourly detail no longer exists in the source',
            'Yes, from the report’s name',
            'Yes, but only for weekdays',
          ],
          1,
          'Derivation can only use what the source still contains; even division would invent the hourly pattern.',
        ),
        choose(
          'A recommendations table is deleted, but the click log and the recommendation code remain. What is lost?',
          [
            'Nothing permanent; it can be recomputed',
            'All click history',
            'The ability to recommend ever again',
            'The recommendation code',
          ],
          0,
          'The source (clicks) and transformation (code) survive, so the table can be rebuilt.',
        ),
        choose(
          'What must survive to rebuild a lost derived view?',
          [
            'Its file name and size',
            'Only the view’s last backup',
            'The source data and the transformation',
            'The cache and the index',
          ],
          2,
          'Rebuilding re-runs the transformation over the source.',
        ),
      ],
    },
    {
      title: 'Weigh the cost of keeping copies in sync',
      explanation: [
        'Derived copies make some reads cheap: a dashboard reads one stored number instead of counting a million rows. But every change to the source must now also reach the copy.',
        'Plan how changes propagate, how stale the copy may be, and how to repair it when an update is missed; recomputing from the source is the usual repair.',
      ],
      example: scenario(
        'A stored attendance total is incremented on every registration. A bug skipped 30 increments last week.',
        'Recompute the total from the registrations table to repair it, then fix the update path.',
        'The copy saved work on reads but needed a repair plan, which the source makes possible.',
      ),
      questions: [
        choose(
          'What does keeping a precomputed total trade?',
          [
            'Slower reads for cheaper updates',
            'Cheaper reads for extra update and repair work',
            'Accuracy for disk space only',
            'Nothing; it is free',
          ],
          1,
          'Reads get cheaper, while each source change must also update the copy.',
        ),
        choose(
          'A follower count is cached and refreshed every 5 minutes. A user follows an account and immediately sees the old count. What is this?',
          [
            'Data loss',
            'A corrupted system of record',
            'A failed write',
            'Expected staleness within the stated refresh window',
          ],
          3,
          'The cache has not refreshed yet; the follow itself is safely recorded.',
        ),
        choose(
          'A stored total says 980, but counting the source rows gives 1,010. How should the copy be repaired?',
          [
            'Recompute the total from the source rows',
            'Edit the source to 980',
            'Add 30 to every future total',
            'Delete the source rows',
          ],
          0,
          'The source is authoritative, so the copy is recomputed from it.',
        ),
        choose(
          'Before adding a third derived copy of product prices, what should be planned?',
          [
            'Its colour scheme',
            'Removing the system of record',
            'How price changes reach it and how stale it may be',
            'Nothing, since copies do not drift',
          ],
          2,
          'Each copy needs an update path and a staleness budget.',
        ),
      ],
    },
  ],

  'ds-deployment': [
    {
      title: 'See what distribution adds',
      explanation: [
        'A distributed system runs as processes on several machines that communicate over a network. It can add capacity, keep data near users, or survive the loss of a machine.',
        'It also adds partial failure: one node can be down or unreachable while others work, and a message can be delayed or lost without the sender knowing which. Distribution is a response to a requirement, not a default.',
      ],
      example: scenario(
        'Node A sends a write to node B and gets no reply within 2 seconds.',
        'A cannot tell whether B is down, the request was lost, B processed it and the reply was lost, or B is just slow. The design must handle every case.',
        'On one machine a function call either returns or the whole program stops; over a network the outcome can be unknown.',
      ),
      questions: [
        choose(
          'Node A gets no response from node B. Which conclusion is justified?',
          [
            'B has crashed',
            'B never received the request',
            'The network is permanently broken',
            'A does not know whether B received or processed the request',
          ],
          3,
          'Several different failures produce the same silence.',
        ),
        choose(
          'Which problem exists for a three-node system but not for a program on one machine?',
          [
            'Variables can change value',
            'One part can fail while the others keep running',
            'Disks can fill up',
            'Code can contain bugs',
          ],
          1,
          'Partial failure is specific to independent machines connected by a network.',
        ),
        choose(
          'What should justify moving a service from one server to several?',
          [
            'A measured requirement one server cannot meet',
            'Distributed systems being more modern',
            'More machines always being faster',
            'Avoiding the need for backups',
          ],
          0,
          'Distribution brings coordination costs, so it needs a concrete reason.',
        ),
        choose(
          'A request to a remote node usually takes 2 ms but sometimes 3 seconds. What must a distributed design assume?',
          [
            'Delays are bounded at 2 ms',
            'Slow messages are always lost',
            'Messages may be delayed unpredictably',
            'Delays only happen under maintenance',
          ],
          2,
          'Networks give no upper bound on delay, so timeouts and retries must expect it.',
        ),
      ],
    },
    {
      title: 'Start simple when it meets the requirements',
      explanation: [
        'A single-node system avoids network coordination entirely. It is a sound choice when its measured capacity covers peak load with headroom and its recovery plan, such as restoring tested backups, fits within the downtime the service can accept.',
        'Managed services take over operating work such as hardware and patching, but the owner still decides data modelling, access control and recovery expectations.',
      ],
      example: scenario(
        'A club directory has 8,000 members, peaks at 20 requests/s, and may be offline for up to 2 hours. One server handles 500 requests/s, and a tested restore takes 40 minutes.',
        'Use a single node with tested backups: capacity is 25 times the peak and recovery fits within the 2-hour tolerance.',
        'Both requirements are met, so extra nodes would add coordination without solving a real limitation.',
      ),
      questions: [
        choose(
          'One server handles 400 requests/s. Peak load is 350 and growing 50% per year. What follows?',
          [
            'One server is enough indefinitely',
            'Peak load does not matter',
            'Distribution was needed from the start',
            'Headroom runs out within a year, so plan more capacity',
          ],
          3,
          'Peak will reach 525 requests/s next year, beyond the server’s 400.',
        ),
        choose(
          'A service may be down at most 15 minutes, and restoring from backup takes 3 hours. Is a single node with backups enough?',
          [
            'Yes, because backups exist',
            'No, because recovery takes longer than the allowed downtime',
            'Yes, if the server is fast',
            'Only during weekdays',
          ],
          1,
          'Backups protect data, but the recovery time breaks the availability requirement.',
        ),
        choose(
          'Peak load is 30 requests/s, capacity 600 requests/s, restore time 20 minutes, allowed downtime 4 hours. Which design fits?',
          [
            'A single node with tested backups',
            'A five-node cluster',
            'Two data centres',
            'A different node per user',
          ],
          0,
          'Capacity and recovery both have wide margins, so the simplest design meets the requirements.',
        ),
        choose(
          'A team moves to a managed database service. What stays their responsibility?',
          [
            'Replacing failed disks',
            'Installing operating-system patches',
            'Data modelling, access control and recovery expectations',
            'Nothing at all',
          ],
          2,
          'The provider runs the infrastructure; the meaning and protection of the data stay with the owner.',
        ),
      ],
    },
    {
      title: 'Tell replicas apart from backups',
      explanation: [
        'A replica is a live copy of the data on another node, kept up to date as changes happen. It helps when a node dies. But every change is copied, including mistakes: a wrong deletion reaches every replica within seconds.',
        'A backup is a copy from a past point in time, kept separately. Recovering from a logical mistake, such as a bad delete or a buggy migration, needs a backup taken before the mistake.',
      ],
      example: scenario(
        'At 14:00 a script wrongly deletes 3,000 orders. Two live replicas apply the deletes by 14:01. The last backup was taken at 02:00.',
        'The replicas cannot help; they lost the orders too. Restore the 3,000 orders from the 02:00 backup, then reapply legitimate changes made since.',
        'Replicas protect against losing a machine; backups protect against losing correct data.',
      ),
      questions: [
        choose(
          'A node’s disk fails at 09:00. Which protection lets the service continue quickly?',
          [
            'Last month’s backup only',
            'A longer timeout',
            'Deleting the node',
            'A live replica',
          ],
          3,
          'An up-to-date replica can take over immediately; a restore takes time and loses recent changes.',
        ),
        choose(
          'A buggy migration corrupts a column at 10:00, and replication copies the corruption everywhere. What can restore the correct values?',
          [
            'Any live replica',
            'A backup taken before 10:00',
            'Restarting the database',
            'Adding another replica',
          ],
          1,
          'Only a copy from before the mistake still holds the correct values.',
        ),
        choose(
          'Why are three replicas not a backup strategy?',
          [
            'They copy mistakes as well as good changes',
            'Replicas cannot store data',
            'Replicas are always out of date',
            'Replicas are slower than backups',
          ],
          0,
          'Replication faithfully spreads logical errors to every live copy.',
        ),
        choose(
          'Backups run daily at 00:00. A mistake at 23:00 is found at 23:30. Without other records, what may be lost when restoring the 00:00 backup?',
          [
            'Nothing',
            'Only the 30 minutes after the mistake',
            'About 23 hours of legitimate changes made since the backup',
            'Every earlier backup',
          ],
          2,
          'Restoring returns to midnight, discarding the day’s valid changes along with the mistake.',
        ),
      ],
    },
  ],

  'ds-relational': [
    {
      title: 'Identify rows with primary keys',
      explanation: [
        'A relational model stores facts in tables of rows with named columns. A primary key is a column, or set of columns, whose value is unique per row and stable over time, so it identifies exactly one row.',
        'Names, emails and phone numbers can change or be shared, so they make poor keys; they are attributes of the row, not its identity.',
      ],
      example: scenario(
        'A members table has two rows named Sam Lee with different emails, and one Sam later changes email.',
        'Give each member a member_id assigned once. Name and email become ordinary columns.',
        'The ID keeps identifying the same person while every descriptive field is free to change.',
      ),
      questions: [
        choose(
          'Which column makes the best primary key for a students table?',
          [
            'full_name',
            'email',
            'date_of_birth',
            'student_id, assigned once at enrolment',
          ],
          3,
          'Names and birthdays repeat, and emails change; an assigned ID is unique and stable.',
        ),
        choose(
          'Two rows have primary key 1042. What has gone wrong?',
          [
            'Nothing, because keys may repeat',
            'The key no longer identifies one row',
            'The table has too many rows',
            'The two rows must be identical',
          ],
          1,
          'A primary key exists precisely to pick out a single row.',
        ),
        choose(
          'Why is a phone number a risky primary key for customers?',
          [
            'Customers change numbers, and old numbers get reassigned',
            'It is too long',
            'It contains digits',
            'Databases cannot store phone numbers',
          ],
          0,
          'A key must stay attached to one customer; phone numbers move between people.',
        ),
        choose(
          'Order lines use the composite key (order_id, line_no). Which pair of rows is allowed?',
          [
            '(7, 1) and (7, 1)',
            '(7, 1) twice with different products',
            '(7, 1) and (7, 2)',
            'Two rows with no order_id',
          ],
          2,
          'Together the two columns must be unique; order 7 can have lines 1 and 2.',
        ),
      ],
    },
    {
      title: 'Reference rows with foreign keys and joins',
      explanation: [
        'A foreign key is a column that holds another table’s primary key: orders.customer_id refers to customers.customer_id. A reference to a row that does not exist is broken, and databases can reject such writes.',
        'A join combines rows whose keys match, so a query can show each order with its customer’s name without storing the name in every order.',
      ],
      example: scenario(
        'customers: (1, Ana), (2, Ben). orders: (101, customer 2), (102, customer 1), (103, customer 2). Join orders to customers on the customer ID.',
        'The result has three rows: 101 Ben, 102 Ana, 103 Ben.',
        'Each order finds its one customer; Ben’s name is stored once but appears twice in the result.',
      ),
      questions: [
        choose(
          'orders: (501, customer 3), (502, customer 3), (503, customer 9). customers: (3, Lin), (9, Max). How many rows does joining orders to customers on the customer ID give?',
          ['2', '6', '5', '3'],
          3,
          'Each of the three orders matches exactly one customer.',
        ),
        choose(
          'Which column in an orders table is a foreign key?',
          ['order_id', 'total', 'customer_id', 'created_at'],
          2,
          'It holds the primary key of a row in another table.',
        ),
        choose(
          'An order refers to customer 77, but no customer 77 exists. What is this?',
          [
            'A broken reference',
            'A composite key',
            'A successful join',
            'A primary key',
          ],
          0,
          'The foreign key points at a row that is not there, so a join finds no customer.',
        ),
        choose(
          'Why store customer_id in orders instead of the customer’s name?',
          [
            'IDs are shorter to type',
            'The name can change or repeat; the ID identifies one customer',
            'Joins only work on numbers',
            'Names cannot be stored in tables',
          ],
          1,
          'The reference must stay correct when names change and must not be ambiguous.',
        ),
      ],
    },
    {
      title: 'Model many-to-many with a linking table',
      explanation: [
        'When each A relates to many Bs and each B to many As, such as students and courses, neither table can hold the relationship in one column. A linking table stores one row per pair: enrolments(student_id, course_id).',
        'Its row count equals the number of relationships, not the number of students or courses, and queries join through it in either direction.',
      ],
      example: scenario(
        'Ana takes Math and Art, Ben takes Math, and Cy takes Art, Math and Music.',
        'enrolments has 6 rows, one per student-course pair: (Ana, Math), (Ana, Art), (Ben, Math), (Cy, Art), (Cy, Math), (Cy, Music).',
        'Neither students nor courses gain repeated or list-valued columns.',
      ),
      questions: [
        choose(
          'A clinic has 4 doctors and 10 patients, and each patient sees 2 different doctors. How many rows does visits(doctor_id, patient_id) hold?',
          ['14', '20', '10', '40'],
          1,
          'There is one row per doctor-patient pair: 10 patients × 2 doctors each.',
        ),
        choose(
          'Articles have many tags, and each tag is used by many articles. Which design represents that?',
          [
            'A tags column holding "news,sport"',
            'A tag_id column in articles',
            'An article_id column in tags',
            'An article_tags table with article_id and tag_id',
          ],
          3,
          'Only a linking table lets both sides have many partners.',
        ),
        choose(
          'Knowing only Ben’s name, you want the names of the courses he takes. Which tables does the query join?',
          [
            'students only',
            'courses only',
            'students, enrolments and courses',
            'enrolments only',
          ],
          2,
          'students gives Ben’s ID, enrolments his course IDs, and courses their names.',
        ),
        choose(
          'Why not store a comma-separated list of course names in each student row?',
          [
            'Course lists inside text cannot be joined, counted or renamed consistently',
            'It would make every query faster',
            'Commas are not allowed in databases',
            'Students would need two IDs',
          ],
          0,
          'Relationships hidden in text lose keys, so the database cannot query or protect them.',
        ),
      ],
    },
  ],

  'ds-documents': [
    {
      title: 'Keep a private tree together',
      explanation: [
        'A document stores one record with nested fields and lists, such as a form with its questions and their options. When the application almost always loads and saves the whole tree at once, one document means one read instead of joins across several tables.',
        'Flexible structure does not mean no structure: readers still expect certain fields, so the checks move into application code.',
      ],
      example: scenario(
        'A form builder: each form has 5–40 questions, each with options. Forms are always opened, edited and saved as a whole, and questions are never shared between forms.',
        'Store each form as one document with nested questions and options.',
        'The data is private to its form and always travels as a unit, which is exactly what a document represents.',
      ),
      questions: [
        choose(
          'Which data suits a single nested document best?',
          [
            'Products referenced by thousands of orders',
            'Users who follow each other',
            'A blog post with its own ordered list of paragraphs',
            'A list of countries shared by every address',
          ],
          2,
          'The paragraphs belong to one post and are read with it; the others are shared or interconnected.',
        ),
        choose(
          'An invoice is always shown with its 1–20 lines, and lines never exist without their invoice. What does embedding the lines give?',
          [
            'Lines can be shared between invoices',
            'One read loads the invoice and its lines together',
            'Lines become authoritative for product prices',
            'Invoices can no longer change',
          ],
          1,
          'Data that is always read together is fetched in one step.',
        ),
        choose(
          'A team picks documents because “our data has no schema”. What is wrong with that reasoning?',
          [
            'Their code still expects field names and types, so the schema lives in the readers',
            'Document databases cannot store text',
            'Relational databases have no schema either',
            'Nothing is wrong',
          ],
          0,
          'Every reader assumes a shape; flexibility only moves where it is checked.',
        ),
        choose(
          'A profile is usually read without its 50,000 activity events, which keep growing. Should the events be embedded in the profile document?',
          [
            'Yes, related data should always be embedded',
            'Yes, because the events are private',
            'No, because documents cannot hold lists',
            'No; they are large, unbounded and not read with the profile',
          ],
          3,
          'Embedding helps only when data is read together; here it would bloat every profile read.',
        ),
      ],
    },
    {
      title: 'Reference shared or independent items',
      explanation: [
        'Embedding copies data into each document. If the same fact, such as an author’s bio or a supplier’s address, is embedded in many documents, every change must update every copy.',
        'Items that are shared, have their own identity, or are queried on their own are better stored once and referenced by ID. Positions in an embedded list are not stable identities: removing one item shifts the rest.',
      ],
      example: scenario(
        '1,200 article documents each embed their author’s name and bio, and an author updates the bio.',
        'Store authors separately and keep author_id in each article, so the bio changes in one place.',
        'The author is shared by many articles, so embedding turned one fact into 1,200 copies.',
      ),
      questions: [
        choose(
          '300 documents embed the same supplier address, and the supplier moves. How many writes keep the documents consistent?',
          ['1', '2', '0', '300'],
          3,
          'Each embedded copy is a separate thing to update.',
        ),
        choose(
          'Comments must be linked from notifications and moderation reports. What should each comment have?',
          [
            'Only its position in the post’s comment list',
            'A copy in every notification',
            'A stable ID of its own',
            'No identity',
          ],
          2,
          'Independent references need an identity that does not depend on where the item sits.',
        ),
        choose(
          'Notifications refer to comments by position: “comment #3 of post 9”. Comment #2 is deleted. What happens?',
          [
            'Notifications now point to the wrong comments',
            'Nothing changes',
            'All comments are deleted',
            'The positions update in every notification',
          ],
          0,
          'Later comments shift down, so #3 now names what used to be #4.',
        ),
        choose(
          'Which item should an order document reference rather than embed?',
          [
            'The shipping address entered for this order',
            'The product catalogue entry shared by all orders',
            'The quantities of the order’s lines',
            'The order’s notes',
          ],
          1,
          'The catalogue entry is shared and changes independently; the others belong to this order.',
        ),
      ],
    },
    {
      title: 'Choose by the queries, not the product category',
      explanation: [
        'Document and relational are modelling choices, and many databases support both; relational databases often store JSON columns. Decide from the required queries.',
        'Reading one tree at a time favours embedding. Joining across entities, many-to-many relationships and updating shared facts favour references.',
      ],
      example: scenario(
        'Recipes app requirements: show one recipe with its steps (very common); find all recipes using an ingredient (common); rename an ingredient everywhere (rare).',
        'Embed the steps in each recipe, and reference ingredients by ID.',
        'Steps travel with their recipe; ingredients are shared, searched across recipes and renamed in one place.',
      ),
      questions: [
        choose(
          'Which requirement pushes toward references rather than embedding?',
          [
            'Show one order with its lines',
            'Save a draft as one unit',
            'Find every order containing product P',
            'Load a user’s settings page',
          ],
          2,
          'Querying across documents by a shared item works best when that item is referenced.',
        ),
        choose(
          'Courses and students are many-to-many and queried in both directions. Which model handles that most naturally?',
          [
            'Separate entities linked by references or a linking table',
            'Embed students inside each course document',
            'One document for the whole school',
            'Embed courses in students and students in courses',
          ],
          0,
          'Embedding either side duplicates the other and makes one direction of query awkward.',
        ),
        choose(
          'A shop always shows a product with its 3–5 photos and caption text, which belong only to that product. What fits?',
          [
            'A separate photos table joined on every read',
            'A shared photo library referenced by all products',
            'One document per photo',
            'Embed the photos in the product document',
          ],
          3,
          'Private data that is always read with its parent is a natural embedding.',
        ),
        choose(
          'Why can a relational database also be a reasonable home for nested data?',
          [
            'JSON is always relational',
            'Many relational databases support document-style columns',
            'Nested data cannot be stored anywhere else',
            'Joins require nested data',
          ],
          1,
          'The model and the product are separate choices.',
        ),
      ],
    },
  ],

  'ds-normalization': [
    {
      title: 'Store each changing fact once',
      explanation: [
        'Normalisation puts each independently changing fact in one authoritative place and refers to it by key. An organizer’s name lives in organizers, and workshops store organizer_id, so a rename changes one row.',
        'Not every repeated value is a duplicated fact: the price a customer actually paid belongs to that order and must not change when the catalogue price does.',
      ],
      example: scenario(
        'A workshops table stores organizer_name on 400 rows, and the organizer “City Lab” renames itself “Civic Lab”.',
        'Normalised, the rename changes one row in organizers. In the current design, 400 rows must change, and missing one leaves the copies disagreeing.',
        'Keeping the fact once makes the update a single, complete change.',
      ),
      questions: [
        choose(
          'A products table repeats the category name “Garden” on 2,000 rows, and the category is renamed. How many rows change in a normalised design with a categories table?',
          ['2,000', '0', '2,001', '1'],
          3,
          'Products refer to the category by ID, so only the categories row changes.',
        ),
        choose(
          'Which design is normalised?',
          [
            'orders store customer_name and customer_email',
            'customers store a list of their order totals',
            'orders store customer_id; customers store name and email',
            'every table stores every column it might need',
          ],
          2,
          'Customer details live once in customers and are referenced from orders.',
        ),
        choose(
          'What does normalisation primarily protect against?',
          [
            'Copies of one fact disagreeing after an update',
            'Slow networks',
            'Running out of disk space',
            'Too many concurrent users',
          ],
          0,
          'With a single authoritative copy, there is nothing to disagree with.',
        ),
        choose(
          'Which value should be copied onto each order rather than referenced?',
          [
            'The customer’s current email',
            'The price the customer actually paid',
            'The product’s current description',
            'The category’s current name',
          ],
          1,
          'The paid price is a historical fact of that order; referencing the live price would rewrite history.',
        ),
      ],
    },
    {
      title: 'Recognise update anomalies',
      explanation: [
        'When a fact is copied into many rows, an update that changes only some copies leaves them disagreeing: an update anomaly. Reads then give different answers depending on which row they hit.',
        'Needing to change many rows to update one fact is the warning sign of duplication.',
      ],
      example: scenario(
        'Supplier North Mill’s phone number is stored on 3 product rows. A script updated 2 of them before crashing.',
        'Two rows show the new number and one the old: an update anomaly. Fix the data from the authoritative source, then store the phone once on a suppliers table.',
        'The crash exposed a design that needed several writes to change one fact.',
      ),
      questions: [
        choose(
          'Course rows store the teacher’s office. After a move, 5 of 8 rows were updated. What do readers see?',
          [
            'The same office everywhere',
            'An error until the update finishes',
            'Different offices depending on which course they read',
            'No office at all',
          ],
          2,
          'Partially updated copies disagree, so the answer depends on the row.',
        ),
        choose(
          'Which design cannot have this anomaly for the teacher’s office?',
          [
            'The office stored on every course row',
            'The office stored in two tables',
            'The office stored on every enrolment',
            'The office stored once in teachers, with courses holding teacher_id',
          ],
          3,
          'One copy cannot disagree with itself.',
        ),
        choose(
          'After a partial update, two rows show different addresses for customer 12. What is this?',
          ['An update anomaly', 'A join', 'A foreign key', 'A primary key'],
          0,
          'Copies of one fact disagree because only some were changed.',
        ),
        choose(
          'Which observation suggests a fact is duplicated?',
          [
            'A query returns one row',
            'Updating one fact requires changing many rows',
            'A table has a primary key',
            'A row has many columns',
          ],
          1,
          'If one real-world change touches many rows, the fact lives in many places.',
        ),
      ],
    },
    {
      title: 'Denormalise deliberately',
      explanation: [
        'Denormalising stores a copy on purpose to make a known read cheaper, such as keeping organizer_name on each workshop card to avoid a join on a very busy page.',
        'The copy is derived data, so it needs an update path or periodic rebuild, a freshness expectation, and a repair plan. The real question is which consistency work the workload can afford for its read speed.',
      ],
      example: scenario(
        'The homepage shows 50 workshop cards 2,000 times per minute; organizers rename themselves about twice a year.',
        'A display copy of organizer_name is reasonable if a rename job updates every copy and a check can rebuild them from organizers.',
        'Reads vastly outnumber changes, and the rare change has a defined path.',
      ),
      questions: [
        choose(
          'When is a denormalised copy most justified?',
          [
            'When the fact changes every second and is rarely read',
            'Whenever a query uses a join',
            'When there is no system of record',
            'When it is read very often, changes rarely, and has an update path',
          ],
          3,
          'The read savings must outweigh the cost of keeping copies current.',
        ),
        choose(
          'A team copies product prices into the search index to avoid lookups. What must they also build?',
          [
            'A way to propagate price changes to the index',
            'Nothing, because copies stay current',
            'A second price table',
            'A rule forbidding price changes',
          ],
          0,
          'Without propagation the index shows stale prices.',
        ),
        choose(
          'A denormalised order_count on customers has drifted from the real number of orders. What is the authoritative fix?',
          [
            'Trust order_count',
            'Average the two numbers',
            'Recount from the orders table',
            'Delete the orders',
          ],
          2,
          'The orders are the source; the count is derived from them.',
        ),
        choose(
          'Which question decides between normalising and denormalising a field?',
          [
            'Is duplication always bad?',
            'Which consistency work can the workload afford for the read speed it needs?',
            'Which approach is more modern?',
            'Which uses fewer tables?',
          ],
          1,
          'Both are trade-offs; the workload’s reads and changes decide.',
        ),
      ],
    },
  ],

  'ds-graphs': [
    {
      title: 'Model entities as nodes and relationships as edges',
      explanation: [
        'A graph has nodes, which are entities such as people, airports or skills, and edges, which are relationships such as follows, flies to, or is a prerequisite of.',
        'Edges can have a direction, a type, and properties such as a distance or a date. Direction matters when a relationship is not mutual.',
      ],
      example: scenario(
        'Flights: LIM→BOG, BOG→MIA, LIM→MIA, MIA→JFK.',
        'Four airports are nodes and four directed edges are flights. JFK has one incoming edge and no outgoing edges.',
        'Each edge’s direction says where a flight departs and arrives.',
      ),
      questions: [
        choose(
          'In a social network where users follow each other, what are the edges?',
          ['Users', 'Profile photos', 'Follow relationships', 'Usernames'],
          2,
          'Users are nodes; a follow connects two of them.',
        ),
        choose(
          'Edges: A→B, A→C, B→C, C→D. How many edges leave A?',
          ['1', '3', '4', '2'],
          3,
          'A→B and A→C start at A; the others start elsewhere.',
        ),
        choose(
          'Why does direction matter for “follows” but not for “is married to”?',
          [
            'Following need not be mutual, while marriage is symmetric',
            'Marriage involves more nodes',
            'Follows edges have no type',
            'Direction never matters in graphs',
          ],
          0,
          'If A follows B, B may not follow A; marriage holds both ways.',
        ),
        choose(
          'A road graph records each road’s length in kilometres. Where does the length belong?',
          [
            'In a separate node per road',
            'As a property of the road’s edge',
            'In each town’s name',
            'Nowhere, because graphs hold no numbers',
          ],
          1,
          'The length describes the connection between two towns, so it is an edge property.',
        ),
      ],
    },
    {
      title: 'Follow edges to answer path questions',
      explanation: [
        'A traversal starts at a node and repeatedly follows edges of chosen types and directions. “What can I reach in two hops?” and “what does this skill depend on, directly or indirectly?” are traversals.',
        'Cycles mean a traversal must remember the nodes it has visited, or it can loop forever.',
      ],
      example: scenario(
        'Prerequisite edges, where X→Y means X comes before Y: Counting→Addition, Addition→Multiplication, Addition→Fractions. What does Multiplication depend on, directly or indirectly?',
        'Follow incoming edges backwards: Addition, then Counting.',
        'Dependencies are reached by walking edges against their direction.',
      ),
      questions: [
        choose(
          'Edges: A→B, B→C, C→D, B→E. Starting at A and following edges forward, which nodes are reachable?',
          ['B only', 'B and C', 'C, D and E', 'B, C, D and E'],
          3,
          'A reaches B, B reaches C and E, and C reaches D.',
        ),
        choose(
          'X→Y means X is a prerequisite of Y. How do you find everything Y depends on?',
          [
            'Follow Y’s outgoing edges',
            'Follow incoming edges backwards from Y, repeatedly',
            'Read Y’s properties only',
            'Follow every edge in the graph',
          ],
          1,
          'Prerequisites point into Y, so you walk backwards along incoming edges.',
        ),
        choose(
          'A friendship graph has the cycle Ana–Ben–Cy–Ana. Why must a traversal track visited nodes?',
          [
            'To avoid looping around the cycle forever',
            'To sort the names',
            'Because cycles delete edges',
            'It need not',
          ],
          0,
          'Without memory, the walk returns to Ana and starts again.',
        ),
        choose(
          'Flights: LIM→BOG, BOG→MIA, MIA→JFK, LIM→MIA. What is the fewest number of flights from LIM to JFK?',
          ['1', '3', '2', '4'],
          2,
          'LIM→MIA→JFK takes two flights; the route through BOG takes three.',
        ),
      ],
    },
    {
      title: 'Separate the graph model from the database',
      explanation: [
        'Graph-shaped data can live in a dedicated graph database or in ordinary tables: nodes(id, …) and edges(from_id, to_id, type). Each extra hop then becomes one more join on the edges table.',
        'Choose storage by how deep and how frequent the traversals are, not by the shape of a diagram.',
      ],
      example: scenario(
        'edges(from_id, to_id) stores follows. Query: accounts followed by the accounts Ana follows.',
        'Join edges to itself once: Ana’s follows, then their follows. Two hops, two uses of the edges table.',
        'A relational database answers shallow graph questions with ordinary joins.',
      ),
      questions: [
        choose(
          'Can a relational database store a graph?',
          [
            'No, edges require a graph database',
            'Only undirected graphs',
            'Yes, as a nodes table and an edges table',
            'Only graphs with fewer than 100 nodes',
          ],
          2,
          'An edge is a row holding two node IDs.',
        ),
        choose(
          'How many uses of an edges(from_id, to_id) table does “friends of friends of Ana” need?',
          ['1', '2', '3', '0'],
          1,
          'One hop finds Ana’s friends and a second hop finds theirs.',
        ),
        choose(
          'When does a dedicated graph database become attractive?',
          [
            'When the data fits on one machine',
            'When there are any relationships at all',
            'When there are no relationships',
            'When queries routinely follow many hops of varying depth',
          ],
          3,
          'Deep, variable-length traversals are awkward as fixed chains of joins.',
        ),
        choose(
          'Which question is NOT naturally a traversal?',
          [
            'What is the email of user 52?',
            'Is there a route from A to Z?',
            'Who are the friends of Ana’s friends?',
            'Which skills depend on Fractions indirectly?',
          ],
          0,
          'It reads one record by key; the others follow relationships.',
        ),
      ],
    },
  ],
};
