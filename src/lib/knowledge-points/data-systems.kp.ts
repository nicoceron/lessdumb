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
            'Both, because both requests touch appointments',
            'Computing each clinic’s two-year no-show rate',
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
            'Analytical, because past orders are historical data',
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
            'The checkout page should feel snappy to every shopper',
            'Use a modern, well-supported database',
            'Handle 300 orders/min with 99% answered within 2 s',
            'Scale to any number of users as the shop grows',
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
            'Only plan capacity for the combined 1,800 requests/s',
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
            'Like song 381 for user 12; unlike it an hour later',
            'Search for an artist by name; search for an album by name',
            'Play song 381 for user 12; count monthly plays per artist',
          ],
          3,
          'One is a single key-based action; the other scans every play to summarise.',
        ),
        choose(
          'Why list each workload separately instead of averaging their numbers?',
          [
            'Averages are only valid when all workloads share a rate',
            'An average describes none of the real access patterns',
            'Separate lists make the shared database run faster',
            'Workloads with different rates cannot be measured together',
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
            'Throughput is high while that lookup’s response is slow',
            'High throughput guarantees fast responses for every user',
            'The 8-second lookup proves the job’s throughput is low',
            'Throughput and response time measure the same thing',
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
            'X is better for every user, since its p50 is lower',
            'Y is faster for a typical request; X for the slowest 1%',
            'Y is slower at p50 but far better for the slowest 1%',
            'p50 describes each service’s slowest request',
          ],
          2,
          'p50 describes the typical request; p99 the slowest 1%, where X is 20 times worse.',
        ),
        choose(
          'A target says p95 ≤ 200 ms. Over 10,000 requests, 600 took longer than 200 ms. Is the target met?',
          [
            'No: 6% exceeded 200 ms, more than the 5% allowed',
            'Yes, because 94% of requests finished within 200 ms',
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
            'p95 stays at 25 ms at any load the service sees',
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
            'Neither a fault nor a failure, since users noticed nothing',
            'A failure of the whole service',
          ],
          1,
          'A component broke (a fault), but the service kept its promise (no failure).',
        ),
        choose(
          'Which reliability requirement is testable?',
          [
            'No errors when any one server is shut down',
            'The system should never break under any circumstances',
            'Use reliable, enterprise-grade hardware for every server',
            'Be as available as possible during peak hours',
          ],
          0,
          'It names a specific fault to inject and a specific outcome to check.',
        ),
        choose(
          'As load rises toward a service’s capacity, what typically happens to response times?',
          [
            'They fall, because caches warm up under load',
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
            'Trust whichever of the two was updated most recently',
          ],
          1,
          'The copy is repaired from the authority, never the other way round.',
        ),
        choose(
          'Which store is most likely a system of record?',
          [
            'A nightly report of yesterday’s sales',
            'The search index that every product query hits first',
            'A cache of the home page',
            'The ledger where each charge is first recorded',
          ],
          3,
          'The ledger is where the fact originates; the others are built from other data.',
        ),
        choose(
          'Why name the system of record before building copies?',
          [
            'So disagreements have a defined resolution',
            'So copies can never disagree with one another',
            'So the copies can be deleted',
            'So every read goes to the slowest store',
          ],
          0,
          'Copies can still drift; the authority says which value to trust and repair from.',
        ),
        choose(
          'Customer emails are stored in both the CRM and the billing system, and both teams edit them. What is the problem?',
          [
            'None, because two editable copies are safer than one',
            'Billing becomes faster',
            'Conflicting edits have no defined winner',
            'The CRM silently becomes a cache of billing',
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
            'Customers’ submitted shipping addresses',
            'A sensor’s raw temperature readings',
            'Monthly revenue totals per store',
          ],
          3,
          'The totals are computed from the orders and can be recomputed from them.',
        ),
        choose(
          'After 30 days the orders store keeps only daily totals. A new report needs last year’s hourly sales. Can it be derived?',
          [
            'Yes, by dividing each daily total by 24',
            'No, the hourly detail is gone from the source',
            'Yes, by re-running the report over the daily totals',
            'Yes, but only for weekdays',
          ],
          1,
          'Derivation can only use what the source still contains; even division would invent the hourly pattern.',
        ),
        choose(
          'A recommendations table is deleted, but the click log and the recommendation code remain. What is lost?',
          [
            'Nothing permanent; it can be recomputed',
            'The click history the table was built from',
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
            'Only the view’s own most recent backup',
            'The source data and the transformation',
            'The cache and search index built on it',
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
            'Slower reads for cheaper, simpler updates',
            'Cheaper reads for update and repair work',
            'Accuracy for disk space only',
            'Nothing; it is free',
          ],
          1,
          'Reads get cheaper, while each source change must also update the copy.',
        ),
        choose(
          'A follower count is cached and refreshed every 5 minutes. A user follows an account and immediately sees the old count. What is this?',
          [
            'Data loss: the follow was dropped before being stored',
            'A corrupted system of record',
            'A failed write',
            'Expected staleness within the refresh window',
          ],
          3,
          'The cache has not refreshed yet; the follow itself is safely recorded.',
        ),
        choose(
          'A stored total says 980, but counting the source rows gives 1,010. How should the copy be repaired?',
          [
            'Recompute the total from the source rows',
            'Edit the source rows until they total 980',
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
            'Which copy becomes the new system of record',
            'Its update path and how stale it may be',
            'Nothing, since derived copies do not drift',
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
            'B crashed before it could process the request',
            'The request was lost before B received it',
            'The network is permanently broken',
            'A cannot tell what happened to the request',
          ],
          3,
          'Several different failures produce the same silence.',
        ),
        choose(
          'Which problem exists for a three-node system but not for a program on one machine?',
          [
            'Variables can change value',
            'One node can fail while others keep running',
            'Disks can fill up',
            'Code can contain bugs that crash the whole program',
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
            'Avoiding the need for backups once data is copied',
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
            'Delays only happen during planned maintenance',
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
            'One server is enough, since 400 exceeds 350',
            'Peak load does not matter',
            'Distribution was needed from the start',
            'Headroom runs out within a year',
          ],
          3,
          'Peak will reach 525 requests/s next year, beyond the server’s 400.',
        ),
        choose(
          'A service may be down at most 15 minutes, and restoring from backup takes 3 hours. Is a single node with backups enough?',
          [
            'Yes, because the backups protect all of the data',
            'No, recovery exceeds the allowed downtime',
            'Yes, if the server is fast enough at peak',
            'Only during weekdays',
          ],
          1,
          'Backups protect data, but the recovery time breaks the availability requirement.',
        ),
        choose(
          'Peak load is 30 requests/s, capacity 600 requests/s, restore time 20 minutes, allowed downtime 4 hours. Which design fits?',
          [
            'A single node with tested backups',
            'A five-node cluster with automatic failover',
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
            'Installing operating-system and database engine patches',
            'Data modelling, access control and recovery goals',
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
            'The most up-to-date live replica',
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
            'Replicas lag too far behind to restore from',
            'Replicas are slower than backups',
          ],
          0,
          'Replication faithfully spreads logical errors to every live copy.',
        ),
        choose(
          'Backups run daily at 00:00. A mistake at 23:00 is found at 23:30. Without other records, what may be lost when restoring the 00:00 backup?',
          [
            'Nothing',
            'Only the 30 minutes between mistake and discovery',
            'About 23 hours of valid changes',
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
          ['full_name', 'email', 'date_of_birth', 'student_id'],
          3,
          'Names and birthdays repeat, and emails change; an assigned ID is unique and stable.',
        ),
        choose(
          'Two rows have primary key 1042. What has gone wrong?',
          [
            'Nothing, because keys may repeat',
            'The key no longer identifies one row',
            'The table has too many rows',
            'The two rows must hold identical values',
          ],
          1,
          'A primary key exists precisely to pick out a single row.',
        ),
        choose(
          'Why is a phone number a risky primary key for customers?',
          [
            'Numbers change and get reassigned to others',
            'It is too long',
            'It contains digits',
            'Databases cannot store numbers with leading zeros',
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
            'Names change or repeat; the ID does not',
            'Joins only work on numeric columns, not on text',
            'Names cannot be stored in two tables at once',
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
            'A tags column in articles holding "news,sport"',
            'A tag_id column in articles',
            'An article_id column in tags',
            'An article_tags table of (article_id, tag_id)',
          ],
          3,
          'Only a linking table lets both sides have many partners.',
        ),
        choose(
          'Knowing only Ben’s name, you want the names of the courses he takes. Which tables does the query join?',
          [
            'students joined directly to courses',
            'students and enrolments only',
            'students, enrolments and courses',
            'enrolments only, filtered by name',
          ],
          2,
          'students gives Ben’s ID, enrolments his course IDs, and courses their names.',
        ),
        choose(
          'Why not store a comma-separated list of course names in each student row?',
          [
            'They cannot be joined, counted or renamed reliably',
            'Each student row would grow too large to be read quickly',
            'Commas are not allowed inside database text columns',
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
            'Products referenced by thousands of different orders',
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
            'Their code still expects certain fields and types',
            'Document databases cannot store text',
            'Relational databases have no schema either',
            'Nothing; schemaless data needs no checks in code either',
          ],
          0,
          'Every reader assumes a shape; flexibility only moves where it is checked.',
        ),
        choose(
          'A profile is usually read without its 50,000 activity events, which keep growing. Should the events be embedded in the profile document?',
          [
            'Yes, related data should always be embedded',
            'Yes, because the events are private to this user',
            'No, because documents cannot hold lists',
            'No; they are unbounded and not read with it',
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
          ['1', '301', '0', '300'],
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
            'Save a whole draft as one unit in a single write',
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
            'orders store customer_id, customer_name and customer_email',
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
            'Copies of one fact disagreeing',
            'Slow networks between app and database',
            'Running out of disk space',
            'Too many concurrent users on one table',
          ],
          0,
          'With a single authoritative copy, there is nothing to disagree with.',
        ),
        choose(
          'Which value should be copied onto each order rather than referenced?',
          [
            'The customer’s current email',
            'The price the customer actually paid',
            'The product’s current catalogue description',
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
            'The new office everywhere, since most rows changed',
            'An error until the update finishes',
            'Different offices for different courses',
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
            'The office stored once, in teachers',
          ],
          3,
          'One copy cannot disagree with itself.',
        ),
        choose(
          'After a partial update, two rows show different addresses for customer 12. What is this?',
          [
            'An update anomaly',
            'A join',
            'A broken foreign key',
            'A primary key',
          ],
          0,
          'Copies of one fact disagree because only some were changed.',
        ),
        choose(
          'Which observation suggests a fact is duplicated?',
          [
            'A query returns one row',
            'Changing one fact means editing many rows',
            'A table has a primary key',
            'A query needs a join to show the customer’s name',
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
            'Trust order_count and fix the orders table',
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
            'Is duplicating a fact always worse than adding another join?',
            'What consistency work can it afford for its read speed?',
            'Which approach is more modern?',
            'Which design needs the fewest joins on every query?',
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
          [
            'Users',
            'Users and their profiles',
            'Follow relationships',
            'Usernames',
          ],
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
            'Following can be one-way; marriage is mutual',
            'Marriage edges carry more properties, such as a date',
            'Follows edges have no type, so they need a direction',
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
          ['B only', 'A, B, C, D and E', 'C, D and E', 'B, C, D and E'],
          3,
          'A reaches B, B reaches C and E, and C reaches D.',
        ),
        choose(
          'X→Y means X is a prerequisite of Y. How do you find everything Y depends on?',
          [
            'Follow Y’s outgoing edges, then theirs, repeatedly',
            'Walk incoming edges backwards from Y',
            'Read Y’s properties only',
            'Follow every edge in the graph',
          ],
          1,
          'Prerequisites point into Y, so you walk backwards along incoming edges.',
        ),
        choose(
          'A friendship graph has the cycle Ana–Ben–Cy–Ana. Why must a traversal track visited nodes?',
          [
            'To avoid circling the cycle forever',
            'To return the friends in alphabetical order',
            'Because cycles delete edges',
            'It need not, since friendships are mutual',
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
            'No, edges require a dedicated graph database',
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
            'When there are any relationships between entities',
            'When there are no relationships',
            'When queries follow many hops of varying depth',
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
  'ds-key-values': [
    {
      title: 'Look values up by key',
      explanation: [
        'A key-value store maps each key to a value, like a Python dictionary: putting a value stores it under a key, getting a key returns its value, and putting to an existing key replaces the old value.',
        'A point lookup asks for one known key. It should find the value directly, without examining other records.',
      ],
      example: {
        code: 'store = {}\nstore["w-17"] = "Data workshop"\nstore["w-18"] = "SQL basics"\nstore["w-17"] = "Data workshop (full)"\nprint(store["w-17"])\nprint(len(store))',
        output: 'Data workshop (full)\n2',
        explanation:
          'The second put to w-17 replaces its value instead of adding a third entry, so the store still holds two keys.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'store = {"u1": "Ana", "u2": "Ben"}\nstore["u2"] = "Bo"\nprint(store["u2"])\nprint(len(store))',
          ['Ben\n2', 'Bo\n3', 'Ben\n3', 'Bo\n2'],
          3,
          'Assigning to an existing key replaces its value; the number of keys stays 2.',
        ),
        predictOutput(
          'What does this program print?',
          'store = {"a": 1}\nprint(store.get("b", "missing"))',
          ['None', 'missing', 'KeyError', '1'],
          1,
          'get returns the default when the key is absent, instead of raising an error.',
        ),
        choose(
          'Which request is a point lookup?',
          [
            'Fetch the value under key order-552',
            'Count every key in the store',
            'Average all stored values',
            'List every key between a-100 and a-200',
          ],
          0,
          'It asks for one known key; the others examine many records.',
        ),
        choose(
          'A client writes a value under a key that already exists. What does a key-value store do?',
          [
            'Keeps both values under the key',
            'Rejects the write',
            'Replaces the old value',
            'Creates a second key with the same name',
          ],
          2,
          'Each key maps to one value, so a new write replaces the old one.',
        ),
      ],
    },
    {
      title: 'Make the data survive a restart',
      explanation: [
        'A dictionary lives in a process’s memory; when the process stops, its contents are gone. A durable store writes each change to disk before confirming it, often by appending it to a log file.',
        'On restart, the store rebuilds its map by replaying the log from the beginning. Later entries for a key overwrite earlier ones, so the replay ends with each key’s latest value.',
      ],
      example: {
        code: 'log = [{"key": "w-17", "value": "draft"}, {"key": "w-18", "value": "open"}, {"key": "w-17", "value": "full"}]\nstore = {}\nfor entry in log:\n    store[entry["key"]] = entry["value"]\nprint(store)',
        output: "{'w-17': 'full', 'w-18': 'open'}",
        explanation:
          'The log holds three writes in order. Replaying them leaves w-17 with its last value, full.',
      },
      questions: [
        predictOutput(
          'This program replays a log of writes. What does it print?',
          'log = [{"key": "a", "value": 1}, {"key": "b", "value": 2}, {"key": "a", "value": 3}, {"key": "c", "value": 4}]\nstore = {}\nfor entry in log:\n    store[entry["key"]] = entry["value"]\nprint(store["a"])\nprint(len(store))',
          ['1\n4', '3\n4', '1\n3', '3\n3'],
          3,
          'a is written twice, and the later value 3 wins; there are three distinct keys.',
        ),
        predictOutput(
          'This program replays a log of writes. What does it print?',
          'log = [{"key": "x", "value": 5}, {"key": "x", "value": 6}, {"key": "x", "value": 7}]\nstore = {}\nfor entry in log:\n    store[entry["key"]] = entry["value"]\nprint(store)',
          ["{'x': 5}", "{'x': [5, 6, 7]}", "{'x': 7}", "{'x': 18}"],
          2,
          'Each replayed write replaces the previous value, so only the last one remains.',
        ),
        choose(
          'A cache process restarts and all its entries are gone. Why is that acceptable for a cache but not for a system of record?',
          [
            'Only the cache can be rebuilt from another source',
            'Caches restart faster, so they refill before anyone notices',
            'Systems of record are smaller',
            'Systems of record never restart',
          ],
          0,
          'Losing derived data costs time; losing authoritative data loses facts.',
        ),
        choose(
          'A store confirms a write, and only afterwards saves it to disk. It crashes in between. What happens to that write?',
          [
            'It is saved twice',
            'It is lost even though it was confirmed',
            'It is recovered from memory when the store restarts',
            'Nothing, because confirmation saves it',
          ],
          1,
          'Durability requires saving before confirming; otherwise a crash loses acknowledged work.',
        ),
      ],
    },
    {
      title: 'Pay for indexes on writes',
      explanation: [
        'Without an index, finding records by anything other than how they are stored means scanning every record. An index is an extra structure that maps a lookup value to where the matching records live, so that lookup becomes fast.',
        'Every write must also update each index it affects, and each index takes space. Point lookups, range queries and writes have different needs, so describe them separately before adding indexes.',
      ],
      example: scenario(
        'Orders are stored by order_id. Support staff search by email 5,000 times a day across 1 million orders, and 200 new orders arrive per minute.',
        'Add an index on email: each search stops scanning a million orders, at the cost of updating the index on each of the 200 writes per minute and some extra disk space.',
        'The frequent search justifies the write and space cost here; a rarely used index would not.',
      ),
      questions: [
        choose(
          'A table has 3 indexes. One new row is inserted. How many index structures must also be updated?',
          ['0', '1', '4', '3'],
          3,
          'Each index must include the new row, in addition to the table itself.',
        ),
        choose(
          'With no index on email, how many of 2 million records might a lookup by email examine?',
          [
            'Exactly 1',
            'Up to all 2 million',
            'About 21, using a binary search',
            'Exactly half',
          ],
          1,
          'Without an access path, the store has to check records one by one.',
        ),
        choose(
          'A log table receives 50,000 inserts per second and is searched once a day. Why might several extra indexes hurt?',
          [
            'Every insert must also update each index',
            'Indexes would slow down the once-a-day search',
            'Indexes delete old rows',
            'They cannot hurt',
          ],
          0,
          'At that write rate, index maintenance multiplies the work for a rare benefit.',
        ),
        choose(
          'Records are stored by id. Which request needs a different access path from “get record by id”?',
          [
            'Get records 42, 43 and 44',
            'Update record 42’s status',
            'Records created 1–7 May',
            'Delete record 42',
          ],
          2,
          'It selects by creation date over a range, not by the stored key.',
        ),
      ],
    },
  ],

  'ds-lsm': [
    {
      title: 'Buffer writes and flush sorted runs',
      explanation: [
        'A log-structured (LSM) store collects writes in a sorted table in memory, the memtable. When it reaches its size limit, it is written to disk as an immutable sorted file called a run, and a fresh memtable starts.',
        'Writes are fast because nothing on disk is overwritten in place; an update just writes a newer version. Each write is also appended to a log on disk, so a crash before a flush can be recovered by replaying it.',
      ],
      example: {
        code: 'memtable_limit = 4\nwrites = 10\nflushed_runs = writes // memtable_limit\nin_memory = writes % memtable_limit\nprint(flushed_runs, in_memory)',
        output: '2 2',
        explanation:
          'Ten writes fill the memtable twice, producing two runs on disk, and two writes wait in the current memtable.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'memtable_limit = 1000\nwrites = 4500\nprint(writes // memtable_limit, writes % memtable_limit)',
          ['4.5 0', '5 500', '4 500', '4 0'],
          2,
          'Four full memtables have been flushed, and 500 writes remain in memory.',
        ),
        choose(
          'Why are writes to an LSM store typically fast?',
          [
            'They skip the disk until the memtable is flushed',
            'They update every file in place, in sorted order',
            'They append instead of overwriting in place',
            'They store no data until read',
          ],
          2,
          'Sequential appends and in-memory sorting avoid scattered in-place disk updates.',
        ),
        choose(
          'A key is updated three times before the memtable is flushed. What does the memtable hold for it?',
          [
            'Only the latest value',
            'All three values',
            'The oldest value',
            'Nothing until the flush',
          ],
          0,
          'The memtable is a map from key to its current value.',
        ),
        choose(
          'The process crashes while unflushed writes sit in the memtable. What recovers them?',
          [
            'Compaction',
            'Replaying the log on disk',
            'Reading the sorted runs',
            'Nothing; they are always lost',
          ],
          1,
          'Every write was appended to the log before it was confirmed.',
        ),
      ],
    },
    {
      title: 'Read the newest version',
      explanation: [
        'Because updates write new versions, a key can appear in several runs. A read checks the memtable first, then the runs from newest to oldest, and the first version it finds wins.',
        'A deletion is written as a special marker, a tombstone, that hides older versions until compaction removes them. Looking up a key that does not exist is costly: every run must be checked before giving up.',
      ],
      example: {
        code: 'runs = [{"a": 1, "b": 2}, {"a": 5}, {"c": 9}]\nkey = "a"\nvalue = None\nfor run in runs:\n    if key in run:\n        value = run[key]\nprint(value)',
        output: '5',
        explanation:
          'runs is listed from oldest to newest. Scanning in that order lets each newer version overwrite the older one, so the newest value of a wins.',
      },
      questions: [
        predictOutput(
          'runs is listed from oldest to newest. What does this program print?',
          'runs = [{"x": 1}, {"y": 2}, {"x": 3, "y": 4}]\nkey = "y"\nvalue = None\nfor run in runs:\n    if key in run:\n        value = run[key]\nprint(value)',
          ['2', 'None', '6', '4'],
          3,
          'The newest run holds y = 4, which replaces the older 2.',
        ),
        predictOutput(
          'runs is listed from oldest to newest. What does this program print?',
          'runs = [{"k": "old"}, {"j": "new"}]\nkey = "k"\nvalue = None\nfor run in runs:\n    if key in run:\n        value = run[key]\nprint(value)',
          ['new', 'old', 'None', 'KeyError'],
          1,
          'Only the oldest run contains k, so its value is still the current one.',
        ),
        predictOutput(
          'runs is listed from oldest to newest, and "DELETED" is a tombstone. What does this program print?',
          'runs = [{"p": 10}, {"p": "DELETED"}]\nkey = "p"\nvalue = None\nfor run in runs:\n    if key in run:\n        value = run[key]\nprint(value)',
          ['DELETED', '10', 'None', '[10, DELETED]'],
          0,
          'The tombstone is the newest version, so the read sees the deletion, not the old 10.',
        ),
        choose(
          'Why can looking up a key that was never written cost more than looking up one in the memtable?',
          [
            'Missing keys are stored twice',
            'The memtable is kept on disk, not in memory',
            'Every run must be checked to rule it out',
            'Missing keys force the memtable to be flushed first',
          ],
          2,
          'A found key can stop early; an absent key has to be ruled out everywhere.',
        ),
      ],
    },
    {
      title: 'Compact runs and count write amplification',
      explanation: [
        'Compaction merges runs in the background, keeping only the newest version of each key and dropping tombstoned keys, so reads check fewer files and disk space is reclaimed.',
        'The cost is I/O: data is rewritten every time it is compacted. Write amplification is the bytes physically written divided by the bytes the application wrote, and it limits how fast the application can write.',
      ],
      example: {
        code: 'app_writes_gb = 100\nlog_gb = 100\nflush_gb = 100\ncompaction_gb = 3 * 100\ndisk_writes_gb = log_gb + flush_gb + compaction_gb\nprint(disk_writes_gb / app_writes_gb)',
        output: '5.0',
        explanation:
          'Each gigabyte is written to the log, flushed once, and rewritten by three compactions, so the disk writes five times what the application wrote.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'app_writes_gb = 50\ndisk_writes_gb = 400\nprint(disk_writes_gb / app_writes_gb)',
          ['0.125', '8.0', '350', '450'],
          1,
          'Write amplification divides physical writes by logical writes.',
        ),
        choose(
          'Runs hold a = 1 (oldest), a = 4 (newer), b = 2, and the newest run holds a tombstone for b. After a full compaction, what remains?',
          [
            'a = 4 only',
            'a = 1, a = 4 and b = 2',
            'a = 4 and b = 2',
            'Nothing',
          ],
          0,
          'Only the newest version of a survives, and b is deleted, so its tombstone and old value go.',
        ),
        choose(
          'What does compaction trade?',
          [
            'Durability of old versions for faster writes',
            'Background I/O for faster reads and less space',
            'Fewer disk writes in exchange for slower reads',
            'Nothing; it is free',
          ],
          1,
          'Merging rewrites data, which costs I/O but simplifies later reads.',
        ),
        choose(
          'A disk sustains 500 MB/s of writes and write amplification is 10. Roughly what application write rate can it absorb?',
          ['5,000 MB/s', '500 MB/s', '10 MB/s', '50 MB/s'],
          3,
          'Each application megabyte costs 10 megabytes of disk writes: 500 ÷ 10.',
        ),
      ],
    },
  ],

  'ds-btrees': [
    {
      title: 'Find a key by walking pages',
      explanation: [
        'A B-tree stores keys in fixed-size pages arranged as a balanced tree. Each internal page holds sorted boundary keys and pointers to child pages; leaf pages hold the keys’ entries.',
        'A lookup starts at the root page and, at each level, follows the child whose key range contains the key. Because neighbouring keys sit in neighbouring leaves, a range query reads one stretch of leaves.',
      ],
      example: scenario(
        'Root page boundaries: [m]. Keys below m go to page L, others to page R. Page L has boundaries [c, h] and three children: below c, c up to h, and h or above. Look up the key k.',
        'k is below m, so go to L; k is at least h, so take L’s third child, a leaf, and read k’s entry there.',
        'Each level narrows the search to one child, so the lookup reads one page per level.',
      ),
      questions: [
        choose(
          'A root page has boundaries [100, 200] and children for keys below 100, 100–199, and 200 or above. Which child does a lookup for 150 follow?',
          ['The first', 'All three', 'The third', 'The second'],
          3,
          '150 is at least 100 and below 200.',
        ),
        choose(
          'A B-tree has 3 levels. How many pages does a point lookup read?',
          ['1', '3', 'Every page', '2'],
          1,
          'One page per level, from the root down to a leaf.',
        ),
        choose(
          'What do internal B-tree pages contain?',
          [
            'Boundary keys and child pointers',
            'Every key’s full entry, sorted by key',
            'Only the newest writes, waiting to be flushed',
            'Unsorted copies of the keys',
          ],
          0,
          'They route a lookup toward the right child.',
        ),
        choose(
          'Why does a B-tree serve range queries such as keys 300–350 well?',
          [
            'Each range is cached separately after its first read',
            'Range queries skip the root and start at a leaf',
            'Keys in a range sit in adjacent leaves',
            'Sorting removes duplicates',
          ],
          2,
          'Sorted leaves let the query find the start and read forward.',
        ),
      ],
    },
    {
      title: 'Keep the tree shallow with high fan-out',
      explanation: [
        'Each page can point to hundreds of children; this branching factor is the fan-out. With fan-out b, a tree of depth d reaches up to b ** d leaf pages, so depth grows very slowly as data grows.',
        'Large pages hold more keys, which raises fan-out and keeps lookups to a few page reads even for billions of keys.',
      ],
      example: {
        code: 'fanout = 500\ndepth = 4\nprint(fanout ** depth)',
        output: '62500000000',
        explanation:
          'Four levels of 500-way pages address 62.5 billion leaves, so a lookup reads only four pages.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fanout = 100\ndepth = 3\nprint(fanout ** depth)',
          ['300', '10000', '1000000', '100000000'],
          2,
          '100 × 100 × 100 leaves are reachable in three levels.',
        ),
        predictOutput(
          'What does this program print?',
          'fanout = 200\nprint(fanout ** 2)\nprint(fanout ** 3)',
          ['400\n600', '40000\n80000', '4000\n8000000', '40000\n8000000'],
          3,
          'Each extra level multiplies the reachable leaves by 200.',
        ),
        choose(
          'With fan-out 200, two levels reach 40,000 leaves and three levels reach 8,000,000. A table needs 5,000,000 leaf pages. How many page reads does a lookup need?',
          ['2', '3', '5', '200'],
          1,
          'Two levels are not enough, and three cover 8 million leaves.',
        ),
        choose(
          'Why do B-trees use pages of several kilobytes rather than one key per page?',
          [
            'More keys per page mean fewer levels to read',
            'Large pages rarely fill up, so splits are avoided',
            'Disks require one key per page',
            'It removes the need for a root page',
          ],
          0,
          'Higher fan-out means a shallower tree and fewer page reads per lookup.',
        ),
      ],
    },
    {
      title: 'Split pages and recover from crashes',
      explanation: [
        'B-trees update pages in place. When an insert hits a full page, the page splits into two half-full pages and the parent gains a new boundary key and pointer: a change spanning several pages.',
        'A crash halfway through could leave a page that nothing points to, or a pointer to a page that was never written. Engines therefore record each intended change in a write-ahead log (WAL) on disk first, and replay it on restart.',
      ],
      example: scenario(
        'A full leaf page holds keys 10–40, and key 25 is inserted.',
        'Split the leaf into [10–20] and [25–40], add boundary 25 to the parent, and write the whole change to the WAL before touching the pages.',
        'If the machine stops mid-split, the WAL says how to finish or undo it.',
      ),
      questions: [
        choose(
          'What happens when an insert targets a full leaf page?',
          [
            'The insert is rejected',
            'The page splits and the parent gets a new key',
            'The whole tree is rebuilt with larger pages',
            'The key goes to an overflow page at the end of the file',
          ],
          1,
          'Splitting makes room while keeping keys sorted and the tree balanced.',
        ),
        choose(
          'A crash happens after a new leaf page is written but before its parent is updated. What lets the engine repair this on restart?',
          [
            'Nothing; the orphaned page is simply lost',
            'Adding a second root',
            'Replaying the write-ahead log',
            'Deleting the parent page',
          ],
          2,
          'The WAL recorded the full split, so it can be completed or undone.',
        ),
        choose(
          'Why is a page split riskier than changing a value inside one page?',
          [
            'Several pages must change together',
            'It changes no pages',
            'It always takes longer than a full table scan',
            'It deletes the old page before writing the new ones',
          ],
          0,
          'An interruption between the page writes leaves the tree inconsistent.',
        ),
        choose(
          'How do a B-tree and an LSM store differ in handling an update to an existing key?',
          [
            'Both only append new files',
            'Both overwrite the key in place',
            'LSM overwrites in place; B-tree writes a new version',
            'B-tree overwrites in place; LSM writes a new version',
          ],
          3,
          'B-trees modify pages; LSM stores leave old runs untouched and add newer versions.',
        ),
      ],
    },
  ],

  'ds-indexes': [
    {
      title: 'Add a secondary index for another lookup field',
      explanation: [
        'Rows are usually located by primary key. A secondary index is an extra sorted structure on another column, such as city or email, that maps each value to the keys of the matching rows, so queries on that column avoid a full scan.',
        'Unlike a primary key, a secondary index’s values can repeat: many rows can share a city. An index helps most when a value selects few rows.',
      ],
      example: scenario(
        'events(event_id primary key, city, starts_at). A frequent query asks for events in Quito.',
        'Add an index on city: the lookup finds the Quito entries, then fetches those rows by event_id.',
        'The index gives a second path into the same rows without changing how they are stored.',
      ),
      questions: [
        choose(
          'Which query benefits from a secondary index on email?',
          [
            'Find user 42 by primary key',
            'Count all users who have an email',
            'Read every user',
            'Find the user with email x@y.com',
          ],
          3,
          'It searches by a field other than the primary key.',
        ),
        choose(
          'Why can a secondary index on city contain the same value many times?',
          [
            'Indexes always duplicate data',
            'Many rows can share the same city',
            'Cities are primary keys',
            'It cannot',
          ],
          1,
          'The indexed column is not unique, so one value maps to several rows.',
        ),
        choose(
          'A secondary index lookup returns 3 matching primary keys, and the index stores only keys. What happens next?',
          [
            'The 3 rows are fetched by primary key',
            'The query ends with keys only',
            'The whole table is scanned for those 3 keys',
            'The index is rebuilt',
          ],
          0,
          'The index points to rows; their other columns live in the table.',
        ),
        choose(
          'Which column is a poor choice for a secondary index meant to find a few rows quickly?',
          [
            'email, unique for every user',
            'order_number, unique for every order',
            'is_active, true for 99% of rows',
            'username, unique across all accounts',
          ],
          2,
          'Looking up true still matches almost every row, so the index saves little.',
        ),
      ],
    },
    {
      title: 'Order composite index fields to match queries',
      explanation: [
        'A composite index sorts by its first field, then by the second field within equal first values, like a phone book sorted by surname, then first name.',
        'A query that fixes the first field and ranges over the second reads one contiguous slice. A query on the second field alone cannot use that order, because its values are scattered across every first-field group.',
      ],
      example: scenario(
        'Index on (city, start_date). Query 1: city = Lima and start_date in June. Query 2: start_date in June, any city.',
        'Query 1 reads one contiguous block of the index. Query 2 must look inside every city’s block; an index starting with start_date would suit it.',
        'The leading field decides which questions the index order can answer directly.',
      ),
      questions: [
        choose(
          'An index is on (customer_id, created_at). Which query reads one contiguous range?',
          [
            'created_at in May, for all customers',
            'customer_id = 7 and created_at in May',
            'Rows whose created_at is a Monday',
            'Any query that filters on created_at alone',
          ],
          1,
          'Fixing the leading field leaves created_at sorted within that customer.',
        ),
        choose(
          'An index is on (last_name, first_name). Which lookup is efficient?',
          [
            'first_name = "Ana"',
            'first_name starting with A',
            'Every row with any name',
            'last_name = "Ruiz"',
          ],
          3,
          'The index is sorted by last name first, so one surname is a contiguous block.',
        ),
        choose(
          'Queries filter on status = "open" and return rows ordered by due_date. Which index fits best?',
          [
            '(title, status)',
            '(due_date, status)',
            '(status, due_date)',
            '(due_date, title)',
          ],
          2,
          'Within status = open, the index already lists rows in due_date order.',
        ),
        choose(
          'An index is on (country, city). Which query cannot use the index order well?',
          [
            'city = "Lima", in any country',
            'country = "PE"',
            'country = "PE" and city = "Lima"',
            'country = "PE" and city from A to M',
          ],
          0,
          'Without the leading country, Lima entries are spread across every country’s block.',
        ),
      ],
    },
    {
      title: 'Verify the benefit against the cost',
      explanation: [
        'Each index speeds some reads and slows every write that touches its columns, and it takes storage. Confirm a proposed index with the engine’s query plan, its report of which access path a query will use, and by timing the target query under realistic load.',
        'A covering index includes every column a query needs, so the engine can answer from the index alone, at the cost of larger index entries.',
      ],
      example: scenario(
        'A table receives 3,000 inserts per second and already has 6 indexes. A report run twice a day wants a 7th index.',
        'Measure insert cost with the 7th index; consider running the report on a copy instead.',
        'A rarely run query may not justify slowing every insert.',
      ),
      questions: [
        choose(
          'A query needs only city and name. The index is on city and also stores name. What can the engine avoid?',
          [
            'Reading the index entries for the city',
            'Sorting the results by city',
            'Fetching the full rows',
            'Checking the query plan',
          ],
          2,
          'The index covers the query, so the table rows are not needed.',
        ),
        choose(
          'What confirms that a new index actually helps the slow query?',
          [
            'Its query plan and a timing under load',
            'A faster timing on an idle test database',
            'That it was created without errors',
            'The number of columns it holds',
          ],
          0,
          'The plan shows whether it is used; the timing shows whether it helps.',
        ),
        choose(
          'A table has 10 indexes and inserts have become slow. Which first step is sound?',
          [
            'Add an 11th index covering the insert columns',
            'Remove indexes that no query uses',
            'Remove the primary key',
            'Turn off the write-ahead log during peak hours',
          ],
          1,
          'Unused indexes cost write work and give nothing back.',
        ),
        choose(
          'Why can a covering index slow writes more than a narrow index?',
          [
            'It forbids writes while a read is in progress',
            'It is rebuilt from the table after every write',
            'It cannot slow writes',
            'Each change writes larger index entries',
          ],
          3,
          'Extra stored columns must be written and kept current too.',
        ),
      ],
    },
  ],

  'ds-columnar': [
    {
      title: 'Read only the columns a scan needs',
      explanation: [
        'A row-oriented layout stores all fields of a row together. A column-oriented layout stores each column’s values together, one file or block per column.',
        'A scan that needs 2 of 50 columns reads only those 2 in a column layout, but whole rows in a row layout. Fetching or inserting one complete record, though, touches every column file.',
      ],
      example: scenario(
        '1 billion sessions with 40 columns of about 8 bytes each. A report sums duration grouped by country.',
        'A row layout reads about 320 GB; a column layout reads 2 columns, about 16 GB.',
        'Only the columns the query uses are read, a twentieth of the data here.',
      ),
      questions: [
        choose(
          'A table has 100 equally sized columns, and a query uses 4. Roughly what fraction of the data does a column store read?',
          ['40%', '100%', '25%', '4%'],
          3,
          'It reads 4 of 100 equal columns.',
        ),
        choose(
          'Which request favours a row layout?',
          [
            'Average price over 5 years',
            'Fetch every field of order 881',
            'Count orders per country this year',
            'Sum quantity by month',
          ],
          1,
          'One complete record sits together in a row layout.',
        ),
        choose(
          'A table holds 500 GB in 25 equally sized columns. How much does a scan of 3 columns read in a column store?',
          ['60 GB', '500 GB', '20 GB', '3 GB'],
          0,
          'Each column is 20 GB, and the scan reads three of them.',
        ),
        choose(
          'Inserting one new order touches how many column files in a 30-column column store?',
          ['1', '15', '30', '0'],
          2,
          'Each column’s value goes to its own file.',
        ),
      ],
    },
    {
      title: 'Compress similar values',
      explanation: [
        'Values in one column share a type and often repeat: country codes, status flags, sorted dates. Run-length encoding stores (PE, 5000) instead of 5,000 copies of PE; dictionary encoding stores each distinct string once and a small code per row.',
        'Less data on disk means less to read, so compression speeds up scans as well as saving space.',
      ],
      example: scenario(
        'A sorted country column holds PE four times, CL three times and CO five times.',
        'Run-length encoded, it is (PE, 4), (CL, 3), (CO, 5): three pairs instead of twelve values.',
        'Sorting puts equal values next to each other, forming long runs.',
      ),
      questions: [
        choose(
          'Run-length encode the column A A A B B A. How many (value, count) pairs result?',
          ['2', '6', '3', '4'],
          2,
          'The runs are A×3, B×2 and A×1; the last A starts a new run.',
        ),
        choose(
          'Why does sorting a column by value help run-length encoding?',
          [
            'Sorting removes duplicate values before encoding',
            'Equal values end up next to each other',
            'Sorted data cannot be compressed',
            'It changes the stored values',
          ],
          1,
          'Fewer, longer runs need fewer pairs.',
        ),
        choose(
          'Which column compresses best with dictionary encoding?',
          [
            'A status column with 4 distinct values',
            'Unique transaction IDs, one per row',
            'Random 64-bit numbers',
            'Free-text comments written by customers',
          ],
          0,
          'Few distinct values mean a tiny dictionary and short codes.',
        ),
        choose(
          'Why does compression make scans faster, not only smaller?',
          [
            'Compressed data needs no decoding',
            'It skips rows that hold repeated values',
            'It removes columns',
            'Less data has to be read from disk',
          ],
          3,
          'Disk reads often dominate scan time, and compression shrinks them.',
        ),
      ],
    },
    {
      title: 'Process values in batches and know the limits',
      explanation: [
        'Columnar engines apply each operation to a batch of values from one column at a time (vectorised execution), which keeps the CPU in tight loops instead of paying overhead per row.',
        'The layout favours broad scans of few columns. Single-row lookups, frequent small updates and “fetch the whole record” requests suit row layouts better, so many systems keep an operational row store and copy data into a column store for analytics.',
      ],
      example: scenario(
        'One app needs checkout (one order, all fields, 50 writes per second) and a quarterly revenue analysis over three years of orders.',
        'Keep checkout in a row store and load orders into a columnar warehouse for the analysis.',
        'Each workload gets the layout that matches its access pattern.',
      ),
      questions: [
        choose(
          'What does vectorised execution process in one step?',
          [
            'One whole row with all of its columns',
            'A batch of one column’s values',
            'One byte',
            'A batch of whole rows from one page',
          ],
          1,
          'Batches of same-typed values are processed in tight loops.',
        ),
        choose(
          'A team moves order checkout to a column store because “columnar is faster”. What is the risk?',
          [
            'Scans become slower',
            'Data can no longer be compressed per column',
            'Nothing, since columnar is faster for every query',
            'Single-order reads and writes get costlier',
          ],
          3,
          'Each order is spread across every column file.',
        ),
        choose(
          'Which design serves both checkout and yearly analytics well?',
          [
            'A row store for checkout, copied to a column store',
            'A column store for checkout, copied to a row store',
            'A row store for both, with no copy',
            'Separate row stores per analyst',
          ],
          0,
          'Each workload runs on the layout suited to it.',
        ),
        choose(
          'A query reads 45 of a table’s 50 columns for every row. How much does a column layout help?',
          [
            'A lot: it reads only about 10% of the data',
            'It avoids reading the table',
            'Little: it reads nearly every column anyway',
            'It roughly doubles the speed via compression',
          ],
          2,
          'Column pruning only helps when many columns can be skipped.',
        ),
      ],
    },
  ],

  'ds-materialized': [
    {
      title: 'Store a query result as a view',
      explanation: [
        'A materialized view stores the result of a query, such as registrations per workshop, so reads fetch the stored answer instead of recomputing it every time.',
        'It is derived data: its meaning comes from the source tables and the query that defines it, it can be rebuilt from them, and when it disagrees with the source, the source wins.',
      ],
      example: scenario(
        'Registrations hold 2 million rows. A page shows the count per workshop 300 times per minute, and counting takes 4 seconds.',
        'Store the counts per workshop in a materialized view; each page view then reads one small row.',
        'The expensive count runs only when the view is refreshed, not on every read.',
      ),
      questions: [
        choose(
          'What does a materialized view store?',
          [
            'The source rows, authoritatively',
            'Only the text of the query, run on each read',
            'The result of a query over source data',
            'A backup of the whole database',
          ],
          2,
          'It keeps the computed answer so reads can skip the computation.',
        ),
        choose(
          'A view’s stored data is lost, but its source tables and definition remain. What follows?',
          [
            'It can be recomputed',
            'The source is lost too',
            'It can never be rebuilt',
            'The view becomes authoritative',
          ],
          0,
          'Re-running the defining query over the source rebuilds it.',
        ),
        choose(
          'A count takes 5 seconds and is requested 600 times per minute. A view takes 5 seconds to refresh once per minute. How much counting work per minute does the view save?',
          [
            'About 3,005 seconds',
            '5 seconds',
            '600 seconds',
            'About 2,995 seconds',
          ],
          3,
          '600 counts cost 3,000 seconds of work; the view costs 5 seconds plus cheap reads.',
        ),
        choose(
          'A view and its source disagree about a workshop’s registrations. Which is right?',
          ['The view', 'The source', 'Whichever is newer', 'Neither'],
          1,
          'The view is derived; the source is authoritative.',
        ),
      ],
    },
    {
      title: 'Accept a freshness window with batch refresh',
      explanation: [
        'A batch refresh recomputes the whole view on a schedule. Between refreshes, the view misses changes: with a 10-minute schedule, a registration made just after a refresh started can stay invisible until the next refresh finishes.',
        'Show readers the “as of” time of the data so the staleness is explicit, and keep decisions that need current data, such as selling the last seat, on the source.',
      ],
      example: scenario(
        'A view refreshes every 10 minutes; each refresh reads the data as of its start and takes 2 minutes. One started at 12:00 and finished at 12:02.',
        'At 12:09 the view reflects data up to 12:00. A change at 12:00:01 appears only when the 12:10 refresh finishes at 12:12.',
        'The worst-case staleness is the refresh interval plus the refresh time: about 12 minutes.',
      ),
      questions: [
        choose(
          'A view refreshes every 15 minutes, starting at 09:00, 09:15 and so on, and each refresh takes about a minute. A change is made at 09:01. When does it first appear?',
          [
            'Immediately',
            'When the 09:00 refresh finishes',
            'When the 09:15 refresh finishes',
            'When the 09:15 refresh starts',
          ],
          2,
          'The 09:00 refresh read data from before the change; the next one includes it.',
        ),
        choose(
          'A view refreshes every hour, and each refresh takes 10 minutes. What is the worst-case staleness?',
          ['10 minutes', 'About 60 minutes', '0 minutes', 'About 70 minutes'],
          3,
          'A change just after a refresh starts waits for the next start and its 10-minute run.',
        ),
        choose(
          'Why show “as of 14:00” on a dashboard backed by a batch-refreshed view?',
          [
            'Readers can judge how stale it is',
            'It makes the refresh faster',
            'It prevents stale data from being shown',
            'It makes the view authoritative',
          ],
          0,
          'Stating the data’s time makes the freshness window visible.',
        ),
        choose(
          'Seat availability must never offer a seat already sold. Is a view refreshed every 10 minutes suitable for the final booking decision?',
          [
            'Yes, 10 minutes is short',
            'No, the decision needs current source data',
            'Yes, if it is labelled with its refresh time',
            'Only outside peak hours',
          ],
          1,
          'A stale count can show seats that were sold minutes ago.',
        ),
      ],
    },
    {
      title: 'Maintain a view incrementally',
      explanation: [
        'Incremental maintenance applies each source change to the view: +1 when a registration is added and −1 when one is cancelled. The view stays fresh without rescanning the source.',
        'The update path must handle every kind of change (inserts, deletes, edits), retries that deliver a change twice, and gaps where a change is lost. Keep a full rebuild from the source as the repair tool.',
      ],
      example: scenario(
        'A count view is 120. Changes arrive: +1 (e-51), +1 (e-52), −1 (cancellation of e-40), then +1 (e-52 again, a retry).',
        'The correct count is 121. Applying every message naively gives 122, because e-52 is counted twice; recording applied event IDs prevents that.',
        'Incremental updates are only as correct as their handling of retries and deletions.',
      ),
      questions: [
        choose(
          'A count view shows 40. Changes arrive: +1, +1, −1, +1, each distinct. What should the view show?',
          ['43', '40', '42', '44'],
          2,
          'Three additions and one removal net +2.',
        ),
        choose(
          'The same insert event is delivered twice to a counter that applies every message. What happens?',
          [
            'Nothing',
            'The count is one too low',
            'The view is rebuilt',
            'The count is one too high',
          ],
          3,
          'The duplicate is counted as a second registration.',
        ),
        choose(
          'An incremental view handles inserts only, but users can cancel registrations. What goes wrong?',
          [
            'Counts drift above the true number',
            'Counts drop to zero after the first cancellation',
            'Cancellations are blocked until the view catches up',
            'Nothing',
          ],
          0,
          'Every missed −1 leaves the view higher than the source.',
        ),
        choose(
          'An incremental view is suspected of drifting. What is the safest repair?',
          [
            'Subtract an estimate of the error from the view',
            'Recompute it from the source and compare',
            'Delete the source data',
            'Refresh more often without checking',
          ],
          1,
          'The source is authoritative, so a full rebuild gives the correct values.',
        ),
      ],
    },
  ],

  'ds-schema-evolution': [
    {
      title: 'Plan for old and new code running together',
      explanation: [
        'Data outlives code. Records written by version 1 of an application are still stored when version 2 deploys, and they are not rewritten automatically.',
        'During a rolling deployment, servers are upgraded one at a time, so version 1 and version 2 run side by side, reading and writing the same data and messages. A rollback can put old code back in front of new data. A schema change must work in every combination.',
      ],
      example: scenario(
        'Five servers upgrade one at a time over 30 minutes. Version 2 writes records with a new optional field, subtitle.',
        'During the rollout, version 1 servers read version 2 records and version 2 servers read version 1 records; test both combinations.',
        'A clean upgrade test with only version 2 would miss both mixed cases.',
      ),
      questions: [
        choose(
          'During a rolling deployment from version 3 to version 4, which reads can occur?',
          [
            'Only version 4 reading version 4 data',
            'Only version 3 reading version 3 data',
            'Either version reading either version’s data',
            'No reads, because deployments pause all traffic',
          ],
          2,
          'Both versions are live and share the same data.',
        ),
        choose(
          'Why can old records remain long after the code that wrote them is gone?',
          [
            'Code changes do not rewrite stored records',
            'Databases rewrite all stored data on each deploy',
            'Old records are always deleted',
            'They cannot',
          ],
          0,
          'Deploying code changes how future data is written, not existing data.',
        ),
        choose(
          'A deploy is rolled back from version 2 to version 1 after version 2 wrote new records. What must version 1 handle?',
          [
            'Only records it wrote before the upgrade',
            'An empty database',
            'Nothing new, since a rollback restores old data',
            'Records written by version 2',
          ],
          3,
          'The rollback removes the new code, not the data it wrote.',
        ),
        choose(
          'Which plan is safest for renaming a field that every service uses?',
          [
            'Rename it everywhere in one coordinated deploy',
            'Write both fields, move readers, then drop the old one',
            'Delete the field and re-add it under the new name',
            'Rename it in the database first, then in each service in turn',
          ],
          1,
          'Each step keeps every running version able to read what the others write.',
        ),
      ],
    },
    {
      title: 'Distinguish backward and forward compatibility',
      explanation: [
        'Backward compatibility: new code can read data written by old code. Version 2 reading a version 1 record finds no subtitle, so it needs a default.',
        'Forward compatibility: old code can read data written by new code. Version 1 reading a version 2 record meets an unknown field, so it must ignore it, and ideally keep it when writing the record back.',
      ],
      example: scenario(
        'Version 2 adds subtitle with a default of an empty string. Version 1 ignores fields it does not know.',
        'Backward: version 2 reads a version 1 record and uses subtitle = "". Forward: version 1 reads a version 2 record and ignores subtitle.',
        'Both directions are needed while both versions run.',
      ),
      questions: [
        choose(
          'Version 5 reads a record written by version 4. Which property is needed?',
          [
            'Forward compatibility',
            'Neither',
            'Backward compatibility',
            'Normalisation',
          ],
          2,
          'Newer code is reading older data.',
        ),
        choose(
          'Version 4 reads a record written by version 5 that contains a field version 4 has never seen. Which property is needed?',
          [
            'Forward compatibility',
            'Backward compatibility',
            'Neither',
            'Both are always required',
          ],
          0,
          'Older code is reading data from the future version.',
        ),
        choose(
          'Version 2 adds a required field with no default. What breaks?',
          [
            'Version 1 writing its own records',
            'Nothing',
            'Only forward compatibility',
            'Version 2 reading old records',
          ],
          3,
          'Old records lack the field, and version 2 has no value to use.',
        ),
        choose(
          'Version 1 reads a version 2 record, ignores the unknown field, and writes the record back without it. What is lost?',
          [
            'Nothing',
            'The version 2 field’s value',
            'The whole record, since it no longer parses',
            'Version 1’s own fields',
          ],
          1,
          'Ignoring is safe for reading; dropping on write loses newer data.',
        ),
      ],
    },
    {
      title: 'Make changes that both directions survive',
      explanation: [
        'Usually safe: adding an optional field with a default, and stopping all use of a field before removing it. Keep field identities, names or numeric tags, stable and never reuse them.',
        'Risky: adding a required field, renaming a field in one step, or changing a field’s type or meaning. Whatever a format promises, test the real reader and writer combinations.',
      ],
      example: scenario(
        'Proposed change: store price as a decimal string instead of whole cents, under the same field name.',
        'Unsafe in one step, because version 1 readers expect whole cents. Add price_decimal, write both, move readers over, then retire the cents field.',
        'A new field lets old and new readers each find what they understand.',
      ),
      questions: [
        choose(
          'Which change is usually both backward and forward compatible?',
          [
            'Renaming a field',
            'Changing a number field to text',
            'Adding a required field that new code fills in',
            'Adding an optional field with a default',
          ],
          3,
          'Old readers ignore it and new readers fill in the default.',
        ),
        choose(
          'Why not reuse a deleted field’s name for new data?',
          [
            'Old data and old readers read it the old way',
            'Databases forbid reusing a deleted field’s name',
            'It saves no space',
            'It is fine once the field has been deleted',
          ],
          0,
          'Old data would be misread as the new field.',
        ),
        choose(
          'A field changes from “price in dollars” to “price in cents” with the same name and type. Why is this dangerous?',
          [
            'Serialisation formats reject a changed meaning',
            'It changes the field’s type',
            'Readers cannot tell which unit is meant',
            'It is safe, because the name and type are unchanged',
          ],
          2,
          'The bytes look identical, so the meaning change is silent.',
        ),
        choose(
          'What actually confirms that a change is compatible?',
          [
            'The format’s documentation of its compatibility rules',
            'Testing every old/new reader-writer pair',
            'A code review of the new schema definition',
            'Deploying to every server at once',
          ],
          1,
          'Only the real combinations show how actual readers behave.',
        ),
      ],
    },
  ],

  'ds-dataflow': [
    {
      title: 'Choose request-response or asynchronous messages',
      explanation: [
        'In request-response, the caller waits for another service to do the work and reply; if that service is slow or down, the caller is too. With asynchronous messaging, the producer places a message with a broker, a durable queue, and moves on; consumers process it later at their own pace.',
        'The broker absorbs bursts and short outages, but delivery failures and duplicate deliveries still have to be handled.',
      ],
      example: scenario(
        'Checkout calls the email service directly. The email service is down for 10 minutes.',
        'Called directly, checkouts fail for 10 minutes. With a queue, checkouts succeed, 1,200 confirmation emails wait in the queue, and they are sent when the service returns.',
        'Work that need not finish before replying to the user can be decoupled.',
      ),
      questions: [
        choose(
          'A producer sends 500 messages per second for one minute to a consumer that handles 300 per second. How many messages are queued at the end of the minute?',
          ['200', '30,000', '12,000', '0'],
          2,
          'The queue grows by 200 per second for 60 seconds.',
        ),
        choose(
          'Which task suits asynchronous messaging best?',
          [
            'Checking a password before login',
            'Generating a PDF receipt after checkout',
            'Showing the cart total the user is waiting for',
            'Validating a card number on the form',
          ],
          1,
          'The user does not need the receipt before checkout completes.',
        ),
        choose(
          'What does a message broker NOT remove?',
          [
            'Handling failed and repeated deliveries',
            'Buffering between producer and consumer',
            'Decoupling of their timing',
            'The ability to absorb bursts',
          ],
          0,
          'Messages can still fail or arrive twice, so consumers must cope.',
        ),
        choose(
          'With a queue between them, the consumer is down for 5 minutes. What happens?',
          [
            'The producer blocks until the consumer is back',
            'Messages are always lost',
            'The broker processes them itself',
            'Messages wait in the queue until it returns',
          ],
          3,
          'The durable queue holds the work until it can be done.',
        ),
      ],
    },
    {
      title: 'Treat a timeout as an unknown outcome',
      explanation: [
        'When a call times out, the request may never have arrived, may have been processed with the reply lost, or may still be running. The caller cannot tell which.',
        'Retrying is often right, but a blind retry of “charge \\$50” can charge twice. Setting a value is safe to repeat; adding to one is not.',
      ],
      example: scenario(
        'A payment call times out after 5 seconds. The payment service had charged the card at 4.9 seconds, and the reply was lost.',
        'A blind retry charges the card again. The retry must carry something that lets the service recognise it as the same payment.',
        'The timeout looked like a failure, but the work had succeeded.',
      ),
      questions: [
        choose(
          'A “transfer \\$100” call times out. What do you know?',
          [
            'The transfer did not happen, so retry it',
            'It may or may not have happened',
            'The transfer happened',
            'The account was closed',
          ],
          1,
          'Silence cannot distinguish a lost request from a lost reply.',
        ),
        choose(
          'Which operation is safe to retry blindly after a timeout?',
          [
            'Add \\$10 to the customer’s balance',
            'Append a new comment',
            'Send an SMS confirming the order',
            'Set the address to “12 Elm St”',
          ],
          3,
          'Setting the same value twice leaves the same result.',
        ),
        choose(
          'Why is “increase the view count by 1” unsafe to retry after a timeout?',
          [
            'The first attempt may have counted already',
            'Increments always fail',
            'Timeouts automatically roll back the increment',
            'It is safe, because increments are idempotent',
          ],
          0,
          'The effect accumulates with each attempt that succeeds.',
        ),
        choose(
          'A consumer crashes after applying a message but before acknowledging it to the broker. What does the broker usually do?',
          [
            'Delete the message',
            'Mark it as applied',
            'Deliver the message again',
            'Return it to the producer',
          ],
          2,
          'Without an acknowledgement, the broker assumes the work was not done.',
        ),
      ],
    },
    {
      title: 'Make processing idempotent',
      explanation: [
        'An operation is idempotent if applying it twice has the same effect as applying it once. Setting a value is naturally idempotent; adding to it is not.',
        'Make other operations safe by giving each one a stable ID and recording the IDs already applied, durably and together with the effect, then skipping any ID seen before.',
      ],
      example: scenario(
        'Events e-1 (+1), e-2 (+1), e-2 again (redelivered), e-3 (+1) reach a counter that starts at 0.',
        'Track applied IDs {e-1, e-2, e-3} and skip the repeat: the count is 3, not 4.',
        'The repeated delivery is recognised by its ID, not by its contents.',
      ),
      questions: [
        choose(
          'Events arrive with IDs a, b, a, c, b. With duplicate detection by ID, how many are applied?',
          ['5', '2', '4', '3'],
          3,
          'Only the distinct IDs a, b and c are applied.',
        ),
        choose(
          'Which operation is naturally idempotent?',
          [
            'Add 1 to the stock count',
            'Set status to “shipped”',
            'Append a line to a log',
            'Send an email',
          ],
          1,
          'Setting the same status again changes nothing.',
        ),
        choose(
          'A consumer keeps the set of applied IDs only in memory and restarts. What risk appears?',
          [
            'Redelivered messages get reapplied',
            'No risk, since the broker remembers applied IDs',
            'All queued messages are lost on restart',
            'IDs become duplicated',
          ],
          0,
          'The memory of what was applied disappears with the process.',
        ),
        choose(
          'Why should the record of an applied ID be saved together with the effect, not in a separate step?',
          [
            'Saving together is faster',
            'IDs must be stored twice',
            'A crash in between could leave them disagreeing',
            'It does not matter, since the broker deduplicates',
          ],
          2,
          'If the two can diverge, a retry is either applied twice or skipped wrongly.',
        ),
      ],
    },
  ],
  'ds-replication': [
    {
      title: 'Send writes through one leader',
      explanation: [
        'In single-leader replication, one node, the leader, accepts all writes, applies them in order, and sends that ordered stream of changes to the followers, which apply the same changes in the same order.',
        'Reads can go to the leader or to followers, so followers add read capacity and redundancy. Writes still all pass through the leader, so adding followers does not add write capacity.',
      ],
      example: scenario(
        'The leader receives w1 (stock = 5), then w2 (stock = 4). Followers F1 and F2 receive the change stream.',
        'Both followers apply w1 and then w2, ending with stock = 4, the same as the leader.',
        'Applying the same changes in the same order makes every copy reach the same state.',
      ),
      questions: [
        choose(
          'A client sends a write directly to a follower in a single-leader system. What should happen?',
          [
            'The follower applies it and tells the leader later',
            'All followers vote on it',
            'It is applied to the backup',
            'It is rejected or forwarded to the leader',
          ],
          3,
          'Only the leader orders writes; otherwise copies could diverge.',
        ),
        choose(
          'Why must followers apply changes in the leader’s order?',
          [
            'Applying the same changes in a different order can give a different final state',
            'Order makes replication faster',
            'Order never matters',
            'Followers sort changes alphabetically',
          ],
          0,
          'Setting stock to 5 then 4 differs from setting it to 4 then 5.',
        ),
        choose(
          'A service has 1 leader and 4 followers, each serving up to 2,000 reads per second, with reads spread over all 5 nodes. What is the total read capacity?',
          ['2,000 reads/s', '8,000 reads/s', '10,000 reads/s', '4,000 reads/s'],
          2,
          'Every node can serve reads: 5 × 2,000.',
        ),
        choose(
          'What does adding followers NOT increase in single-leader replication?',
          [
            'Read capacity',
            'Write capacity',
            'The number of copies of the data',
            'Tolerance of losing a node',
          ],
          1,
          'Every write still has to go through the single leader.',
        ),
      ],
    },
    {
      title: 'Choose synchronous or asynchronous acknowledgement',
      explanation: [
        'Synchronous replication confirms a write only after a required follower has it; asynchronous replication confirms as soon as the leader has it.',
        'Synchronous: an acknowledged write survives losing the leader, but every write waits for the follower, and if that follower is down, writes stall. Asynchronous: fast and available, but the newest acknowledged writes can be lost if the leader fails.',
      ],
      example: scenario(
        'Writing on the leader takes 5 ms, and a round trip to the follower takes 40 ms.',
        'A synchronous write takes about 45 ms; an asynchronous one about 5 ms, but for a moment the write exists only on the leader.',
        'Each mode trades response time and availability against the risk of losing acknowledged writes.',
      ),
      questions: [
        choose(
          'Writing on the leader takes 3 ms, and the follower round trip takes 20 ms. About how long does a synchronous write take?',
          ['3 ms', '20 ms', '60 ms', '23 ms'],
          3,
          'The leader must also wait for the follower’s confirmation.',
        ),
        choose(
          'The required synchronous follower goes offline. What happens to writes?',
          [
            'They stall or fail until it returns or is replaced',
            'They become faster',
            'They are acknowledged anyway',
            'They are sent to the follower later',
          ],
          0,
          'Acknowledgement depends on a node that cannot answer.',
        ),
        choose(
          'Which setup can lose writes that were already acknowledged when the leader dies?',
          [
            'Synchronous replication to a surviving follower',
            'Asynchronous replication',
            'Both equally',
            'Neither',
          ],
          1,
          'With asynchronous replication the leader may confirm before any follower has the write.',
        ),
        choose(
          'One follower is synchronous and the others asynchronous. What does this guarantee about an acknowledged write?',
          [
            'Every follower already has it',
            'It can never be lost in any failure',
            'It exists on at least two nodes',
            'It was written without waiting',
          ],
          2,
          'The leader and the synchronous follower both hold it before success is reported.',
        ),
      ],
    },
    {
      title: 'Fail over to a new leader',
      explanation: [
        'When the leader dies, a follower is promoted (failover) and clients send their writes to it. With asynchronous replication, the promoted follower may lack the old leader’s last writes, and those writes are lost.',
        'If the old leader comes back still believing it is the leader, two nodes may accept writes at once, a dangerous state called split brain. Declaring a leader dead too quickly can trigger needless failovers.',
      ],
      example: scenario(
        'The leader acknowledged writes up to #1,050. The most up-to-date follower had applied up to #1,042 when the leader died, and it is promoted.',
        'Writes #1,043 to #1,050, eight acknowledged writes, are lost.',
        'Promoting the most current follower minimises the loss but cannot remove it under asynchronous replication.',
      ),
      questions: [
        choose(
          'The old leader acknowledged writes up to #500; the promoted follower had applied up to #488. How many acknowledged writes are lost?',
          ['488', '12', '500', '0'],
          1,
          'Writes #489 to #500 never reached the new leader.',
        ),
        choose(
          'After a failover, the old leader returns and keeps accepting writes. What is this danger called?',
          [
            'Write amplification',
            'A lost update',
            'Split brain',
            'Replication lag',
          ],
          2,
          'Two nodes acting as leader can accept conflicting writes.',
        ),
        choose(
          'Why is triggering failover after a very short timeout risky?',
          [
            'Timeouts are always too long',
            'Followers cannot be promoted quickly',
            'It is never risky',
            'A slow but alive leader may be replaced, causing needless failovers or two leaders',
          ],
          3,
          'A brief slowdown looks the same as a crash from outside.',
        ),
        choose(
          'Which follower is the best candidate to promote?',
          [
            'The one that has applied the most recent changes',
            'The newest machine',
            'Any follower at random',
            'The one serving the fewest reads',
          ],
          0,
          'It holds the most of the old leader’s writes, so the least is lost.',
        ),
      ],
    },
  ],

  'ds-replication-lag': [
    {
      title: 'Measure how far a follower is behind',
      explanation: [
        'Replication lag is how far a follower trails the leader, counted in changes or in time. If the leader has applied change #9,000 and a follower #8,940, the follower is 60 changes behind; at 30 changes per second, that is 2 seconds.',
        'A read from that follower misses the last 2 seconds of writes. Lag is usually small, but it can grow to minutes under heavy load or network trouble.',
      ],
      example: {
        code: 'leader_position = 9000\nfollower_position = 8940\nwrites_per_second = 30\nbehind = leader_position - follower_position\nprint(behind)\nprint(behind / writes_per_second)',
        output: '60\n2.0',
        explanation:
          'The follower is 60 changes behind, which at 30 changes per second is 2 seconds of writes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'leader_position = 12500\nfollower_position = 12350\nwrites_per_second = 50\nbehind = leader_position - follower_position\nprint(behind)\nprint(behind / writes_per_second)',
          ['150\n7500.0', '3.0\n150', '12350\n3.0', '150\n3.0'],
          3,
          '150 changes behind at 50 changes per second is 3 seconds.',
        ),
        predictOutput(
          'Each number is a follower’s applied position. What does this program print?',
          'leader = 400\nfollowers = [400, 395, 371]\nfor position in followers:\n    print(leader - position)',
          ['400\n395\n371', '0\n5\n29', '29\n5\n0', '0\n5\n24'],
          1,
          'Each follower’s lag is the leader’s position minus its own.',
        ),
        choose(
          'A follower is 4 seconds behind the leader. A user wrote a new value 1 second ago, and a read now goes to that follower. What does the read return?',
          [
            'The value from before the write',
            'The new value',
            'An error',
            'Part of the write',
          ],
          0,
          'The follower has not yet applied anything from the last 4 seconds.',
        ),
        choose(
          'Lag normally stays under 100 ms but reaches 3 minutes during a nightly bulk import. What should the design assume?',
          [
            'Lag is always under 100 ms',
            'Imports reduce lag',
            'Lag can occasionally be large, so follower reads may be minutes stale',
            'Followers stop serving reads during imports',
          ],
          2,
          'Designs must handle the worst lag that actually occurs, not the usual one.',
        ),
      ],
    },
    {
      title: 'Let users read their own writes',
      explanation: [
        'Read-your-writes means that after a user’s write succeeds, that user’s later reads show it. Other users may still briefly see older data.',
        'One approach serves a user’s recently changed data from the leader for a while, say one minute after their last write. Another remembers the leader position of the user’s last write and reads only from followers that have reached it.',
      ],
      example: {
        code: 'last_write_position = 1205\nfollower_a = 1199\nfollower_b = 1210\nprint(follower_a >= last_write_position)\nprint(follower_b >= last_write_position)',
        output: 'False\nTrue',
        explanation:
          'Only follower b has applied the user’s write at position 1205, so only it can serve that user’s read.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'last_write = 870\nfollower_a = 871\nfollower_b = 860\nprint(follower_a >= last_write, follower_b >= last_write)',
          ['False True', 'True True', 'True False', 'False False'],
          2,
          'Follower a has passed position 870; follower b has not reached it.',
        ),
        choose(
          'A user saves a new bio and immediately sees it, while other users see the old bio for a few seconds. Does that violate read-your-writes?',
          [
            'Yes, everyone must see it instantly',
            'No, the guarantee only covers the writer’s own reads',
            'Yes, followers must never lag',
            'No, because read-your-writes means only the leader serves reads',
          ],
          1,
          'Other users’ brief staleness is allowed; the writer must see the change.',
        ),
        choose(
          'Which routing provides read-your-writes for profile pages?',
          [
            'Read from a random follower',
            'Read from the most distant follower',
            'Cache each profile for an hour',
            'Serve a user’s own profile from the leader for one minute after they edit it',
          ],
          3,
          'The leader always has the user’s latest write.',
        ),
        choose(
          'A user writes on their phone and then reads on their laptop. Why can “remember the last write position in the client” fail here?',
          [
            'The laptop does not know the position of the phone’s last write',
            'Laptops cannot read from followers',
            'Positions expire after one millisecond',
            'It cannot fail',
          ],
          0,
          'The remembered position lives on the device that made the write.',
        ),
      ],
    },
    {
      title: 'Never go backward in time',
      explanation: [
        'Monotonic reads means that once a user has seen a value, later reads never show an older one. Without it, two refreshes that hit different followers can show a new comment and then hide it again.',
        'A simple fix sends each user’s reads to the same follower, chosen for example from the user ID. That prevents going backward, but it does not by itself show the user their own latest write.',
      ],
      example: {
        code: 'seen = [5, 7, 6]\nwent_back = False\nprevious = 0\nfor version in seen:\n    if version < previous:\n        went_back = True\n    previous = version\nprint(went_back)',
        output: 'True',
        explanation:
          'The user saw version 7 and then version 6, an older state, so monotonic reads were violated.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'seen = [3, 3, 4, 8]\nwent_back = False\nprevious = 0\nfor version in seen:\n    if version < previous:\n        went_back = True\n    previous = version\nprint(went_back)',
          ['True', '8', 'False', '4'],
          2,
          'Repeating a version is not going backward, and the versions never decrease.',
        ),
        predictOutput(
          'What does this program print?',
          'seen = [10, 12, 11, 13]\nwent_back = False\nprevious = 0\nfor version in seen:\n    if version < previous:\n        went_back = True\n    previous = version\nprint(went_back)',
          ['False', 'True', '11', '13'],
          1,
          'Version 11 after 12 is a step backward, even though 13 comes later.',
        ),
        choose(
          'A user sees 5 comments, refreshes and sees 3, then refreshes and sees 5 again. Which guarantee is missing?',
          [
            'Synchronous replication',
            'Read-your-writes',
            'Failover',
            'Monotonic reads',
          ],
          3,
          'The user’s view moved backward to an older state.',
        ),
        choose(
          'Which change gives monotonic reads but not necessarily read-your-writes?',
          [
            'Always route each user to the same follower',
            'Read only from the leader',
            'Replicate synchronously to every follower',
            'Turn off replication',
          ],
          0,
          'One follower never goes backward, but it may still lag behind the user’s own write.',
        ),
      ],
    },
  ],

  'ds-conflicts': [
    {
      title: 'Recognise concurrent writes',
      explanation: [
        'Two writes are concurrent when neither writer knew about the other’s write: both started from the same earlier version. This happens when copies accept writes independently, such as offline devices or leaders in different regions.',
        'If one write was made after seeing the other, it is not concurrent; it follows the other. The order in which writes arrive at a replica does not tell you which, because network delays can reorder them.',
      ],
      example: scenario(
        'Ana and Ben both open version 3 of a document while offline. Ana changes the title, Ben changes the date, and both sync later.',
        'The edits are concurrent: both are based on version 3, and neither writer saw the other’s change.',
        'The system now needs a rule for combining them.',
      ),
      questions: [
        choose(
          'Ben reads Ana’s change and then edits the same field. Are the two edits concurrent?',
          [
            'Yes, because they touch the same field',
            'Yes, because two users made them',
            'No, Ben’s edit follows Ana’s',
            'Only if they sync in the same second',
          ],
          2,
          'Ben knew about Ana’s edit, so his builds on it.',
        ),
        choose(
          'Two phones edit version 8 of a note while offline. How are the edits related?',
          [
            'They are concurrent',
            'The first phone’s edit follows the second’s',
            'The second phone’s edit follows the first’s',
            'They are identical',
          ],
          0,
          'Both started from version 8 without seeing each other.',
        ),
        choose(
          'Why can’t the arrival order at one replica decide which of two writes came later?',
          [
            'Replicas sort writes by size',
            'Arrival order is always reversed',
            'It always can',
            'Network delays can reorder arrivals regardless of when writes were made or what writers saw',
          ],
          3,
          'Arrival order reflects the network, not the writers’ knowledge.',
        ),
        choose(
          'Which setup makes concurrent writes to the same record possible?',
          [
            'One leader accepting every write in order',
            'Two regions each accepting writes for the same record',
            'A read-only replica',
            'A file edited by one person on one computer',
          ],
          1,
          'Independent writers without coordination can both change the same record.',
        ),
      ],
    },
    {
      title: 'Know what last-write-wins discards',
      explanation: [
        'Last-write-wins (LWW) keeps the write with the latest timestamp and silently drops the others. Every copy converges on the same value, but a valid concurrent change is lost.',
        'Clocks on different machines disagree (clock skew), so the “latest” timestamp may not even belong to the write made last in real time.',
      ],
      example: scenario(
        'Phone A, whose clock is 2 minutes fast, sets the title to Draft at real time 10:00 (stamped 10:02). Phone B sets it to Final at real time 10:01 (stamped 10:01).',
        'LWW keeps Draft and discards Final, although Final was written later.',
        'The skewed clock decided the winner, and a real edit vanished without warning.',
      ),
      questions: [
        choose(
          'Concurrent writes: x = 5 stamped 12:00:03 and x = 9 stamped 12:00:01. What does LWW keep?',
          ['9', '14', '5', 'Both'],
          2,
          'The write with the later timestamp wins; the other is dropped.',
        ),
        choose(
          'Server A’s clock runs 5 seconds fast. A writes at real time 08:00:00, and B writes at real time 08:00:03. Which write does LWW keep?',
          [
            'B’s write, stamped 08:00:03',
            'Both writes',
            'Neither write',
            'A’s write, stamped 08:00:05',
          ],
          3,
          'A’s skewed stamp is later, so its earlier write wins.',
        ),
        choose(
          'Two users add different items to a shared shopping list at the same time, and LWW stores the whole list as one value. What happens?',
          [
            'One user’s item disappears',
            'Both items are kept',
            'The list is emptied',
            'Both users see an error',
          ],
          0,
          'LWW keeps one version of the whole list, dropping the other addition.',
        ),
        choose(
          'When is last-write-wins an acceptable rule?',
          [
            'For bank balances',
            'When losing a concurrent update is acceptable, such as a device’s last known location',
            'For collaborative documents',
            'Never',
          ],
          1,
          'If an occasional lost overwrite does no harm, LWW’s simplicity is fine.',
        ),
      ],
    },
    {
      title: 'Merge by what the data means',
      explanation: [
        'Better resolution follows the meaning of the data. For a set of tags, keep both additions (a union). For a counter, add both increments. For independent fields, merge field by field.',
        'When no automatic merge is right, such as two different rewrites of the same paragraph, keep both versions and let a person choose.',
      ],
      example: scenario(
        'Tags at version 3 are {sale}. A adds new, giving {sale, new}; B adds gift, giving {sale, gift}.',
        'Merge with a union: {sale, new, gift}.',
        'Both additions were intended, and a set union keeps them.',
      ),
      questions: [
        choose(
          'A counter is 10. Replica A applies +3 and replica B applies +2 concurrently. What should the merged value be?',
          ['13', '12', '15', '10'],
          2,
          'Both increments happened, so both are added: 10 + 3 + 2.',
        ),
        choose(
          'The base tags are {red}. A adds blue and B adds green. What does a union merge give?',
          [
            '{red, blue}',
            '{red, green}',
            '{blue, green}',
            '{red, blue, green}',
          ],
          3,
          'A union keeps every tag from both sides.',
        ),
        choose(
          'A changes a contact’s phone number while B changes the same contact’s email. Which merge keeps both changes?',
          [
            'Merge field by field',
            'Keep A’s whole record',
            'Keep B’s whole record',
            'Discard both changes',
          ],
          0,
          'The edits touch different fields, so both can be applied.',
        ),
        choose(
          'Two editors rewrite the same paragraph in different ways. What is the sound resolution?',
          [
            'Union the words of both versions',
            'Keep both versions and ask a person to choose',
            'Keep the shorter version',
            'Delete the paragraph',
          ],
          1,
          'No automatic rule knows which rewrite is right.',
        ),
      ],
    },
  ],

  'ds-quorums': [
    {
      title: 'Use R + W > N to force overlap',
      explanation: [
        'Suppose a record has N replicas. A write is confirmed once W replicas acknowledge it, and a read asks R replicas. If R + W > N, any read set and any write set must share at least R + W − N replicas.',
        'So every read reaches at least one replica that holds the latest confirmed write. If R + W ≤ N, the two sets can be completely separate.',
      ],
      example: {
        code: 'n = 5\nw = 3\nr = 3\nprint(r + w > n)\nprint(r + w - n)',
        output: 'True\n1',
        explanation:
          'Three writers and three readers out of five replicas must share at least one replica.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 3\nw = 2\nr = 2\nprint(r + w > n)\nprint(r + w - n)',
          ['False\n1', 'True\n4', 'True\n1', 'False\n-1'],
          2,
          '2 + 2 = 4 is more than 3, so the sets share at least one replica.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 5\nw = 2\nr = 3\nprint(r + w > n)\nprint(r + w - n)',
          ['True\n0', 'False\n0', 'True\n1', 'False\n5'],
          1,
          '2 + 3 equals 5, so the read set can be exactly the replicas the write missed.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 7\nw = 5\nr = 4\nprint(r + w - n)',
          ['2', '9', '1', '16'],
          0,
          'At least 4 + 5 − 7 = 2 replicas are in both sets.',
        ),
        choose(
          'N = 6 and writes wait for W = 4. What is the smallest R that guarantees overlap?',
          ['2', '4', '6', '3'],
          3,
          'R must make R + 4 greater than 6, so R is at least 3.',
        ),
      ],
    },
    {
      title: 'Trade read and write thresholds',
      explanation: [
        'Within R + W > N you can shift the cost. W = N with R = 1 makes reads cheap, but a write fails if any replica is down; W = 1 with R = N does the opposite.',
        'An operation proceeds only if enough replicas are reachable: at least W for writes and R for reads. Smaller thresholds keep working through more failures, but they weaken or lose the overlap.',
      ],
      example: {
        code: 'n = 5\nw = 3\nr = 3\ndown = 2\nup = n - down\nprint(up >= w, up >= r)',
        output: 'True True',
        explanation:
          'With two of five replicas down, three remain, enough for both thresholds.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 5\nw = 5\nr = 1\ndown = 1\nup = n - down\nprint(up >= w, up >= r)',
          ['True True', 'False True', 'True False', 'False False'],
          1,
          'Writes need all 5 replicas, but only 4 are up; reads need just 1.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 3\nw = 2\nr = 2\ndown = 1\nup = n - down\nprint(up >= w, up >= r)',
          ['False False', 'True False', 'False True', 'True True'],
          3,
          'Two replicas remain, enough for both thresholds of 2.',
        ),
        choose(
          'N = 5, W = 3 and R = 3. How many replicas can be down while reads and writes still succeed?',
          ['1', '3', '2', '0'],
          2,
          'Three replicas must remain reachable, so two can be lost.',
        ),
        choose(
          'A team sets W = 1 and R = 1 with N = 3 for availability. What do they give up?',
          [
            'The guarantee that a read reaches the latest confirmed write',
            'All availability',
            'The ability to write at all',
            'Nothing',
          ],
          0,
          '1 + 1 is not more than 3, so a read can miss every replica that has the write.',
        ),
      ],
    },
    {
      title: 'Know what overlap does not prove',
      explanation: [
        'Overlap only says that some replica in the read set holds the write. The reader still needs version numbers to recognise the newest response. A write that failed after reaching some replicas, concurrent writes, and stand-in replicas used during outages (outside the usual N) can all produce surprising results.',
        'In particular, quorums alone do not make the system linearizable: behaving as if there were a single copy in which each operation takes effect at one instant, so every read after a completed write sees it.',
      ],
      example: scenario(
        'N = 3, W = 2, R = 2. A write of version 2 reaches replica A only, because B and C fail, so the write reports failure. Later a reader asks A and B and receives version 2 and version 1.',
        'The overlap rule holds, yet the “failed” write is visible to some readers and not others. The protocol needs version numbers and a way to repair or roll back partial writes.',
        'R + W > N is a statement about set sizes, not a complete consistency guarantee.',
      ),
      questions: [
        choose(
          'A read receives version 7 from one replica and version 6 from another. What does the reader need to choose correctly?',
          [
            'The response that arrived first',
            'The response from the faster replica',
            'Version numbers that identify the newest value',
            'A vote among the values',
          ],
          2,
          'Overlap guarantees a newest copy is present, not which one it is.',
        ),
        choose(
          'A write reaches only 1 of the W = 2 replicas it needs and is reported as failed. What may later reads see?',
          [
            'Always the old value',
            'Always the new value',
            'An error',
            'Either value, depending on which replicas they ask',
          ],
          3,
          'The partial write sits on one replica and is not rolled back automatically.',
        ),
        choose(
          'During an outage, writes go to stand-in replicas outside a record’s usual N. Why can R + W > N stop guaranteeing overlap?',
          [
            'Reads and writes may no longer be drawn from the same N replicas',
            'The arithmetic changes during outages',
            'Stand-in replicas are faster',
            'It always still holds',
          ],
          0,
          'The counting argument only works within one fixed replica set.',
        ),
        choose(
          'Which claim follows from R + W > N alone?',
          [
            'Every read sees every completed write, as if there were one copy',
            'Each read set shares a replica with each write set drawn from the same N',
            'Concurrent writes cannot conflict',
            'No replica can fail',
          ],
          1,
          'It is a fact about overlapping sets; stronger guarantees need more protocol.',
        ),
      ],
    },
  ],

  'ds-partitioning': [
    {
      title: 'Split data versus copy data',
      explanation: [
        'Sharding, also called partitioning, splits a dataset so that each shard owns a different subset of the records. Replication copies the same subset to several nodes. Sharding addresses data or load too large for one node; replication addresses losing a node.',
        'They combine: with 4 shards and 3 replicas each, every record lives on 3 nodes, and the cluster stores 3 copies of everything.',
      ],
      example: {
        code: 'records = 1200000\nshards = 4\nreplicas = 3\nprint(records // shards)\nprint(records * replicas)',
        output: '300000\n3600000',
        explanation:
          'Each shard owns a quarter of the records, and the cluster stores every record three times.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'records = 900\nshards = 3\nreplicas = 2\nprint(records // shards)\nprint(records * replicas)',
          ['450\n1800', '300\n600', '900\n1800', '300\n1800'],
          3,
          'Each of 3 shards owns 300 records, and every record is stored twice.',
        ),
        choose(
          'A cluster has 6 shards, each with 3 replicas. On how many nodes does a single record live?',
          ['1', '3', '6', '18'],
          1,
          'A record belongs to one shard, which is copied to 3 nodes.',
        ),
        choose(
          'Which statement is right?',
          [
            'Sharding copies all data to every node',
            'Replication splits data into subsets',
            'Sharding spreads different records; replication copies the same records',
            'They are the same mechanism',
          ],
          2,
          'One divides ownership; the other adds redundant copies.',
        ),
        choose(
          'A dataset outgrows one machine’s disk. Which mechanism addresses that?',
          ['Sharding', 'Replication', 'Adding indexes', 'Read-your-writes'],
          0,
          'Only splitting the data reduces what each node must store.',
        ),
      ],
    },
    {
      title: 'Route requests by partition key',
      explanation: [
        'The partition key decides which shard owns each record, through a routing rule such as key % number_of_shards. A query that includes the key goes to exactly one shard.',
        'A query without the key must ask every shard and combine their answers (scatter-gather), which costs more as the number of shards grows.',
      ],
      example: scenario(
        'Workshops are sharded by organizer_id across 8 shards. Query 1 asks for organizer 42’s workshops; query 2 asks for every workshop in Lima.',
        'Query 1 goes to one shard. Query 2 goes to all 8 shards, and their results are merged.',
        'Queries that carry the partition key stay cheap; others pay for every shard.',
      ),
      questions: [
        predictOutput(
          'Records are routed with key % shards. What does this program print?',
          'shards = 4\nfor key in [10, 11, 14]:\n    print(key % shards)',
          ['10\n11\n14', '2\n3\n3', '2\n3\n2', '0\n1\n2'],
          2,
          '10 % 4 = 2, 11 % 4 = 3 and 14 % 4 = 2.',
        ),
        choose(
          'Orders are sharded by customer_id across 10 shards. How many shards does “total revenue for product P across all customers” query?',
          ['1', '2', '0', '10'],
          3,
          'The query does not include customer_id, so every shard must answer.',
        ),
        choose(
          'Orders are sharded by customer_id. Which query is cheapest?',
          [
            'All orders placed on 3 May',
            'All orders of customer 77',
            'Orders above \\$500',
            'Order counts per country',
          ],
          1,
          'It names the partition key, so one shard answers.',
        ),
        choose(
          'Why does a scatter-gather query get more expensive as shards grow from 4 to 40?',
          [
            'It must contact every shard and merge more partial results',
            'Each shard becomes slower',
            'Keys become longer',
            'It does not',
          ],
          0,
          'Its cost grows with the number of shards it must visit.',
        ),
      ],
    },
    {
      title: 'Choose the key from access patterns and sizes',
      explanation: [
        'Pick a partition key that (1) the frequent queries include, keeping related records on one shard, and (2) spreads data and traffic evenly.',
        'A key that groups too much can overload a shard. Partitioning by tenant (a customer organisation whose data is kept together) is convenient, but one huge tenant then lands entirely on one shard.',
      ],
      example: {
        code: 'largest = 482000\nothers = [5000, 7000, 6000]\ntotal = largest\nfor rows in others:\n    total = total + rows\nprint(largest * 100 // total)',
        output: '96',
        explanation:
          'One tenant holds 96% of all rows, so partitioning by tenant would put almost everything on one shard.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'largest = 600\nothers = [100, 300]\ntotal = largest\nfor rows in others:\n    total = total + rows\nprint(largest * 100 // total)',
          ['600', '60', '33', '6'],
          1,
          'The largest group holds 600 of 1,000 rows: 60%.',
        ),
        choose(
          'A chat app’s main query is “messages in conversation C, newest first”. Which partition key keeps that query on one shard?',
          [
            'message_id',
            'The sender’s country',
            'conversation_id',
            'The timestamp',
          ],
          2,
          'All of a conversation’s messages then share a shard.',
        ),
        choose(
          'One tenant holds 70% of all data, and the data is partitioned by tenant_id. What is the risk?',
          [
            'Other tenants grow larger',
            'Every query must visit all shards',
            'Nothing',
            'One shard holds most of the data and load',
          ],
          3,
          'Grouping by tenant puts the giant tenant on a single shard.',
        ),
        choose(
          'Why is country a weak partition key for a global app with 60% of its users in one country?',
          [
            'One shard would receive most records and traffic',
            'Countries change every day',
            'Country is not a string',
            'It is a strong key',
          ],
          0,
          'Skewed key values make skewed shards.',
        ),
      ],
    },
  ],

  'ds-hash-range': [
    {
      title: 'Assign ranges of keys to shards',
      explanation: [
        'Range sharding gives each shard a contiguous interval of keys, such as A–F, G–M, N–S and T–Z. Neighbouring keys stay together, so a range query, like all keys in one hour of timestamps, reads one shard.',
        'Keys that arrive in increasing order, such as timestamps or auto-increment IDs, all land in the last range, which turns that shard into a write hot spot.',
      ],
      example: {
        code: 'boundaries = [100, 200, 300]\nkey = 250\nshard = 0\nfor b in boundaries:\n    if key >= b:\n        shard = shard + 1\nprint(shard)',
        output: '2',
        explanation:
          'Shard 0 owns keys below 100, shard 1 owns 100–199, shard 2 owns 200–299 and shard 3 owns 300 and above. 250 passes two boundaries.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'boundaries = [100, 200, 300]\nkey = 99\nshard = 0\nfor b in boundaries:\n    if key >= b:\n        shard = shard + 1\nprint(shard)',
          ['1', '99', '0', '3'],
          2,
          '99 is below every boundary, so it stays in the first range.',
        ),
        predictOutput(
          'What does this program print?',
          'boundaries = [100, 200, 300]\nkey = 300\nshard = 0\nfor b in boundaries:\n    if key >= b:\n        shard = shard + 1\nprint(shard)',
          ['2', '300', '1', '3'],
          3,
          'A key equal to a boundary belongs to the range that starts there.',
        ),
        choose(
          'Sensor readings are range-sharded by timestamp. Where do all new writes go?',
          [
            'To the shard owning the newest range',
            'Evenly across all shards',
            'To the first shard',
            'To a random shard',
          ],
          0,
          'New timestamps always fall at the end of the key space.',
        ),
        choose(
          'Events are range-sharded by date. Which query does that serve well?',
          [
            'Events with odd IDs',
            'All events from 1 to 7 March',
            'Events by user U across all dates',
            'Events whose title contains jazz',
          ],
          1,
          'Consecutive dates sit together on one shard or a few.',
        ),
      ],
    },
    {
      title: 'Spread keys with a stable hash',
      explanation: [
        'A hash function turns a key into a number that looks unrelated to the key’s order, and the same key always gives the same number. Hash sharding sends key k to shard hash(k) % S. In the programs here the keys are already numbers and stand in for their hashes.',
        'Sequential keys scatter across shards, spreading writes, but a range query must now visit every shard. Every router must compute the same hash: Python’s built-in hash() of a string changes between processes, so it is unsuitable for routing.',
      ],
      example: {
        code: 'shards = 4\nfor key in [1000, 1001, 1002, 1003]:\n    print(key % shards)',
        output: '0\n1\n2\n3',
        explanation:
          'Four consecutive keys land on four different shards, so a burst of new keys spreads out.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'shards = 3\nfor key in [7, 8, 9, 10]:\n    print(key % shards)',
          ['7\n8\n9\n10', '1\n2\n3\n4', '1\n2\n0\n1', '2\n1\n0\n2'],
          2,
          'Each key’s remainder after dividing by 3 picks its shard.',
        ),
        choose(
          'Orders are hash-sharded by order date. Why is “all orders from 1 to 7 March” expensive?',
          [
            'Hashing deletes the dates',
            'Hashes are slow to compute',
            'It is not expensive',
            'Consecutive dates are scattered, so every shard must be asked',
          ],
          3,
          'Hashing destroys the ordering a range query relies on.',
        ),
        choose(
          'Two routers each run Python’s hash() on string keys in their own process. What can happen?',
          [
            'They send the same key to different shards',
            'Nothing, because hash() is stable',
            'The keys become encrypted',
            'Every write is duplicated',
          ],
          0,
          'String hashing is randomised per process, so the routers can disagree.',
        ),
        choose(
          'Auto-increment order IDs create a hot spot under range sharding. What does hash sharding change?',
          [
            'New IDs all go to shard 0',
            'New IDs spread across all shards',
            'IDs stop increasing',
            'Nothing',
          ],
          1,
          'Consecutive IDs hash to different shards.',
        ),
      ],
    },
    {
      title: 'Choose by the queries',
      explanation: [
        'Range sharding keeps order, which suits ranges, time windows and sorted scans, but risks hot spots for sequential keys. Hash sharding spreads keys evenly but loses their order.',
        'A common compound key hashes a leading part, such as user_id, to spread users, and keeps order within it, such as by timestamp, so “user U’s events this week” stays on one shard and in order.',
      ],
      example: scenario(
        'Events are keyed by (user_id, ts). The main query reads one user’s events in a time window.',
        'Hash on user_id to choose the shard, and sort by ts within the shard.',
        'Users are spread across shards, and each user’s events stay together in time order.',
      ),
      questions: [
        choose(
          'The main query is “all log lines between 10:00 and 10:05”, with a moderate write rate. Which scheme suits it?',
          [
            'Hash by log ID',
            'Hash by timestamp',
            'Random placement',
            'Range by timestamp',
          ],
          3,
          'A time range then reads one or a few neighbouring shards.',
        ),
        choose(
          'The main query is “get session by session_id”, and new sessions with increasing IDs arrive at a very high rate. Which scheme suits it?',
          [
            'Hash by session_id',
            'Range by session_id',
            'Range by creation time',
            'A single shard',
          ],
          0,
          'Point lookups need no order, and hashing spreads the sequential IDs.',
        ),
        choose(
          'Data is keyed by (user_id, ts), hashed on user_id and ordered by ts. Which query stays on one shard?',
          [
            'All events from last week',
            'Events at noon for every user',
            'User 5’s events from last week',
            'The number of distinct users',
          ],
          2,
          'All of user 5’s events share a shard and are ordered by time.',
        ),
        choose(
          'Does hashing keys guarantee each shard receives equal traffic?',
          [
            'Yes, always',
            'No, one very popular key still goes to a single shard',
            'Yes, if the keys are numbers',
            'No, hashing puts every key on one shard',
          ],
          1,
          'Hashing balances keys, not how often each key is requested.',
        ),
      ],
    },
  ],

  'ds-hotspots': [
    {
      title: 'Separate key balance from load balance',
      explanation: [
        'Even when every shard owns the same number of keys, load follows requests, not keys. A celebrity profile or a viral post can receive most requests, making its shard a hot spot while the others idle.',
        'Measure requests, and bytes, per shard and per key to find where the work comes from.',
      ],
      example: {
        code: 'hot = 4100\nothers = [120, 95, 110]\ntotal = hot\nfor r in others:\n    total = total + r\nprint(total)\nprint(hot * 100 // total)',
        output: '4425\n92',
        explanation:
          'The hot shard serves 92% of all requests, although each shard owns the same number of keys.',
      },
      questions: [
        predictOutput(
          'Each number is one shard’s requests per second. What does this program print?',
          'hot = 300\nothers = [50, 50, 100]\ntotal = hot\nfor r in others:\n    total = total + r\nprint(hot * 100 // total)',
          ['300', '25', '75', '60'],
          3,
          'The hot shard handles 300 of 500 requests: 60%.',
        ),
        predictOutput(
          'What does this program print?',
          'keys_hot_shard = 250\nkeys_other_shard = 250\nrequests_hot_shard = 970\nrequests_other_shard = 10\nprint(keys_hot_shard == keys_other_shard)\nprint(requests_hot_shard // requests_other_shard)',
          ['True\n97', 'False\n97', 'True\n1', 'False\n1'],
          0,
          'The shards own equal numbers of keys, yet the hot shard gets 97 times the traffic.',
        ),
        choose(
          'Shards own equal numbers of keys, but shard 3 runs at 95% CPU while the others sit at 10%. What is the most likely cause?',
          [
            'Shard 3 owns more keys',
            'The hash function stopped working',
            'A few keys on shard 3 receive most of the requests',
            'Shard 3 has less memory',
          ],
          2,
          'Equal key counts rule out key imbalance, leaving request skew.',
        ),
        choose(
          'Which measurement pinpoints a hot key?',
          [
            'Keys per shard',
            'Requests per key',
            'Average key length',
            'Disk size per shard',
          ],
          1,
          'Only per-key request counts show which keys attract the load.',
        ),
      ],
    },
    {
      title: 'Relieve read hot spots with caches and replicas',
      explanation: [
        'A record read far more often than it changes can be served from a cache or from extra read replicas, spreading its reads across many nodes.',
        'The cost is freshness: cached copies can be stale until they expire or are invalidated. Adding shards does not help a single hot key, because one key still lives on one shard.',
      ],
      example: scenario(
        'A product page receives 20,000 reads per second; one node can serve 5,000.',
        'At least 4 nodes must serve it, for example a cache layer or 4 read replicas, with a short staleness window accepted.',
        'Copies of one record can share its reads; more shards cannot.',
      ),
      questions: [
        predictOutput(
          'This program computes how many nodes a hot record’s reads need, rounding up. What does it print?',
          'reads = 18000\nper_node = 4000\nnodes = (reads + per_node - 1) // per_node\nprint(nodes)',
          ['4', '4.5', '18000', '5'],
          3,
          'Four nodes serve 16,000 reads, so a fifth is needed; adding per_node − 1 before dividing rounds up.',
        ),
        choose(
          'A post receives 100,000 reads per second and 2 edits per hour. Which remedy fits?',
          [
            'Cache it with a short expiry or invalidate the cache on each edit',
            'Split it into 10 keys to spread writes',
            'Move it to range sharding',
            'Refuse some reads',
          ],
          0,
          'The load is reads of a rarely changing record, which caching absorbs.',
        ),
        choose(
          'What does caching a hot record trade?',
          [
            'More writes for fresher reads',
            'Durability for speed',
            'Fewer reads on its shard for possible staleness',
            'Nothing',
          ],
          2,
          'Readers may see the cached version until it is refreshed.',
        ),
        choose(
          'Why doesn’t adding more shards fix a single hot key?',
          [
            'More shards slow down every read',
            'The key still lives on one shard',
            'Keys move randomly between shards',
            'It does fix it',
          ],
          1,
          'Sharding spreads keys, and this load comes from one key.',
        ),
      ],
    },
    {
      title: 'Split a hot write key',
      explanation: [
        'Reads can be copied, but writes to one key cannot. To spread writes on a hot counter, split it into k sub-keys and send each write to one of them; the total is the sum of all sub-keys.',
        'Writes then spread k ways, but every read must combine k values, and rules about the total, such as never dropping below zero, need extra coordination because no sub-key sees the others.',
      ],
      example: {
        code: 'parts = {0: 0, 1: 0, 2: 0, 3: 0}\nfor write in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]:\n    parts[write % 4] = parts[write % 4] + 1\nprint(parts)\nprint(parts[0] + parts[1] + parts[2] + parts[3])',
        output: '{0: 3, 1: 3, 2: 2, 3: 2}\n10',
        explanation:
          'Ten numbered writes rotate across four sub-keys by write % 4. Reading the total means adding all four parts.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'parts = {0: 0, 1: 0, 2: 0}\nfor write in [0, 1, 2, 3, 4, 5, 6]:\n    parts[write % 3] = parts[write % 3] + 1\nprint(parts)',
          [
            '{0: 2, 1: 2, 2: 3}',
            '{0: 3, 1: 2, 2: 2}',
            '{0: 7, 1: 0, 2: 0}',
            '{0: 2, 1: 3, 2: 2}',
          ],
          1,
          'Writes 0, 3 and 6 go to sub-key 0; the others get two each.',
        ),
        predictOutput(
          'What does this program print?',
          'parts = [12, 9, 15, 4]\ntotal = 0\nfor p in parts:\n    total = total + p\nprint(total)',
          ['15', '4', '40', '10'],
          2,
          'The logical counter is the sum of its parts.',
        ),
        choose(
          'A counter is split into 8 sub-keys. What does reading its total cost?',
          [
            'Reading 1 value',
            'Nothing extra',
            'Rewriting all 8 values',
            'Reading and adding 8 values',
          ],
          3,
          'The split moved work from writers to readers.',
        ),
        choose(
          'Why is splitting fine for a like counter but harder for “remaining seats”, which must never go below 0?',
          [
            'Each sub-key cannot see the others, so a rule about the total needs coordination',
            'Seats cannot be stored as numbers',
            'Sub-keys always overflow',
            'It is equally easy',
          ],
          0,
          'Two sub-keys could each allow the last seat to be sold.',
        ),
      ],
    },
  ],

  'ds-rebalancing': [
    {
      title: 'Avoid moving everything with key % N',
      explanation: [
        'If records are placed with key % N, where N is the number of nodes, changing N changes the owner of most keys. Going from 4 to 5 nodes moves about 80% of the data.',
        'Rebalancing should move only what balance requires: when a fifth equal node joins, about one fifth of the data.',
      ],
      example: {
        code: 'keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]\nmoved = 0\nfor key in keys:\n    if key % 4 != key % 5:\n        moved = moved + 1\nprint(moved)',
        output: '16',
        explanation:
          'Only keys 0 to 3 keep the same owner when N changes from 4 to 5; 16 of 20 keys, 80%, must move.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]\nmoved = 0\nfor key in keys:\n    if key % 2 != key % 3:\n        moved = moved + 1\nprint(moved)',
          ['4', '6', '12', '8'],
          3,
          'Only keys whose remainders match for 2 and 3 stay put; 8 of 12 move.',
        ),
        predictOutput(
          'What does this program print?',
          'keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]\nmoved = 0\nfor key in keys:\n    if key % 3 != key % 5:\n        moved = moved + 1\nprint(moved)',
          ['3', '12', '5', '15'],
          1,
          'Only keys 0, 1 and 2 keep their node when going from 3 to 5 nodes, so 12 of 15 move.',
        ),
        choose(
          'Going from 9 to 10 nodes with key % N placement moves about what share of keys?',
          ['About 10%', 'None', 'About 90%', 'Exactly 50%'],
          2,
          'Almost every key gets a different remainder.',
        ),
        choose(
          'A fifth equally sized node joins four others. What is the minimum share of data that must move to balance them?',
          ['About 80%', '100%', '0%', 'About 20%'],
          3,
          'The new node should end up with one fifth of the data.',
        ),
      ],
    },
    {
      title: 'Move fixed logical shards between nodes',
      explanation: [
        'Create many more logical shards than nodes from the start, such as 1,000 shards on 10 nodes, and assign each key to a shard permanently, for example hash(key) % 1000.',
        'Rebalancing then moves whole shards between nodes and updates a small routing table; no key ever changes shard. The limits: the shard count is fixed up front, and one shard cannot be spread over several nodes.',
      ],
      example: {
        code: 'shards = 12\nper_node_before = shards // 3\nper_node_after = shards // 4\nmoved = per_node_after\nprint(per_node_before, per_node_after, moved)',
        output: '4 3 3',
        explanation:
          'With 3 nodes each holds 4 shards. A fourth node takes 3 whole shards, one from each existing node, and everything else stays put.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'shards = 100\nprint(shards // 4)\nprint(shards // 5)',
          ['20\n25', '25\n20', '25\n25', '4\n5'],
          1,
          'Each of 4 nodes holds 25 shards; with 5 nodes, 20 each, so the new node receives 20 whole shards.',
        ),
        choose(
          'A cluster uses 1,000 fixed logical shards, and a new node joins. What changes?',
          [
            'Some whole shards move to it, and the routing table is updated',
            'Every key is assigned a new shard number',
            'The hash function changes',
            'Nothing moves',
          ],
          0,
          'Keys keep their shards; only shard placement changes.',
        ),
        choose(
          'Why create far more logical shards than nodes at the start?',
          [
            'To use more disk space',
            'To make keys larger',
            'So shards can move between nodes without re-splitting keys',
            'Because a node cannot hold more than one shard',
          ],
          2,
          'Spare shards are the units that rebalancing moves.',
        ),
        choose(
          'What is a limit of fixed logical shards?',
          [
            'Shards can never move',
            'They require key % N placement',
            'There is no limit',
            'The count is fixed up front, and one shard cannot be spread over several nodes',
          ],
          3,
          'A shard that grows too large for one node needs another remedy.',
        ),
      ],
    },
    {
      title: 'Move a live shard safely',
      explanation: [
        'Moving a shard while it takes writes: (1) copy a snapshot to the new node; (2) stream and apply the changes made since the snapshot until the copy catches up; (3) briefly pause writes and switch routing so the new node becomes the owner; (4) verify the destination, for example with row counts or checksums, before retiring the old copy.',
        'Skipping step 2 loses the writes made during the copy, and a careless switch can leave two nodes accepting writes for the same shard.',
      ],
      example: scenario(
        'A snapshot of 1,000,000 rows is taken at 10:00. Copying takes 20 minutes, and 300 writes per minute arrive meanwhile.',
        '6,000 writes arrived during the copy; they must be replayed on the new node before routing switches.',
        'The snapshot alone is already out of date when the copy finishes.',
      ),
      questions: [
        predictOutput(
          'What does this program print?',
          'copy_minutes = 15\nwrites_per_minute = 240\nprint(copy_minutes * writes_per_minute)',
          ['255', '3600', '240', '15'],
          1,
          'Every minute of copying adds 240 writes that the snapshot does not contain.',
        ),
        choose(
          'Routing switches to the new node as soon as the snapshot copy finishes, without replaying later changes. What happens?',
          [
            'Nothing',
            'The old node is deleted',
            'Writes made during the copy are missing on the new owner',
            'Writes are applied twice',
          ],
          2,
          'Those writes exist only on the old node.',
        ),
        choose(
          'Before deleting the old copy of a moved shard, what should be checked?',
          [
            'That the new copy is complete and routing points to it',
            'That the old node is slower',
            'That every client restarted',
            'Nothing',
          ],
          0,
          'Retiring the source too early can lose data or strand requests.',
        ),
        choose(
          'During the switch, what must the transition prevent?',
          [
            'Taking snapshots',
            'Serving any reads',
            'Updating the routing table',
            'Two nodes both accepting writes for the shard',
          ],
          3,
          'Two owners would accept conflicting writes.',
        ),
      ],
    },
  ],

  'ds-atomicity': [
    {
      title: 'Apply a group of changes all or nothing',
      explanation: [
        'A transaction groups several writes between BEGIN and COMMIT. Atomicity means either all of them take effect (commit) or none do (abort, also called rollback), even if the process crashes halfway.',
        'Without it, a crash between “remove the old room assignment” and “add the new one” leaves a booking in no room at all.',
      ],
      example: {
        code: 'balances = {"ana": 100, "ben": 50}\nnew_ana = balances["ana"] - 30\nnew_ben = balances["ben"] + 30\ncommitted = False\nif committed:\n    balances["ana"] = new_ana\n    balances["ben"] = new_ben\nprint(balances)',
        output: "{'ana': 100, 'ben': 50}",
        explanation:
          'The transfer’s two changes are applied together only at commit. This transaction never committed, so neither balance changed.',
      },
      questions: [
        choose(
          'A transfer debits account A, and the server crashes before crediting account B. With atomicity, what is the state after recovery?',
          [
            'A is debited and B is not credited',
            'Both changes are applied',
            'Neither change is applied',
            'B is credited twice',
          ],
          2,
          'The unfinished transaction is rolled back as a whole.',
        ),
        choose(
          'A transaction inserts 3 rows; the third breaks a rule, and the transaction aborts. How many of its rows remain?',
          ['2', '3', '1', '0'],
          3,
          'Aborting undoes every change in the transaction.',
        ),
        predictOutput(
          'What does this program print?',
          'balances = {"ana": 100, "ben": 50}\nnew_ana = balances["ana"] - 30\nnew_ben = balances["ben"] + 30\ncommitted = True\nif committed:\n    balances["ana"] = new_ana\n    balances["ben"] = new_ben\nprint(balances)',
          [
            "{'ana': 70, 'ben': 80}",
            "{'ana': 100, 'ben': 50}",
            "{'ana': 70, 'ben': 50}",
            "{'ana': 130, 'ben': 20}",
          ],
          0,
          'At commit, both changes are applied together.',
        ),
        choose(
          'Which pair of writes most needs to be in one transaction?',
          [
            'Logging a page view and logging a search',
            'Decreasing stock and creating the order line',
            'Two unrelated user sign-ups',
            'Reading a profile twice',
          ],
          1,
          'Doing only one of them would leave stock and orders inconsistent.',
        ),
      ],
    },
    {
      title: 'Keep committed results through crashes',
      explanation: [
        'Durability means that once COMMIT returns, the result survives the failures the system promises to handle, typically a crash or power loss, because the data reached disk (and perhaps replicas) before COMMIT returned.',
        'It covers committed results only, and only for the stated failures; losing every disk and every backup is outside the promise.',
      ],
      example: scenario(
        'COMMIT returned at 10:00:01. The power fails at 10:00:02 while another transaction is still in progress.',
        'After restart, the committed transaction’s writes are present; the unfinished transaction leaves no trace.',
        'Durability protects the first; atomicity governs the second.',
      ),
      questions: [
        choose(
          'Power fails one second after COMMIT returned. After restart, the transaction’s writes are…',
          ['present', 'lost', 'half present', 'rolled back'],
          0,
          'A committed result must survive a crash.',
        ),
        choose(
          'Power fails while a transaction is in progress, before COMMIT. After restart, its writes are…',
          ['present', 'half present', 'duplicated', 'absent'],
          3,
          'Uncommitted work is undone.',
        ),
        choose(
          'Which property says that a half-finished transaction leaves no trace?',
          ['Durability', 'Replication', 'Atomicity', 'Sharding'],
          2,
          'All or nothing is atomicity; durability concerns committed results.',
        ),
        choose(
          'To be faster, a database confirms COMMIT before writing anything to disk. What does it give up?',
          [
            'Atomicity',
            'Durability, because a crash can lose committed writes',
            'Nothing',
            'Read speed',
          ],
          1,
          'The confirmed result exists only in memory until it is saved.',
        ),
      ],
    },
    {
      title: 'Know the transaction’s boundary',
      explanation: [
        'A database enforces only the rules it is told. Constraints are rules the database checks on every write, such as a unique email, stock ≥ 0, or a reference that must point to an existing row. Business rules that are not constraints, and not checked inside the transaction, are not protected.',
        'Rollback undoes database changes only. An email sent or a payment API called during the transaction stays done, so trigger external effects after commit.',
      ],
      example: scenario(
        'A transaction creates an order, sends a confirmation email, then decrements stock, which fails because stock would become −1, so the transaction aborts.',
        'The order and the stock change roll back, but the email has already been sent. Send the email after commit instead.',
        'The email is outside the database, so atomicity cannot undo it.',
      ),
      questions: [
        choose(
          'Which rule does the database enforce automatically?',
          [
            '“VIP customers get free shipping”, written in a wiki',
            'A UNIQUE constraint declared on email',
            'A rule checked only in a different service',
            'A rule described in a code comment',
          ],
          1,
          'Only declared constraints are checked by the database itself.',
        ),
        choose(
          'A transaction calls a payment API and then aborts. What happens to the charge?',
          [
            'It is refunded automatically',
            'It never happened',
            'It is retried',
            'It stays, because rollback cannot undo external calls',
          ],
          3,
          'The payment provider is outside the transaction.',
        ),
        choose(
          'When should a welcome email be triggered?',
          [
            'After the sign-up transaction commits',
            'Before BEGIN',
            'In the middle of the transaction',
            'Never',
          ],
          0,
          'Only then is it certain the account exists.',
        ),
        choose(
          'An order is inserted in one transaction, and stock is decremented in a second transaction, which fails. What remains?',
          [
            'Neither change',
            'Both changes',
            'The order without the stock change',
            'Only the stock change',
          ],
          2,
          'Separate transactions commit separately; only grouping them makes both atomic.',
        ),
      ],
    },
  ],

  'ds-isolation': [
    {
      title: 'Never read uncommitted data',
      explanation: [
        'Transactions run concurrently. A dirty read sees another transaction’s writes before it commits; if that transaction then aborts, the reader acted on data that never existed.',
        'Read committed, the most common baseline, prevents dirty reads: a transaction sees only values that other transactions have committed.',
      ],
      example: scenario(
        'T1 sets a price to 0 by mistake and has not committed. T2 reads the price. T1 then aborts.',
        'Under read committed, T2 reads the old, committed price, so nothing ever used the 0.',
        'A dirty read would have let T2 act on a value that was rolled back.',
      ),
      questions: [
        choose(
          'T1 has written balance = 0 but not committed. Under read committed, what does T2 read?',
          ['0', 'The last committed balance', 'An error', 'Half of each value'],
          1,
          'Uncommitted writes are invisible to other transactions.',
        ),
        choose(
          'Why is a dirty read dangerous?',
          [
            'Dirty reads are slow',
            'They delete data',
            'The writer may abort, so the value read never existed',
            'They lock the whole table',
          ],
          2,
          'Decisions based on rolled-back data have no valid basis.',
        ),
        choose(
          'T1 inserts an order and commits. T2, running read committed, then reads. What does T2 see?',
          [
            'Nothing until T2 restarts',
            'The order without its total',
            'An error',
            'The new order',
          ],
          3,
          'Committed data is visible to later reads.',
        ),
        choose(
          'Which anomaly does read committed prevent?',
          [
            'Dirty reads',
            'Two reads in one transaction seeing different committed values',
            'Replication lag',
            'Clock skew',
          ],
          0,
          'It guarantees only that what you read was committed.',
        ),
      ],
    },
    {
      title: 'Read a stable snapshot',
      explanation: [
        'Under read committed, each statement sees the latest committed data, so two reads in one transaction can see different states if another transaction commits between them.',
        'Snapshot isolation gives each transaction a consistent snapshot of the data as of its start: all its reads see the same committed state and ignore later commits. That suits reports and backups that read many rows.',
      ],
      example: scenario(
        'Accounts A = 500 and B = 500. A report reads A (500); then a transfer of 100 from A to B commits; then the report reads B.',
        'Under read committed, B reads 600 and the report totals 1,100, which is wrong. Under snapshot isolation, B reads 500 and the total is 1,000.',
        'The snapshot gives the report one consistent moment.',
      ),
      questions: [
        choose(
          'A report reads item X’s stock (20); another transaction commits X = 15; the report reads X again. Under read committed, what does the second read show?',
          ['20', '35', '15', 'An error'],
          2,
          'Each statement sees the latest committed value.',
        ),
        choose(
          'The same sequence runs under snapshot isolation. What does the second read show?',
          ['15', '20', '35', 'An error'],
          1,
          'The transaction keeps reading its snapshot from when it started.',
        ),
        choose(
          'Accounts C = 300 and D = 700. A report reads C, then a transfer of 200 from C to D commits, then the report reads D. What total does read committed give?',
          ['1,000', '800', '1,100', '1,200'],
          3,
          'C is read before the transfer (300) and D after it (900).',
        ),
        choose(
          'Why are long-running reports a good fit for snapshot isolation?',
          [
            'All their reads reflect one consistent moment',
            'They run faster',
            'They block all writers',
            'They can write freely',
          ],
          0,
          'Changes committed during the report cannot mix two states.',
        ),
      ],
    },
    {
      title: 'Check what an isolation name promises',
      explanation: [
        'Isolation level names are not used consistently: “repeatable read” means snapshot isolation in some databases and a lock-based scheme in others.',
        'Snapshot isolation also does not prevent every anomaly: two transactions can each act on their own snapshot and together break a rule. Read the database’s documentation, and test the anomaly you care about.',
      ],
      example: scenario(
        'Database X’s “repeatable read” is snapshot isolation; database Y’s uses locks. Both use the same name.',
        'Test the specific anomaly your application must avoid instead of trusting the label.',
        'Behaviour, not the name, determines what your transactions are protected from.',
      ),
      questions: [
        choose(
          'Two databases both offer “repeatable read”. What should you assume?',
          [
            'They behave identically',
            'Both are fully serial',
            'Their guarantees may differ, so check each one',
            'Neither prevents dirty reads',
          ],
          2,
          'The same name can hide different implementations.',
        ),
        choose(
          'Two doctors are on call, and at least one must remain. Each one’s transaction reads its snapshot, sees 2 on call, and takes that doctor off call. Under snapshot isolation, what can happen?',
          [
            'Only one doctor can leave',
            'Both transactions are blocked',
            'The check fails for both',
            'Both leave, and no doctor remains on call',
          ],
          3,
          'Each snapshot still shows the other doctor on call.',
        ),
        choose(
          'What is the most reliable way to confirm that a database prevents an anomaly you care about?',
          [
            'Write a concurrent test that tries to produce it',
            'Read the isolation level’s name',
            'Check CPU usage',
            'Ask whether the database supports SQL',
          ],
          0,
          'An actual concurrent test shows the real behaviour.',
        ),
        choose(
          'What does snapshot isolation guarantee?',
          [
            'Every rule spanning several rows holds under concurrency',
            'Each transaction’s reads see one consistent committed state',
            'No transaction ever aborts',
            'Every replica is current',
          ],
          1,
          'It guarantees a coherent view, not protection of every multi-row rule.',
        ),
      ],
    },
  ],

  'ds-lost-update': [
    {
      title: 'See how read-modify-write loses updates',
      explanation: [
        'Two clients read the same value, each computes a new value from it, and each writes it back. The second write overwrites the first, so one change disappears: a lost update.',
        'Each individual write was atomic. The problem is the gap between reading and writing, during which the value changed.',
      ],
      example: {
        code: 'counter = 10\na_read = counter\nb_read = counter\ncounter = a_read + 1\ncounter = b_read + 1\nprint(counter)',
        output: '11',
        explanation:
          'Both clients read 10 and wrote 11, so one of the two increments was lost; the counter should be 12.',
      },
      questions: [
        predictOutput(
          'Two clients each read stock and then write a new value. What does this program print?',
          'stock = 8\na_read = stock\nb_read = stock\nstock = a_read - 2\nstock = b_read - 3\nprint(stock)',
          ['3', '5', '6', '8'],
          1,
          'The second write is based on the stale 8, erasing the first change; the correct result would be 3.',
        ),
        predictOutput(
          'Three clients read likes before any of them writes. What does this program print?',
          'likes = 40\nreads = [likes, likes, likes]\nfor r in reads:\n    likes = r + 1\nprint(likes)',
          ['43', '42', '40', '41'],
          3,
          'Every write is computed from 40, so only one increment survives.',
        ),
        choose(
          'Two editors read a document at revision 4, and both save full replacements. What is lost?',
          [
            'Nothing',
            'Revision 4',
            'The first saver’s changes',
            'Both editors’ changes',
          ],
          2,
          'The second replacement does not contain the first editor’s work.',
        ),
        choose(
          'Each individual write in a lost update is atomic. Why is an update still lost?',
          [
            'Each write was computed from a value that had already changed',
            'Atomic writes can be partial',
            'A disk failed',
            'Reads are never atomic',
          ],
          0,
          'Atomic writes do not protect the read that came before them.',
        ),
      ],
    },
    {
      title: 'Use atomic operations',
      explanation: [
        'Let the database compute the change from the current value in one operation: UPDATE counters SET n = n + 1 WHERE id = 7. The read and the write happen together, so concurrent increments all count.',
        'This works when the change can be expressed as an operation on the current value, such as adding, subtracting or appending, but not for replacing a whole edited document.',
      ],
      example: {
        code: 'counter = 10\ncounter = counter + 1\ncounter = counter + 1\nprint(counter)',
        output: '12',
        explanation:
          'Each increment is applied to the current value at the moment it runs, so both count.',
      },
      questions: [
        predictOutput(
          'Each deposit is applied atomically to the current balance. What does this program print?',
          'balance = 100\ndeposits = [20, 30, 50]\nfor d in deposits:\n    balance = balance + d\nprint(balance)',
          ['150', '120', '200', '100'],
          2,
          'Each deposit builds on the result of the previous one.',
        ),
        choose(
          'Which statement avoids losing concurrent increments?',
          [
            'Read likes, add 1 in the application, then UPDATE likes to that value',
            'Cache likes and write it back every hour',
            'Delete and re-insert the row',
            'UPDATE posts SET likes = likes + 1 WHERE id = 9',
          ],
          3,
          'The database applies each increment to the current value.',
        ),
        choose(
          'Why can’t “set the title to the edited text” be fixed with an atomic increment-style operation?',
          [
            'The new title is a replacement, not an operation on the current value',
            'Titles cannot be updated',
            'Increments only work on text',
            'It can',
          ],
          0,
          'There is no “current title plus something” to compute.',
        ),
        choose(
          'Stock is 5. Two atomic “stock = stock − 1” updates run concurrently. What is the result?',
          ['4', '3', '5', '2'],
          1,
          'Both decrements apply to the current value.',
        ),
      ],
    },
    {
      title: 'Detect conflicts with compare-and-swap',
      explanation: [
        'Compare-and-swap writes only if the value, or a version number, is still what the client read: UPDATE docs SET body = ?, version = 5 WHERE id = 1 AND version = 4. If someone else saved first, the version is already 5, so the write changes nothing.',
        'A failed compare means the client’s input was stale: re-read, then merge, retry or report the conflict. Never resend the same stale write blindly.',
      ],
      example: {
        code: 'stored_version = 4\nalice_read = 4\nbob_read = 4\nalice_ok = alice_read == stored_version\nif alice_ok:\n    stored_version = stored_version + 1\nbob_ok = bob_read == stored_version\nprint(alice_ok, bob_ok, stored_version)',
        output: 'True False 5',
        explanation:
          'Alice saves first and bumps the version to 5. Bob still expects version 4, so his write is rejected instead of overwriting Alice’s.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'stored = 7\nx_read = 7\ny_read = 6\ny_ok = y_read == stored\nif y_ok:\n    stored = stored + 1\nx_ok = x_read == stored\nif x_ok:\n    stored = stored + 1\nprint(y_ok, x_ok, stored)',
          ['True True 9', 'False False 7', 'True False 8', 'False True 8'],
          3,
          'y read an old version and is rejected; x read the current version and succeeds.',
        ),
        choose(
          'A compare-and-swap write fails because the version changed. What is the right next step?',
          [
            'Resend the same write until it succeeds',
            'Ignore the failure',
            'Re-read the current value, then merge, retry or report a conflict',
            'Delete the record',
          ],
          2,
          'The client’s view was stale, so its change must be reconsidered.',
        ),
        choose(
          'Why compare a version number rather than the value itself?',
          [
            'A version detects any change in between, even one that restored the same value',
            'Versions are shorter to type',
            'Values cannot be compared',
            'SQL requires it',
          ],
          0,
          'A value can change and change back; the version still records that it moved.',
        ),
        choose(
          'Two editors both save changes based on revision 12, with revision checks enabled. What happens?',
          [
            'Both saves succeed',
            'The first save succeeds; the second is rejected as stale',
            'Both saves fail',
            'The second save overwrites the first',
          ],
          1,
          'After the first save, the record is no longer at revision 12.',
        ),
      ],
    },
  ],

  'ds-serializable': [
    {
      title: 'Spot write skew',
      explanation: [
        'Write skew: two transactions read the same set of rows, each makes a decision from what it read, and each writes a different row. Separately each is fine; together they break a rule that spans several rows.',
        'Snapshot isolation does not stop it, because no row is written twice, and so nothing looks like a conflict.',
      ],
      example: scenario(
        'Rule: at least 1 doctor on call. Ana and Ben are on call. T1 (Ana) reads 2 on call and takes Ana off; T2 (Ben) reads 2 on call and takes Ben off. Both commit.',
        'No doctor is on call, and the rule is broken, although no row was updated twice.',
        'Each transaction’s check was true on its own snapshot, but not after the other committed.',
      ),
      questions: [
        choose(
          'A room holds one booking per hour. Two transactions each check that no booking exists at 3pm, then each inserts one. What is the result?',
          [
            'One booking, because the second waits',
            'A lost update',
            'A dirty read',
            'Two bookings at 3pm: write skew',
          ],
          3,
          'Both checks passed on the same earlier state, and different rows were inserted.',
        ),
        choose(
          'How does write skew differ from a lost update?',
          [
            'The transactions write different rows',
            'The transactions write the same row',
            'One transaction reads uncommitted data',
            'There is no difference',
          ],
          0,
          'In a lost update, both write one row; in write skew, each writes its own.',
        ),
        choose(
          'Rule: a user holds at most 3 seats. The user holds 2. Two transactions each read 2 and insert one more hold. How many holds exist after both commit?',
          ['3', '2', '4', '5'],
          2,
          'Each saw room for one more, so both inserted.',
        ),
        choose(
          'Which rule is vulnerable to write skew?',
          [
            'A single row’s counter increments by 1',
            'At most 5 seats sold per row of the theatre, recorded as separate booking rows',
            'An email column must contain @',
            'A primary key must be unique',
          ],
          1,
          'The rule depends on a count across rows that concurrent inserts change.',
        ),
      ],
    },
    {
      title: 'Reason about serializable outcomes',
      explanation: [
        'Serializable isolation guarantees that the committed transactions have the same result as running them one at a time in some order. In the on-call example, any serial order lets the first doctor leave and stops the second, who would see only one doctor on call.',
        'Databases achieve this with locks or by detecting conflicts and aborting a transaction, so applications must expect some aborts and lower throughput.',
      ],
      example: scenario(
        'The two on-call transactions run under serializable isolation.',
        'One commits; the other is aborted, or waits and then sees 1 on call and refuses to leave.',
        'Either way, the result matches running them one after the other.',
      ),
      questions: [
        choose(
          'Under serializable isolation, two transactions each try to take the last seat. What outcomes are possible?',
          [
            'Both get the seat',
            'One gets it; the other aborts or sees it taken',
            'Neither can ever get it',
            'Both always abort',
          ],
          1,
          'Only results matching a one-at-a-time order are allowed.',
        ),
        choose(
          'In the serial order T2 then T1, T2 reads stock 1 and buys it, and then T1 reads the stock. What does T1 see?',
          ['Stock 1', 'Stock 2', 'Stock 0', 'An error'],
          2,
          'T1 runs after T2 has committed its purchase.',
        ),
        choose(
          'Why might a database abort a serializable transaction that did nothing wrong on its own?',
          [
            'It ran too long',
            'It read too few rows',
            'Aborts happen at random',
            'Committing it would produce a result no serial order could',
          ],
          3,
          'The abort prevents a combination that breaks serializability.',
        ),
        choose(
          'Which statement about serializable isolation is right?',
          [
            'It prevents write skew but can cause aborts and lower throughput',
            'It costs nothing',
            'It always runs one transaction at a time across the whole database',
            'It only prevents dirty reads',
          ],
          0,
          'Stronger guarantees are paid for with waiting or retries.',
        ),
      ],
    },
    {
      title: 'Protect the rule and retry',
      explanation: [
        'Ways to protect a rule that spans rows: run the transactions as serializable and retry the ones that abort; lock the rows the decision depends on; or express the rule as a constraint the database checks.',
        'A rule about rows that do not exist yet, such as “no booking at 3pm”, has nothing to lock, so lock something that does exist, such as the room’s row. Retry only whole transactions that are safe to repeat, a limited number of times, and keep external effects out of them.',
      ],
      example: scenario(
        'Rule: no overlapping bookings for the same room. Bookings are separate rows.',
        'Lock the room’s row before checking and inserting, or use a constraint that forbids overlaps; under serializable isolation, retry transactions that fail with a serialization error.',
        'Every booking attempt for the room then passes through one shared row, so concurrent checks cannot both succeed.',
      ),
      questions: [
        choose(
          'Two transactions check that room 4 has no booking at 3pm, then insert one. Why doesn’t locking the existing booking rows help?',
          [
            'Locks are never used in practice',
            'Bookings are deleted after checking',
            'It does help',
            'There are no 3pm booking rows to lock yet',
          ],
          3,
          'The conflict is about a row that does not exist until it is inserted.',
        ),
        choose(
          'What can be locked instead, so that concurrent bookings for room 4 conflict?',
          [
            'Room 4’s own row, which every booking for it must lock first',
            'Nothing',
            'Every table in the database',
            'Only the user’s row',
          ],
          0,
          'A shared existing row turns the hidden conflict into a visible one.',
        ),
        choose(
          'A serializable transaction aborts with a serialization error. What should the application do?',
          [
            'Retry only its last statement',
            'Report success to the user',
            'Retry the whole transaction, a limited number of times',
            'Switch permanently to read committed',
          ],
          2,
          'A fresh attempt re-reads current data and re-makes its decision.',
        ),
        choose(
          'Why must a retried transaction not send an email from inside it?',
          [
            'Emails are rolled back with the transaction',
            'Each retry would send the email again',
            'Retries skip emails',
            'It may, without problems',
          ],
          1,
          'The email escapes the rollback, so every attempt would send one.',
        ),
      ],
    },
  ],
};
