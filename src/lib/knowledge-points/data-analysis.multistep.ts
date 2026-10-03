import {
  choose,
  part,
  typeNumber,
  typeOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Python for Data Analysis (CEN-163). A part's code
// runs after the setup's code, as one program, with pandas available.

export const multistepProblems: MultistepModule = {
  'da-transforms': [
    {
      title: 'Give every sale its store’s share',
      setup: {
        text: [
          'A table lists sales by store. Each row gets its store’s total, then the share of that total the sale makes up.',
        ],
        code: `import pandas as pd

sales = pd.DataFrame({
    "store": ["north", "north", "south", "south", "south"],
    "amount": [30, 10, 20, 50, 30],
})
totals = sales.groupby("store")["amount"].transform("sum")
sales["share"] = sales["amount"] / totals`,
      },
      parts: [
        part(
          'da-groupby-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(sales.groupby("store")["amount"].sum().tolist())',
            '[40, 100]',
            'Grouping by store and summing gives one total per store, in sorted key order: north 40, south 100.',
          ),
        ),
        part(
          'da-transforms-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(totals.tolist())',
            '[40, 40, 100, 100, 100]',
            '`transform` repeats each group’s result on every row of the group, so the result lines up with `sales`.',
          ),
        ),
        part(
          'da-transforms-kp3',
          typeNumber(
            'What is the share of the sale whose amount is 50?',
            0.5,
            'It belongs to south, whose total is 100: $50 / 100 = 0.5$.',
          ),
        ),
        part(
          'da-transforms-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            `means = sales.groupby("store")["amount"].transform("mean")
print(sales[sales["amount"] > means]["amount"].tolist())`,
            '[30, 50]',
            'Each row is compared with its own store’s mean: north’s is 20 and south’s about 33.3, so 30 in north and 50 in south are above.',
          ),
        ),
      ],
    },
  ],
  'da-conversion': [
    {
      title: 'Clean a price column',
      setup: {
        text: [
          'Prices arrive as text. Converting them with `errors="coerce"` turns anything that is not a number into a missing value instead of failing.',
        ],
        code: `import pandas as pd

prices = pd.Series(["4.50", "3", "n/a", "12.25", "free"])
numbers = pd.to_numeric(prices, errors="coerce")`,
      },
      parts: [
        part(
          'da-conversion-kp2',
          typeNumber(
            'How many prices failed to convert?',
            2,
            '`"n/a"` and `"free"` are not numbers, so they became missing values.',
          ),
        ),
        part(
          'da-missing-values-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(numbers.isna().tolist())',
            '[False, False, True, False, True]',
            '`isna` marks each missing value with `True`, in the same positions as the failed conversions.',
          ),
        ),
        part(
          'da-missing-values-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(numbers.fillna(0).sum())',
            '19.75',
            'Filling the two gaps with 0 leaves $4.5 + 3 + 12.25 = 19.75$.',
          ),
        ),
        part(
          'da-table-filtering-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(prices[numbers.isna()].tolist())',
            "['n/a', 'free']",
            'A boolean mask built from `numbers` selects the original text of the rows that failed, which shows what to fix.',
          ),
        ),
      ],
    },
  ],
  'da-resampling': [
    {
      title: 'Total readings per day',
      setup: {
        text: [
          'A sensor sends readings at irregular times. The analysis totals them per calendar day, and a day without readings must not look like a measured zero.',
        ],
        code: `import pandas as pd

times = pd.to_datetime(
    ["2026-03-01 09:00", "2026-03-01 17:00", "2026-03-03 08:00"],
    format="%Y-%m-%d %H:%M",
)
readings = pd.Series([4, 6, 5], index=times)
daily = readings.resample("D").sum(min_count=1)`,
      },
      parts: [
        part(
          'da-datetime-kp1',
          typeNumber(
            'What is `times[1].hour`?',
            17,
            'The format reads `"2026-03-01 17:00"` as 17:00 on March 1.',
          ),
        ),
        part(
          'da-resampling-kp1',
          typeNumber(
            'How many rows does `daily` have?',
            3,
            'Resampling by day covers every calendar day from March 1 to March 3, including March 2, which has no readings.',
          ),
        ),
        part(
          'da-resampling-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(daily.tolist())',
            '[10.0, nan, 5.0]',
            'With `min_count=1`, a day needs at least one reading to get a sum, so March 2 is missing rather than 0.',
          ),
        ),
        part(
          'da-groupby-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(readings.resample("D").count().tolist())',
            '[2, 0, 1]',
            '`count` reports how many readings fell in each day; an empty day counts 0.',
          ),
        ),
      ],
    },
  ],
  'da-aggregations': [
    {
      title: 'Summarize delivery times by city',
      setup: {
        text: [
          'A courier compares how many days deliveries take in two cities, keeping the city as a column of the summary.',
        ],
        code: `import pandas as pd

deliveries = pd.DataFrame({
    "city": ["Oslo", "Oslo", "Oslo", "Lima", "Lima"],
    "days": [2, 3, 10, 4, 6],
})
summary = deliveries.groupby("city", as_index=False)["days"].agg(
    ["mean", "median"]
)`,
      },
      parts: [
        part(
          'math-median-kp1',
          typeNumber(
            'What is the median delivery time in Oslo, in days?',
            3,
            'Oslo’s times sorted are 2, 3, and 10; the middle one is 3.',
          ),
        ),
        part(
          'math-median-kp3',
          choose(
            'Oslo’s mean is 5 days but its median is 3. Which better describes a typical Oslo delivery?',
            [
              'The median: one slow delivery pulls the mean up',
              'The mean: it is the only summary that uses every value',
              'Either: the two always agree for small groups',
              'Neither: three deliveries are too few to judge',
            ],
            0,
            'The 10-day delivery raises the mean to 5 although two of three deliveries took 3 days or less. The median ignores how extreme that value is.',
          ),
        ),
        part(
          'da-aggregations-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(summary["city"].tolist())',
            "['Lima', 'Oslo']",
            '`as_index=False` keeps the keys as a column, and groups come out in sorted key order.',
          ),
        ),
        part(
          'da-aggregations-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(summary["median"].tolist())',
            '[5.0, 3.0]',
            'Naming several statistics in `agg` gives one column each. Lima’s median of 4 and 6 is 5.0; Oslo’s is 3.0.',
          ),
        ),
      ],
    },
  ],
  'da-exploration': [
    {
      title: 'Explore ratings by plan',
      setup: {
        text: [
          'Six customers on two plans rated a product from 1 to 5. An analyst explores the ratings before drawing conclusions.',
        ],
        code: `import pandas as pd

reviews = pd.DataFrame({
    "plan": ["basic", "pro", "basic", "basic", "pro", "basic"],
    "rating": [3, 5, 4, 3, 4, 1],
})
counts = reviews["plan"].value_counts()`,
      },
      parts: [
        part(
          'da-exploration-kp1',
          typeNumber(
            'What is `counts["basic"]`?',
            4,
            '`value_counts` counts each category: four rows are on the basic plan.',
          ),
        ),
        part(
          'math-median-kp2',
          typeNumber(
            'What is the median rating?',
            3.5,
            'Sorted, the ratings are 1, 3, 3, 4, 4, 5; with an even count the median averages the middle pair, 3 and 4.',
          ),
        ),
        part(
          'da-exploration-kp2',
          typeNumber(
            'What is the mean rating?',
            3.33,
            '$20 / 6 \\approx 3.33$, a little below the median because the single 1 pulls it down.',
            { tolerance: 0.005, unit: 'to 2 decimals' },
          ),
        ),
        part(
          'da-exploration-kp3',
          choose(
            'Pro customers rated higher on average than basic ones. What can the analyst conclude?',
            [
              'Pro and higher ratings go together in this sample',
              'Upgrading a customer to pro will raise their rating',
              'The basic plan causes customers to rate lower',
              'Ratings would rise if every customer had pro',
            ],
            0,
            'The data show an association only. Customers chose their plans, so something else, like how much they use the product, could explain both.',
          ),
        ),
      ],
    },
  ],
  'da-text': [
    {
      title: 'Merge spellings of a city',
      setup: {
        text: [
          'City names were typed by hand. Cleaning them makes the same city compare equal, and a missing name must stay missing.',
        ],
        code: `import pandas as pd

cities = pd.Series([" Lima", "lima ", "LIMA", "Quito", None])
clean = cities.str.strip().str.lower()`,
      },
      parts: [
        part(
          'string-methods-kp1',
          typeOutput(
            'What does this print?',
            'print(" Lima".strip().lower())',
            'lima',
            '`strip` removes the leading space and `lower` changes the case.',
          ),
        ),
        part(
          'da-text-kp2',
          typeNumber(
            'How many distinct values does `clean` have, not counting the missing one?',
            2,
            'All three spellings of Lima become `"lima"`; with `"quito"` that makes 2.',
          ),
        ),
        part(
          'da-missing-values-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(clean.isna().sum())',
            '1',
            'The `.str` methods leave a missing value missing, so one entry is still missing after cleaning.',
          ),
        ),
        part(
          'da-text-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(clean.tolist())',
            "['lima', 'lima', 'lima', 'quito', nan]",
            'Each string is trimmed and lowered in place; the missing entry comes back as `nan`.',
          ),
        ),
      ],
    },
  ],
  'da-pipeline': [
    {
      title: 'Load orders and reject duplicate IDs',
      setup: {
        text: [
          'A report loads orders through one function, which checks that every order ID appears once before anything else uses the table.',
        ],
        code: `import pandas as pd

def load(rows):
    table = pd.DataFrame(rows, columns=["id", "qty"])
    if table["id"].duplicated().any():
        raise ValueError("duplicate ids")
    return table

orders = load([(1, 2), (2, 5), (3, 1)])`,
      },
      parts: [
        part(
          'da-duplicates-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(pd.Series([1, 2, 2, 3]).duplicated().tolist())',
            '[False, False, True, False]',
            '`duplicated` marks every repeat of an earlier value; the first 2 is not a repeat, the second is.',
          ),
        ),
        part(
          'errors-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            `try:
    load([(1, 2), (1, 3)])
    print("loaded")
except ValueError:
    print("rejected")`,
            'rejected',
            'ID 1 appears twice, so `load` raises `ValueError` before printing, and the `except` block runs.',
          ),
        ),
        part(
          'da-pipeline-kp2',
          choose(
            'Why does `load` raise an error instead of quietly dropping the duplicate rows?',
            [
              'A broken assumption should stop the run where it is found',
              'Dropping rows from a table is not possible in pandas',
              'Raising is faster than calling `drop_duplicates`',
              'Duplicate IDs can only be detected by raising an error first',
            ],
            0,
            'Every later step trusts that IDs are unique. Failing loudly at the start shows the problem instead of letting a silent choice change the totals.',
          ),
        ),
        part(
          'da-pipeline-kp1',
          typeNumber(
            'What is `orders["qty"].sum()`?',
            8,
            'The valid load returns all three orders: $2 + 5 + 1 = 8$.',
          ),
        ),
      ],
    },
  ],
};
