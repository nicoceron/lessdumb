/** Original atomic Rust teaching material. External references are documented in docs/sources/rust.md. */
export interface RustDefinition {
  slug: string;
  title: string;
  rule: string;
  decision: string;
  signature: string;
  solution: string;
  exampleCode: string;
  testCode: string;
  body: string;
  assertions: string;
  call: string;
  output: string;
  /** How the example prints its result, when the default description does not fit. */
  printNote?: string;
  /** Topic members are listed together; their order gives the topic stages. */
  topic: string;
}
export interface RustTopic {
  slug: string;
  title: string;
  unit: string;
}

export const rustTopics: RustTopic[] = [
  {
    slug: 'programs',
    title: 'First Rust programs',
    unit: 'start',
  },
  {
    slug: 'values',
    title: 'Represent values',
    unit: 'start',
  },
  {
    slug: 'control',
    title: 'Choose and repeat',
    unit: 'start',
  },
  {
    slug: 'functions',
    title: 'Function contracts',
    unit: 'start',
  },
  {
    slug: 'ownership',
    title: 'Ownership and destruction',
    unit: 'ownership',
  },
  {
    slug: 'borrowing',
    title: 'Borrow without moving',
    unit: 'ownership',
  },
  {
    slug: 'strings',
    title: 'UTF-8 strings',
    unit: 'ownership',
  },
  {
    slug: 'structs',
    title: 'Model records',
    unit: 'models',
  },
  {
    slug: 'enums',
    title: 'Represent alternatives',
    unit: 'models',
  },
  {
    slug: 'option',
    title: 'Optional values',
    unit: 'models',
  },
  {
    slug: 'errors',
    title: 'Recoverable errors',
    unit: 'models',
  },
  {
    slug: 'conversions',
    title: 'Convert between types',
    unit: 'models',
  },
  {
    slug: 'option-tools',
    title: 'Option and Result helpers',
    unit: 'models',
  },
  {
    slug: 'vectors',
    title: 'Growable sequences',
    unit: 'collections',
  },
  {
    slug: 'queues',
    title: 'Stacks and queues',
    unit: 'collections',
  },
  {
    slug: 'maps-sets',
    title: 'Maps and sets',
    unit: 'collections',
  },
  {
    slug: 'generics',
    title: 'Reusable type parameters',
    unit: 'abstraction',
  },
  {
    slug: 'traits',
    title: 'Behavior contracts',
    unit: 'abstraction',
  },
  {
    slug: 'lifetimes',
    title: 'Reference lifetime relationships',
    unit: 'abstraction',
  },
  {
    slug: 'closures',
    title: 'Closures and captures',
    unit: 'abstraction',
  },
  {
    slug: 'iterators',
    title: 'Iterator pipelines',
    unit: 'abstraction',
  },
  {
    slug: 'modules',
    title: 'Modules and public APIs',
    unit: 'tooling',
  },
  {
    slug: 'cargo',
    title: 'Cargo and build contracts',
    unit: 'tooling',
  },
  {
    slug: 'testing',
    title: 'Assertions and edge cases',
    unit: 'tooling',
  },
  {
    slug: 'smart-pointers',
    title: 'Shared and heap ownership',
    unit: 'memory',
  },
  {
    slug: 'interior-mutability',
    title: 'Interior mutability',
    unit: 'memory',
  },
  {
    slug: 'concurrency',
    title: 'Threads and communication',
    unit: 'concurrency',
  },
  {
    slug: 'atomics',
    title: 'Atomic operations',
    unit: 'concurrency',
  },
  {
    slug: 'send-sync',
    title: 'Send and Sync contracts',
    unit: 'concurrency',
  },
  {
    slug: 'async',
    title: 'Async mechanics',
    unit: 'concurrency',
  },
  {
    slug: 'unsafe',
    title: 'Unsafe proof obligations',
    unit: 'systems',
  },
  {
    slug: 'interop',
    title: 'Binary and C interoperability',
    unit: 'systems',
  },
  {
    slug: 'performance',
    title: 'Measure storage and work',
    unit: 'systems',
  },
  {
    slug: 'algorithms',
    title: 'Algorithm applications in Rust',
    unit: 'applications',
  },
  {
    slug: 'systems-project',
    title: 'Build a bounded binary parser',
    unit: 'applications',
  },
];

export const rustDefinitions: RustDefinition[] = [
  {
    slug: 'main',
    title: 'Function entry point',
    rule: 'A binary starts by calling its main function, and other functions run only when called.',
    decision:
      'Put each step in its own function and call it from main in the order the output needs.',
    signature: 'fn greet()',
    body: 'println!("hello, Rust");',
    assertions: 'greet();',
    call: 'greet()',
    output: 'hello, Rust',
    printNote: 'main calls greet, and greet prints one line with println!.',
    topic: 'programs',
    solution: 'fn greet() {\n    println!("hello, Rust");\n}',
    exampleCode:
      'fn greet() {\n    println!("hello, Rust");\n}\n\nfn main() {\n    greet();\n}',
    testCode: 'fn main() {\n    greet();\n}',
  },
  {
    slug: 'format',
    title: 'Format values',
    rule: 'Each {} placeholder takes the next value after the format string, in written order.',
    decision:
      'Use format! to build the text as a String when the caller needs the text rather than printed output.',
    signature: 'fn progress(done: i32, total: i32) -> String',
    body: 'format!("{} of {} done", done, total)',
    assertions:
      'assert_eq!(progress(3, 5), "3 of 5 done"); assert_eq!(progress(0, 2), "0 of 2 done");',
    call: 'progress(3, 5)',
    output: '3 of 5 done',
    topic: 'programs',
    solution:
      'fn progress(done: i32, total: i32) -> String {\n    format!("{} of {} done", done, total)\n}',
    exampleCode:
      'fn progress(done: i32, total: i32) -> String {\n    format!("{} of {} done", done, total)\n}\n\nfn main() {\n    println!("{}", progress(3, 5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(progress(3, 5), "3 of 5 done");\n    assert_eq!(progress(0, 2), "0 of 2 done");\n}',
  },
  {
    slug: 'debug-format',
    title: 'Debug formatting',
    rule: "The {:?} placeholder prints a value's Debug form, which keeps quotes around text and shows the structure of tuples and arrays.",
    decision: 'Use {:?} for tuples and arrays, which {} cannot print.',
    signature: 'fn pair_views(a: i32, b: i32) -> String',
    body: 'format!("{:?} {:?}", (a, b), [b, a])',
    assertions:
      'assert_eq!(pair_views(1, 2), "(1, 2) [2, 1]"); assert_eq!(pair_views(0, -4), "(0, -4) [-4, 0]");',
    call: 'pair_views(1, 2)',
    output: '(1, 2) [2, 1]',
    printNote:
      'format! builds the Debug text, and main prints that String with {}, so the parentheses and brackets come from {:?}.',
    topic: 'programs',
    solution:
      'fn pair_views(a: i32, b: i32) -> String {\n    format!("{:?} {:?}", (a, b), [b, a])\n}',
    exampleCode:
      'fn pair_views(a: i32, b: i32) -> String {\n    format!("{:?} {:?}", (a, b), [b, a])\n}\n\nfn main() {\n    println!("{}", pair_views(1, 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(pair_views(1, 2), "(1, 2) [2, 1]");\n    assert_eq!(pair_views(0, -4), "(0, -4) [-4, 0]");\n}',
  },
  {
    slug: 'bindings',
    title: 'Mutable bindings',
    rule: 'A let mut binding permits assigning a new value to that binding.',
    decision: 'Update the accumulator after creating it with mut.',
    signature: 'fn bump(n: i32) -> i32',
    body: 'let mut value = n; value += 1; value',
    assertions: 'assert_eq!(bump(0), 1); assert_eq!(bump(-4), -3);',
    call: 'bump(4)',
    output: '5',
    topic: 'programs',
    solution:
      'fn bump(n: i32) -> i32 {\n    let mut value = n;\n    value += 1;\n    value\n}',
    exampleCode:
      'fn bump(n: i32) -> i32 {\n    let mut value = n;\n    value += 1;\n    value\n}\n\nfn main() {\n    println!("{}", bump(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(bump(0), 1);\n    assert_eq!(bump(-4), -3);\n}',
  },
  {
    slug: 'scope',
    title: 'Block scope and shadowing',
    rule: 'A shadowing binding replaces a name only within its scope.',
    decision:
      'Return the inner block expression while the outer input remains available.',
    signature: 'fn scoped(n: i32) -> i32',
    body: 'let inside = { let n = n * 2; n + 1 }; inside + n',
    assertions: 'assert_eq!(scoped(3), 10); assert_eq!(scoped(-2), -5);',
    call: 'scoped(3)',
    output: '10',
    topic: 'programs',
    solution:
      'fn scoped(n: i32) -> i32 {\n    let inside = {\n        let n = n * 2;\n        n + 1\n    };\n    inside + n\n}',
    exampleCode:
      'fn scoped(n: i32) -> i32 {\n    let inside = {\n        let n = n * 2;\n        n + 1\n    };\n    inside + n\n}\n\nfn main() {\n    println!("{}", scoped(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(scoped(3), 10);\n    assert_eq!(scoped(-2), -5);\n}',
  },
  {
    slug: 'integers',
    title: 'Integer arithmetic',
    rule: 'Integer division discards the fractional part toward zero.',
    decision:
      'Use the remainder to find how many items are left after complete groups.',
    signature: 'fn groups(items: u32, size: u32) -> (u32, u32)',
    body: '(items / size, items % size)',
    assertions:
      'assert_eq!(groups(17, 5), (3, 2)); assert_eq!(groups(4, 7), (0, 4));',
    call: 'groups(17, 5)',
    output: '(3, 2)',
    topic: 'values',
    solution:
      'fn groups(items: u32, size: u32) -> (u32, u32) {\n    (items / size, items % size)\n}',
    exampleCode:
      'fn groups(items: u32, size: u32) -> (u32, u32) {\n    (items / size, items % size)\n}\n\nfn main() {\n    println!("{:?}", groups(17, 5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(groups(17, 5), (3, 2));\n    assert_eq!(groups(4, 7), (0, 4));\n}',
  },
  {
    slug: 'floats',
    title: 'Floating point values',
    rule: 'A floating point type can represent fractional results approximately.',
    decision:
      'Convert both integers before division to preserve a fractional ratio.',
    signature: 'fn ratio(a: u32, b: u32) -> f64',
    body: 'a as f64 / b as f64',
    assertions:
      'assert!((ratio(3, 2) - 1.5).abs() < 1e-9); assert!((ratio(1, 4) - 0.25).abs() < 1e-9);',
    call: 'ratio(3, 2)',
    output: '1.5',
    topic: 'values',
    solution: 'fn ratio(a: u32, b: u32) -> f64 {\n    a as f64 / b as f64\n}',
    exampleCode:
      'fn ratio(a: u32, b: u32) -> f64 {\n    a as f64 / b as f64\n}\n\nfn main() {\n    println!("{:?}", ratio(3, 2));\n}',
    testCode:
      'fn main() {\n    assert!((ratio(3, 2) - 1.5).abs() < 1e-9);\n    assert!((ratio(1, 4) - 0.25).abs() < 1e-9);\n}',
  },
  {
    slug: 'booleans',
    title: 'Boolean expressions',
    rule: 'Boolean && requires both comparisons to be true.',
    decision:
      'Check both bounds when expressing membership in a closed interval.',
    signature: 'fn in_range(n: i32, low: i32, high: i32) -> bool',
    body: 'n >= low && n <= high',
    assertions:
      'assert!(in_range(3, 1, 3)); assert!(!in_range(0, 1, 3)); assert!(!in_range(4, 1, 3));',
    call: 'in_range(3, 1, 3)',
    output: 'true',
    topic: 'values',
    solution:
      'fn in_range(n: i32, low: i32, high: i32) -> bool {\n    n >= low && n <= high\n}',
    exampleCode:
      'fn in_range(n: i32, low: i32, high: i32) -> bool {\n    n >= low && n <= high\n}\n\nfn main() {\n    println!("{}", in_range(3, 1, 3));\n}',
    testCode:
      'fn main() {\n    assert!(in_range(3, 1, 3));\n    assert!(!in_range(0, 1, 3));\n    assert!(!in_range(4, 1, 3));\n}',
  },
  {
    slug: 'const',
    title: 'Named constants',
    rule: 'A const item names a fixed value with an explicit type, and every use reads that same value.',
    decision:
      'Name a fixed conversion factor with a const instead of repeating the bare number.',
    signature: 'fn to_minutes(hours: u32) -> u32',
    body: 'hours * MINUTES_PER_HOUR',
    assertions: 'assert_eq!(to_minutes(3), 180); assert_eq!(to_minutes(0), 0);',
    call: 'to_minutes(3)',
    output: '180',
    topic: 'values',
    solution:
      'const MINUTES_PER_HOUR: u32 = 60;\n\nfn to_minutes(hours: u32) -> u32 {\n    hours * MINUTES_PER_HOUR\n}',
    exampleCode:
      'const MINUTES_PER_HOUR: u32 = 60;\n\nfn to_minutes(hours: u32) -> u32 {\n    hours * MINUTES_PER_HOUR\n}\n\nfn main() {\n    println!("{}", to_minutes(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(to_minutes(3), 180);\n    assert_eq!(to_minutes(0), 0);\n}',
  },
  {
    slug: 'tuples-arrays',
    title: 'Tuples and fixed arrays',
    rule: 'A tuple may contain different types while an array has one element type.',
    decision: 'Read tuple fields by their fixed numeric field positions.',
    signature: 'fn endpoints(values: [i32; 3]) -> (i32, i32)',
    body: '(values[0], values[2])',
    assertions:
      'assert_eq!(endpoints([2, 4, 8]), (2, 8)); assert_eq!(endpoints([-1, 0, 1]), (-1, 1));',
    call: 'endpoints([2, 4, 8])',
    output: '2 8',
    topic: 'values',
    solution:
      'fn endpoints(values: [i32; 3]) -> (i32, i32) {\n    (values[0], values[2])\n}',
    exampleCode:
      'fn endpoints(values: [i32; 3]) -> (i32, i32) {\n    (values[0], values[2])\n}\n\nfn main() {\n    let pair = endpoints([2, 4, 8]);\n    println!("{} {}", pair.0, pair.1);\n}',
    testCode:
      'fn main() {\n    assert_eq!(endpoints([2, 4, 8]), (2, 8));\n    assert_eq!(endpoints([-1, 0, 1]), (-1, 1));\n}',
  },
  {
    slug: 'if',
    title: 'If as an expression',
    rule: 'The selected if branch can produce a value.',
    decision: 'Make both branches produce the same result type.',
    signature: 'fn absolute(n: i32) -> i32',
    body: 'if n < 0 { -n } else { n }',
    assertions:
      'assert_eq!(absolute(-7), 7); assert_eq!(absolute(4), 4); assert_eq!(absolute(0), 0);',
    call: 'absolute(-7)',
    output: '7',
    topic: 'control',
    solution:
      'fn absolute(n: i32) -> i32 {\n    if n < 0 {\n        -n\n    } else {\n        n\n    }\n}',
    exampleCode:
      'fn absolute(n: i32) -> i32 {\n    if n < 0 {\n        -n\n    } else {\n        n\n    }\n}\n\nfn main() {\n    println!("{}", absolute(-7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(absolute(-7), 7);\n    assert_eq!(absolute(4), 4);\n    assert_eq!(absolute(0), 0);\n}',
  },
  {
    slug: 'match',
    title: 'Exhaustive match',
    rule: 'A match must handle every possible input value or provide a fallback.',
    decision: 'Place the fallback after the specific patterns.',
    signature: 'fn sign(n: i32) -> i32',
    body: 'match n { 0 => 0, n if n < 0 => -1, _ => 1, }',
    assertions:
      'assert_eq!(sign(0), 0); assert_eq!(sign(-3), -1); assert_eq!(sign(2), 1);',
    call: 'sign(-3)',
    output: '-1',
    topic: 'control',
    solution:
      'fn sign(n: i32) -> i32 {\n    match n {\n        0 => 0,\n        n if n < 0 => -1,\n        _ => 1,\n    }\n}',
    exampleCode:
      'fn sign(n: i32) -> i32 {\n    match n {\n        0 => 0,\n        n if n < 0 => -1,\n        _ => 1,\n    }\n}\n\nfn main() {\n    println!("{}", sign(-3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sign(0), 0);\n    assert_eq!(sign(-3), -1);\n    assert_eq!(sign(2), 1);\n}',
  },
  {
    slug: 'loop',
    title: 'Break with a value',
    rule: 'A loop expression can return a value supplied to break.',
    decision:
      'Advance the loop variable before repeating so the stop condition becomes reachable.',
    signature: 'fn next_even(n: i32) -> i32',
    body: 'let mut x = n; loop { if x % 2 == 0 { break x; } x += 1; }',
    assertions:
      'assert_eq!(next_even(3), 4); assert_eq!(next_even(4), 4); assert_eq!(next_even(-3), -2);',
    call: 'next_even(3)',
    output: '4',
    topic: 'control',
    solution:
      'fn next_even(n: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x % 2 == 0 {\n            break x;\n        }\n        x += 1;\n    }\n}',
    exampleCode:
      'fn next_even(n: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x % 2 == 0 {\n            break x;\n        }\n        x += 1;\n    }\n}\n\nfn main() {\n    println!("{:?}", next_even(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(next_even(3), 4);\n    assert_eq!(next_even(4), 4);\n    assert_eq!(next_even(-3), -2);\n}',
  },
  {
    slug: 'while',
    title: 'While loops',
    rule: 'A while loop checks its condition before every pass and stops as soon as the condition is false.',
    decision:
      'Change the tested value inside the body so the condition eventually becomes false.',
    signature: 'fn digit_count(n: u32) -> u32',
    body: 'let mut count = 1; let mut rest = n; while rest >= 10 { rest /= 10; count += 1; } count',
    assertions:
      'assert_eq!(digit_count(4096), 4); assert_eq!(digit_count(0), 1); assert_eq!(digit_count(9), 1); assert_eq!(digit_count(10), 2);',
    call: 'digit_count(4096)',
    output: '4',
    topic: 'control',
    solution:
      'fn digit_count(n: u32) -> u32 {\n    let mut count = 1;\n    let mut rest = n;\n    while rest >= 10 {\n        rest /= 10;\n        count += 1;\n    }\n    count\n}',
    exampleCode:
      'fn digit_count(n: u32) -> u32 {\n    let mut count = 1;\n    let mut rest = n;\n    while rest >= 10 {\n        rest /= 10;\n        count += 1;\n    }\n    count\n}\n\nfn main() {\n    println!("{}", digit_count(4096));\n}',
    testCode:
      'fn main() {\n    assert_eq!(digit_count(4096), 4);\n    assert_eq!(digit_count(0), 1);\n    assert_eq!(digit_count(9), 1);\n    assert_eq!(digit_count(10), 2);\n}',
  },
  {
    slug: 'ranges',
    title: 'Half-open ranges',
    rule: 'A range a..b includes a and excludes b.',
    decision: 'Use ..= when an inclusive upper bound is required.',
    signature: 'fn sum_to(n: u32) -> u32',
    body: 'let mut total = 0; for x in 1..=n { total += x; } total',
    assertions:
      'assert_eq!(sum_to(4), 10); assert_eq!(sum_to(0), 0); assert_eq!(sum_to(1), 1);',
    call: 'sum_to(4)',
    output: '10',
    topic: 'control',
    solution:
      'fn sum_to(n: u32) -> u32 {\n    let mut total = 0;\n    for x in 1..=n {\n        total += x;\n    }\n    total\n}',
    exampleCode:
      'fn sum_to(n: u32) -> u32 {\n    let mut total = 0;\n    for x in 1..=n {\n        total += x;\n    }\n    total\n}\n\nfn main() {\n    println!("{}", sum_to(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sum_to(4), 10);\n    assert_eq!(sum_to(0), 0);\n    assert_eq!(sum_to(1), 1);\n}',
  },
  {
    slug: 'parameters',
    title: 'Typed parameters',
    rule: 'Each function parameter declares the type accepted by the function.',
    decision: 'Keep the argument order consistent with the parameter order.',
    signature: 'fn difference(a: i32, b: i32) -> i32',
    body: 'a - b',
    assertions:
      'assert_eq!(difference(8, 3), 5); assert_eq!(difference(3, 8), -5);',
    call: 'difference(8, 3)',
    output: '5',
    topic: 'functions',
    solution: 'fn difference(a: i32, b: i32) -> i32 {\n    a - b\n}',
    exampleCode:
      'fn difference(a: i32, b: i32) -> i32 {\n    a - b\n}\n\nfn main() {\n    println!("{}", difference(8, 3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(difference(8, 3), 5);\n    assert_eq!(difference(3, 8), -5);\n}',
  },
  {
    slug: 'returns',
    title: 'Tail expression returns',
    rule: 'The last expression without a semicolon supplies a block return value.',
    decision: 'Omit the semicolon on the expression that should be returned.',
    signature: 'fn seconds_per_hour() -> i32',
    body: '60 * 60',
    assertions: 'assert_eq!(seconds_per_hour(), 3600);',
    call: 'seconds_per_hour()',
    output: '3600',
    topic: 'functions',
    solution: 'fn seconds_per_hour() -> i32 {\n    60 * 60\n}',
    exampleCode:
      'fn seconds_per_hour() -> i32 {\n    60 * 60\n}\n\nfn main() {\n    println!("{}", seconds_per_hour());\n}',
    testCode: 'fn main() {\n    assert_eq!(seconds_per_hour(), 3600);\n}',
  },
  {
    slug: 'early-return',
    title: 'Return early',
    rule: 'A return expression ends the function immediately with its value, so the statements after it do not run.',
    decision:
      'Handle the special case first with return, then let the tail expression cover the normal case.',
    signature: 'fn safe_half(n: i32) -> i32',
    body: 'if n < 0 { return 0; } n / 2',
    assertions:
      'assert_eq!(safe_half(-8), 0); assert_eq!(safe_half(9), 4); assert_eq!(safe_half(0), 0);',
    call: 'safe_half(-8)',
    output: '0',
    topic: 'functions',
    solution:
      'fn safe_half(n: i32) -> i32 {\n    if n < 0 {\n        return 0;\n    }\n    n / 2\n}',
    exampleCode:
      'fn safe_half(n: i32) -> i32 {\n    if n < 0 {\n        return 0;\n    }\n    n / 2\n}\n\nfn main() {\n    println!("{}", safe_half(-8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(safe_half(-8), 0);\n    assert_eq!(safe_half(9), 4);\n    assert_eq!(safe_half(0), 0);\n}',
  },
  {
    slug: 'unit',
    title: 'Unit and local side effects',
    rule: 'A block ending in an assignment statement evaluates to the unit value (), while the assignment changes its local binding.',
    decision:
      'Capture the unit result of the assignment block and return it alongside the updated integer in a tuple.',
    signature: 'fn replacement_unit(start: i32, replacement: i32) -> ((), i32)',
    body: 'let mut value = start; let result = { value = replacement; }; (result, value)',
    assertions:
      'assert_eq!(replacement_unit(9, 0), ((), 0)); assert_eq!(replacement_unit(0, -3), ((), -3)); assert_eq!(replacement_unit(4, 4), ((), 4));',
    call: 'replacement_unit(9, 0)',
    output: '((), 0)',
    topic: 'functions',
    solution:
      'fn replacement_unit(start: i32, replacement: i32) -> ((), i32) {\n    let mut value = start;\n    let result = {\n        value = replacement;\n    };\n    (result, value)\n}',
    exampleCode:
      'fn replacement_unit(start: i32, replacement: i32) -> ((), i32) {\n    let mut value = start;\n    let result = {\n        value = replacement;\n    };\n    (result, value)\n}\n\nfn main() {\n    println!("{:?}", replacement_unit(9, 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(replacement_unit(9, 0), ((), 0));\n    assert_eq!(replacement_unit(0, -3), ((), -3));\n    assert_eq!(replacement_unit(4, 4), ((), 4));\n}',
  },
  {
    slug: 'recursion',
    title: 'Recursive base cases',
    rule: 'A recursive function needs a terminating base case.',
    decision: 'Reduce the problem size on each recursive call.',
    signature: 'fn factorial(n: u32) -> u64',
    body: 'if n == 0 { 1 } else { n as u64 * factorial(n - 1) }',
    assertions:
      'assert_eq!(factorial(0), 1); assert_eq!(factorial(5), 120); assert_eq!(factorial(1), 1);',
    call: 'factorial(5)',
    output: '120',
    topic: 'functions',
    solution:
      'fn factorial(n: u32) -> u64 {\n    if n == 0 {\n        1\n    } else {\n        n as u64 * factorial(n - 1)\n    }\n}',
    exampleCode:
      'fn factorial(n: u32) -> u64 {\n    if n == 0 {\n        1\n    } else {\n        n as u64 * factorial(n - 1)\n    }\n}\n\nfn main() {\n    println!("{:?}", factorial(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(factorial(0), 1);\n    assert_eq!(factorial(5), 120);\n    assert_eq!(factorial(1), 1);\n}',
  },
  {
    slug: 'moves',
    title: 'Move owned values',
    rule: 'Moving a String transfers responsibility for its allocation.',
    decision:
      'Return the moved String instead of trying to read the old binding.',
    signature: 'fn transfer(text: String) -> String',
    body: 'let moved = text; moved',
    assertions:
      'assert_eq!(transfer(String::from("rust")), "rust"); assert_eq!(transfer(String::new()), "");',
    call: 'transfer(String::from("rust"))',
    output: '"rust"',
    topic: 'ownership',
    solution:
      'fn transfer(text: String) -> String {\n    let moved = text;\n    moved\n}',
    exampleCode:
      'fn transfer(text: String) -> String {\n    let moved = text;\n    moved\n}\n\nfn main() {\n    println!("{:?}", transfer(String::from("rust")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(transfer(String::from("rust")), "rust");\n    assert_eq!(transfer(String::new()), "");\n}',
  },
  {
    slug: 'copy',
    title: 'Copy scalar values',
    rule: 'Copy types can be duplicated implicitly without invalidating the source.',
    decision: 'Use both integer bindings after assigning one to the other.',
    signature: 'fn copy_total(n: i32) -> i32',
    body: 'let other = n; n + other',
    assertions: 'assert_eq!(copy_total(4), 8); assert_eq!(copy_total(-3), -6);',
    call: 'copy_total(4)',
    output: '8',
    topic: 'ownership',
    solution:
      'fn copy_total(n: i32) -> i32 {\n    let other = n;\n    n + other\n}',
    exampleCode:
      'fn copy_total(n: i32) -> i32 {\n    let other = n;\n    n + other\n}\n\nfn main() {\n    println!("{:?}", copy_total(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(copy_total(4), 8);\n    assert_eq!(copy_total(-3), -6);\n}',
  },
  {
    slug: 'clone',
    title: 'Explicit cloning',
    rule: 'Cloning a String creates an independently owned String with equal contents.',
    decision:
      'Clone the owned String, append with push_str on the clone, and return both independently owned values.',
    signature: 'fn copied_suffix(original: String) -> (String, String)',
    body: 'let mut copy = original.clone(); copy.push_str("!"); (original, copy)',
    assertions:
      'assert_eq!(copied_suffix(String::from("hi")), (String::from("hi"), String::from("hi!"))); assert_eq!(copied_suffix(String::new()), (String::new(), String::from("!")));',
    call: 'copied_suffix(String::from("hi"))',
    output: '("hi", "hi!")',
    topic: 'ownership',
    solution:
      'fn copied_suffix(original: String) -> (String, String) {\n    let mut copy = original.clone();\n    copy.push_str("!");\n    (original, copy)\n}',
    exampleCode:
      'fn copied_suffix(original: String) -> (String, String) {\n    let mut copy = original.clone();\n    copy.push_str("!");\n    (original, copy)\n}\n\nfn main() {\n    println!("{:?}", copied_suffix(String::from("hi")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(copied_suffix(String::from("hi")), (String::from("hi"), String::from("hi!")));\n    assert_eq!(copied_suffix(String::new()), (String::new(), String::from("!")));\n}',
  },
  {
    slug: 'drop',
    title: 'Release an owned value',
    rule: 'std::mem::drop consumes an owned String and releases it before the surrounding scope ends.',
    decision:
      'Pass the obsolete String to std::mem::drop and return the separately owned replacement without reading the consumed binding.',
    signature:
      'fn replace_released(obsolete: String, replacement: String) -> String',
    body: 'std::mem::drop(obsolete); replacement',
    assertions:
      'assert_eq!(replace_released(String::from("old"), String::from("new")), "new"); assert_eq!(replace_released(String::new(), String::from("ready")), "ready"); assert_eq!(replace_released(String::from("old"), String::new()), "");',
    call: 'replace_released(String::from("old"), String::from("new"))',
    output: '"new"',
    topic: 'ownership',
    solution:
      'fn replace_released(obsolete: String, replacement: String) -> String {\n    std::mem::drop(obsolete);\n    replacement\n}',
    exampleCode:
      'fn replace_released(obsolete: String, replacement: String) -> String {\n    std::mem::drop(obsolete);\n    replacement\n}\n\nfn main() {\n    println!("{:?}", replace_released(String::from("old"), String::from("new")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(replace_released(String::from("old"), String::from("new")), "new");\n    assert_eq!(replace_released(String::new(), String::from("ready")), "ready");\n    assert_eq!(replace_released(String::from("old"), String::new()), "");\n}',
  },
  {
    slug: 'shared-borrow',
    title: 'Shared references',
    rule: 'A shared reference permits reading while leaving ownership with the caller.',
    decision:
      'Accept &String when observing an owned string without consuming it.',
    signature: 'fn observed_len(text: &String) -> usize',
    body: 'text.len()',
    assertions:
      'let s = String::from("rust"); assert_eq!(observed_len(&s), 4); assert_eq!(observed_len(&s), 4); assert_eq!(s, "rust");',
    call: 'observed_len(&String::from("rust"))',
    output: '4',
    topic: 'borrowing',
    solution: 'fn observed_len(text: &String) -> usize {\n    text.len()\n}',
    exampleCode:
      'fn observed_len(text: &String) -> usize {\n    text.len()\n}\n\nfn main() {\n    println!("{:?}", observed_len(&String::from("rust")));\n}',
    testCode:
      'fn main() {\n    let s = String::from("rust");\n    assert_eq!(observed_len(&s), 4);\n    assert_eq!(observed_len(&s), 4);\n    assert_eq!(s, "rust");\n}',
  },
  {
    slug: 'mutable-borrow',
    title: 'Exclusive mutable references',
    rule: 'A mutable reference grants exclusive access for its active borrow.',
    decision: 'Dereference &mut i32 to update the referenced value.',
    signature: 'fn add_to(value: &mut i32, amount: i32)',
    body: '*value += amount;',
    assertions:
      'let mut n = 3; add_to(&mut n, 4); assert_eq!(n, 7); add_to(&mut n, -2); assert_eq!(n, 5);',
    call: '{ let mut n = 3; add_to(&mut n, 4); n }',
    output: '7',
    topic: 'borrowing',
    solution:
      'fn add_to(value: &mut i32, amount: i32) {\n    *value += amount;\n}',
    exampleCode:
      'fn add_to(value: &mut i32, amount: i32) {\n    *value += amount;\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut n = 3;\n        add_to(&mut n, 4);\n        n\n    });\n}',
    testCode:
      'fn main() {\n    let mut n = 3;\n    add_to(&mut n, 4);\n    assert_eq!(n, 7);\n    add_to(&mut n, -2);\n    assert_eq!(n, 5);\n}',
  },
  {
    slug: 'borrow-ends',
    title: 'Non-lexical borrow endings',
    rule: 'A borrow can end after its last use before the surrounding scope ends.',
    decision:
      'Finish reading before taking a mutable borrow of the same value.',
    signature: 'fn read_then_append(text: &mut String) -> usize',
    body: "let before = { let view = &*text; view.len() }; text.push('!'); before",
    assertions:
      'let mut s = String::from("hi"); assert_eq!(read_then_append(&mut s), 2); assert_eq!(s, "hi!");',
    call: '{ let mut s = String::from("hi"); read_then_append(&mut s) }',
    output: '2',
    topic: 'borrowing',
    solution:
      "fn read_then_append(text: &mut String) -> usize {\n    let before = {\n        let view = &*text;\n        view.len()\n    };\n    text.push('!');\n    before\n}",
    exampleCode:
      'fn read_then_append(text: &mut String) -> usize {\n    let before = {\n        let view = &*text;\n        view.len()\n    };\n    text.push(\'!\');\n    before\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut s = String::from("hi");\n        read_then_append(&mut s)\n    });\n}',
    testCode:
      'fn main() {\n    let mut s = String::from("hi");\n    assert_eq!(read_then_append(&mut s), 2);\n    assert_eq!(s, "hi!");\n}',
  },
  {
    slug: 'slices',
    title: 'Borrowed slice windows',
    rule: 'A slice borrows a contiguous region without owning its allocation.',
    decision: 'Use a checked length boundary before slicing the prefix.',
    signature: 'fn prefix(values: &[i32], n: usize) -> &[i32]',
    body: '&values[..n.min(values.len())]',
    assertions:
      'assert_eq!(prefix(&[1, 2, 3], 2), &[1, 2]); assert_eq!(prefix(&[4], 9), &[4]); assert_eq!(prefix(&[], 3), &[]);',
    call: 'prefix(&[1, 2, 3], 2)',
    output: '[1, 2]',
    topic: 'borrowing',
    solution:
      'fn prefix(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}',
    exampleCode:
      'fn prefix(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}\n\nfn main() {\n    println!("{:?}", prefix(&[1, 2, 3], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(prefix(&[1, 2, 3], 2), &[1, 2]);\n    assert_eq!(prefix(&[4], 9), &[4]);\n    assert_eq!(prefix(&[], 3), &[]);\n}',
  },
  {
    slug: 'utf8-bytes',
    title: 'Bytes and Unicode scalars',
    rule: 'String len counts UTF-8 bytes rather than Unicode scalar values.',
    decision:
      'Compare byte length with chars().count() to distinguish the units.',
    signature: 'fn text_units(text: &str) -> (usize, usize)',
    body: '(text.len(), text.chars().count())',
    assertions:
      'assert_eq!(text_units("é"), (2, 1)); assert_eq!(text_units("abc"), (3, 3)); assert_eq!(text_units(""), (0, 0));',
    call: 'text_units("é")',
    output: '(2, 1)',
    topic: 'strings',
    solution:
      'fn text_units(text: &str) -> (usize, usize) {\n    (text.len(), text.chars().count())\n}',
    exampleCode:
      'fn text_units(text: &str) -> (usize, usize) {\n    (text.len(), text.chars().count())\n}\n\nfn main() {\n    println!("{:?}", text_units("é"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(text_units("é"), (2, 1));\n    assert_eq!(text_units("abc"), (3, 3));\n    assert_eq!(text_units(""), (0, 0));\n}',
  },
  {
    slug: 'chars',
    title: 'Iterate Unicode scalars',
    rule: 'The chars iterator decodes a string into Unicode scalar values.',
    decision: 'Use chars().next() when the first scalar is needed.',
    signature: 'fn first_scalar(text: &str) -> Option<char>',
    body: 'text.chars().next()',
    assertions:
      'assert_eq!(first_scalar("éclair"), Some(\'é\')); assert_eq!(first_scalar(""), None);',
    call: 'first_scalar("éclair")',
    output: "Some('é')",
    topic: 'strings',
    solution:
      'fn first_scalar(text: &str) -> Option<char> {\n    text.chars().next()\n}',
    exampleCode:
      'fn first_scalar(text: &str) -> Option<char> {\n    text.chars().next()\n}\n\nfn main() {\n    println!("{:?}", first_scalar("éclair"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(first_scalar("éclair"), Some(\'é\'));\n    assert_eq!(first_scalar(""), None);\n}',
  },
  {
    slug: 'string-boundaries',
    title: 'Checked string boundaries',
    rule: 'str::get returns None when a requested byte range breaks a UTF-8 boundary.',
    decision:
      'Use get instead of unchecked indexing for an arbitrary byte endpoint.',
    signature: 'fn byte_prefix(text: &str, end: usize) -> Option<&str>',
    body: 'text.get(..end)',
    assertions:
      'assert_eq!(byte_prefix("éx", 2), Some("é")); assert_eq!(byte_prefix("éx", 1), None); assert_eq!(byte_prefix("a", 9), None);',
    call: 'byte_prefix("éx", 2)',
    output: 'Some("é")',
    topic: 'strings',
    solution:
      'fn byte_prefix(text: &str, end: usize) -> Option<&str> {\n    text.get(..end)\n}',
    exampleCode:
      'fn byte_prefix(text: &str, end: usize) -> Option<&str> {\n    text.get(..end)\n}\n\nfn main() {\n    println!("{:?}", byte_prefix("éx", 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(byte_prefix("éx", 2), Some("é"));\n    assert_eq!(byte_prefix("éx", 1), None);\n    assert_eq!(byte_prefix("a", 9), None);\n}',
  },
  {
    slug: 'string-conversion',
    title: 'Owned and borrowed text',
    rule: '&str is a borrowed string view while String owns growable UTF-8 storage.',
    decision:
      'Create owned storage only when the output must outlive or change independently of the input.',
    signature: 'fn shout(text: &str) -> String',
    body: "let mut owned = text.to_owned(); owned.push('!'); owned",
    assertions: 'assert_eq!(shout("go"), "go!"); assert_eq!(shout(""), "!");',
    call: 'shout("go")',
    output: '"go!"',
    topic: 'strings',
    solution:
      "fn shout(text: &str) -> String {\n    let mut owned = text.to_owned();\n    owned.push('!');\n    owned\n}",
    exampleCode:
      'fn shout(text: &str) -> String {\n    let mut owned = text.to_owned();\n    owned.push(\'!\');\n    owned\n}\n\nfn main() {\n    println!("{:?}", shout("go"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(shout("go"), "go!");\n    assert_eq!(shout(""), "!");\n}',
  },
  {
    slug: 'struct-fields',
    title: 'Named struct fields',
    rule: 'A struct groups named fields under a distinct type.',
    decision: 'Initialize every field required by the struct definition.',
    signature: 'fn area(width: u32, height: u32) -> u32',
    body: 'struct Rect { width: u32, height: u32 } let rect = Rect { width, height }; rect.width * rect.height',
    assertions: 'assert_eq!(area(3, 4), 12); assert_eq!(area(0, 8), 0);',
    call: 'area(3, 4)',
    output: '12',
    topic: 'structs',
    solution:
      'fn area(width: u32, height: u32) -> u32 {\n    struct Rect {\n        width: u32,\n        height: u32,\n    }\n    let rect = Rect { width, height };\n    rect.width * rect.height\n}',
    exampleCode:
      'fn area(width: u32, height: u32) -> u32 {\n    struct Rect {\n        width: u32,\n        height: u32,\n    }\n    let rect = Rect { width, height };\n    rect.width * rect.height\n}\n\nfn main() {\n    println!("{}", area(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(area(3, 4), 12);\n    assert_eq!(area(0, 8), 0);\n}',
  },
  {
    slug: 'tuple-structs',
    title: 'Tuple structs',
    rule: 'A tuple struct names a type whose fields are read by position as .0, .1, and so on.',
    decision: 'Read a tuple struct field by its position, starting from .0.',
    signature: 'fn swapped(x: i32, y: i32) -> (i32, i32)',
    body: 'struct Point(i32, i32); let point = Point(x, y); let flipped = Point(point.1, point.0); (flipped.0, flipped.1)',
    assertions:
      'assert_eq!(swapped(3, 4), (4, 3)); assert_eq!(swapped(-1, 0), (0, -1));',
    call: 'swapped(3, 4)',
    output: '(4, 3)',
    topic: 'structs',
    solution:
      'fn swapped(x: i32, y: i32) -> (i32, i32) {\n    struct Point(i32, i32);\n    let point = Point(x, y);\n    let flipped = Point(point.1, point.0);\n    (flipped.0, flipped.1)\n}',
    exampleCode:
      'fn swapped(x: i32, y: i32) -> (i32, i32) {\n    struct Point(i32, i32);\n    let point = Point(x, y);\n    let flipped = Point(point.1, point.0);\n    (flipped.0, flipped.1)\n}\n\nfn main() {\n    println!("{:?}", swapped(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(swapped(3, 4), (4, 3));\n    assert_eq!(swapped(-1, 0), (0, -1));\n}',
  },
  {
    slug: 'derive',
    title: 'Derive common traits',
    rule: '#[derive(Debug, Clone, PartialEq)] generates the code that lets a type print with {:?}, duplicate with clone, and compare with ==.',
    decision:
      'Derive Debug, Clone, and PartialEq on a struct before printing, cloning, or comparing its values.',
    signature: 'fn origin_report(x: i32, y: i32) -> (String, bool)',
    body: '#[derive(Debug, Clone, PartialEq)] struct Point { x: i32, y: i32, } let point = Point { x, y }; let copy = point.clone(); (format!("{:?}", copy), point == Point { x: 0, y: 0 })',
    assertions:
      'assert_eq!(origin_report(0, 0), (String::from("Point { x: 0, y: 0 }"), true)); assert_eq!(origin_report(3, -1), (String::from("Point { x: 3, y: -1 }"), false));',
    call: 'origin_report(3, -1)',
    output: '("Point { x: 3, y: -1 }", false)',
    topic: 'structs',
    solution:
      'fn origin_report(x: i32, y: i32) -> (String, bool) {\n    #[derive(Debug, Clone, PartialEq)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    let point = Point { x, y };\n    let copy = point.clone();\n    (format!("{:?}", copy), point == Point { x: 0, y: 0 })\n}',
    exampleCode:
      'fn origin_report(x: i32, y: i32) -> (String, bool) {\n    #[derive(Debug, Clone, PartialEq)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    let point = Point { x, y };\n    let copy = point.clone();\n    (format!("{:?}", copy), point == Point { x: 0, y: 0 })\n}\n\nfn main() {\n    println!("{:?}", origin_report(3, -1));\n}',
    testCode:
      'fn main() {\n    assert_eq!(origin_report(0, 0), (String::from("Point { x: 0, y: 0 }"), true));\n    assert_eq!(origin_report(3, -1), (String::from("Point { x: 3, y: -1 }"), false));\n}',
  },
  {
    slug: 'struct-update',
    title: 'Struct update syntax',
    rule: 'Struct update syntax fills unspecified fields from another value.',
    decision: 'Specify the changed field before the ..base update.',
    signature: 'fn revised_score(old: u32, new: u32) -> (u32, bool)',
    body: 'struct Entry { score: u32, active: bool } let base = Entry { score: old, active: true }; let revised = Entry { score: new, ..base }; (revised.score, revised.active)',
    assertions:
      'assert_eq!(revised_score(3, 9), (9, true)); assert_eq!(revised_score(7, 0), (0, true));',
    call: 'revised_score(3, 9)',
    output: '(9, true)',
    topic: 'structs',
    solution:
      'fn revised_score(old: u32, new: u32) -> (u32, bool) {\n    struct Entry {\n        score: u32,\n        active: bool,\n    }\n    let base = Entry {\n        score: old,\n        active: true,\n    };\n    let revised = Entry { score: new, ..base };\n    (revised.score, revised.active)\n}',
    exampleCode:
      'fn revised_score(old: u32, new: u32) -> (u32, bool) {\n    struct Entry {\n        score: u32,\n        active: bool,\n    }\n    let base = Entry {\n        score: old,\n        active: true,\n    };\n    let revised = Entry { score: new, ..base };\n    (revised.score, revised.active)\n}\n\nfn main() {\n    println!("{:?}", revised_score(3, 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(revised_score(3, 9), (9, true));\n    assert_eq!(revised_score(7, 0), (0, true));\n}',
  },
  {
    slug: 'methods',
    title: 'Methods and self',
    rule: 'A method receives its instance through self, &self, or &mut self.',
    decision:
      'Borrow with &self when calculating without consuming or changing the instance.',
    signature: 'fn doubled_score(score: u32) -> u32',
    body: 'struct Score(u32); impl Score { fn doubled(&self) -> u32 { self.0 * 2 } } Score(score).doubled()',
    assertions:
      'assert_eq!(doubled_score(6), 12); assert_eq!(doubled_score(0), 0);',
    call: 'doubled_score(6)',
    output: '12',
    topic: 'structs',
    solution:
      'fn doubled_score(score: u32) -> u32 {\n    struct Score(u32);\n    impl Score {\n        fn doubled(&self) -> u32 {\n            self.0 * 2\n        }\n    }\n    Score(score).doubled()\n}',
    exampleCode:
      'fn doubled_score(score: u32) -> u32 {\n    struct Score(u32);\n    impl Score {\n        fn doubled(&self) -> u32 {\n            self.0 * 2\n        }\n    }\n    Score(score).doubled()\n}\n\nfn main() {\n    println!("{:?}", doubled_score(6));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled_score(6), 12);\n    assert_eq!(doubled_score(0), 0);\n}',
  },
  {
    slug: 'associated-functions',
    title: 'Associated constructors',
    rule: 'An associated function without self is called through the type.',
    decision: 'Use Type::new when no existing instance is needed.',
    signature: 'fn default_count() -> u32',
    body: 'struct Counter { value: u32 } impl Counter { fn new() -> Self { Self { value: 0 } } } Counter::new().value',
    assertions: 'assert_eq!(default_count(), 0);',
    call: 'default_count()',
    output: '0',
    topic: 'structs',
    solution:
      'fn default_count() -> u32 {\n    struct Counter {\n        value: u32,\n    }\n    impl Counter {\n        fn new() -> Self {\n            Self { value: 0 }\n        }\n    }\n    Counter::new().value\n}',
    exampleCode:
      'fn default_count() -> u32 {\n    struct Counter {\n        value: u32,\n    }\n    impl Counter {\n        fn new() -> Self {\n            Self { value: 0 }\n        }\n    }\n    Counter::new().value\n}\n\nfn main() {\n    println!("{:?}", default_count());\n}',
    testCode: 'fn main() {\n    assert_eq!(default_count(), 0);\n}',
  },
  {
    slug: 'enum-variants',
    title: 'Enum variants',
    rule: 'An enum value holds exactly one of its declared variants.',
    decision: 'Use an enum to make mutually exclusive states explicit.',
    signature: 'fn is_ready(ready: bool) -> bool',
    body: 'enum State { Waiting, Ready } let state = if ready { State::Ready } else { State::Waiting }; matches!(state, State::Ready)',
    assertions: 'assert!(is_ready(true)); assert!(!is_ready(false));',
    call: 'is_ready(true)',
    output: 'true',
    topic: 'enums',
    solution:
      'fn is_ready(ready: bool) -> bool {\n    enum State {\n        Waiting,\n        Ready,\n    }\n    let state = if ready { State::Ready } else { State::Waiting };\n    matches!(state, State::Ready)\n}',
    exampleCode:
      'fn is_ready(ready: bool) -> bool {\n    enum State {\n        Waiting,\n        Ready,\n    }\n    let state = if ready { State::Ready } else { State::Waiting };\n    matches!(state, State::Ready)\n}\n\nfn main() {\n    println!("{}", is_ready(true));\n}',
    testCode:
      'fn main() {\n    assert!(is_ready(true));\n    assert!(!is_ready(false));\n}',
  },
  {
    slug: 'enum-data',
    title: 'Payload-bearing variants',
    rule: 'Each enum variant may carry data with its own shape.',
    decision:
      'Move the owned String into the Text variant, then match and bind its payload to read its length.',
    signature: 'fn message_size(text: String) -> usize',
    body: 'enum Message { Empty, Text(String) } let message = if text.is_empty() { Message::Empty } else { Message::Text(text) }; match message { Message::Empty => 0, Message::Text(payload) => payload.len() }',
    assertions:
      'assert_eq!(message_size(String::from("rust")), 4); assert_eq!(message_size(String::new()), 0); assert_eq!(message_size(String::from("a")), 1);',
    call: 'message_size(String::from("rust"))',
    output: '4',
    topic: 'enums',
    solution:
      'fn message_size(text: String) -> usize {\n    enum Message {\n        Empty,\n        Text(String),\n    }\n    let message = if text.is_empty() {\n        Message::Empty\n    } else {\n        Message::Text(text)\n    };\n    match message {\n        Message::Empty => 0,\n        Message::Text(payload) => payload.len(),\n    }\n}',
    exampleCode:
      'fn message_size(text: String) -> usize {\n    enum Message {\n        Empty,\n        Text(String),\n    }\n    let message = if text.is_empty() {\n        Message::Empty\n    } else {\n        Message::Text(text)\n    };\n    match message {\n        Message::Empty => 0,\n        Message::Text(payload) => payload.len(),\n    }\n}\n\nfn main() {\n    println!("{:?}", message_size(String::from("rust")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(message_size(String::from("rust")), 4);\n    assert_eq!(message_size(String::new()), 0);\n    assert_eq!(message_size(String::from("a")), 1);\n}',
  },
  {
    slug: 'if-let',
    title: 'Focus one pattern',
    rule: 'if let executes a branch when a value matches one selected pattern.',
    decision:
      'Provide an else path when the expression must return for every input.',
    signature: 'fn present_or_zero(value: Option<i32>) -> i32',
    body: 'if let Some(n) = value { n } else { 0 }',
    assertions:
      'assert_eq!(present_or_zero(Some(-3)), -3); assert_eq!(present_or_zero(None), 0);',
    call: 'present_or_zero(Some(7))',
    output: '7',
    topic: 'enums',
    solution:
      'fn present_or_zero(value: Option<i32>) -> i32 {\n    if let Some(n) = value {\n        n\n    } else {\n        0\n    }\n}',
    exampleCode:
      'fn present_or_zero(value: Option<i32>) -> i32 {\n    if let Some(n) = value {\n        n\n    } else {\n        0\n    }\n}\n\nfn main() {\n    println!("{:?}", present_or_zero(Some(7)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(present_or_zero(Some(-3)), -3);\n    assert_eq!(present_or_zero(None), 0);\n}',
  },
  {
    slug: 'destructure',
    title: 'Destructure nested patterns',
    rule: 'A pattern can unpack nested tuple and enum structure together.',
    decision: 'Bind only the data needed by the selected pattern.',
    signature: 'fn left_value(pair: Option<(i32, i32)>) -> Option<i32>',
    body: 'match pair { Some((left, _)) => Some(left), None => None }',
    assertions:
      'assert_eq!(left_value(Some((2, 9))), Some(2)); assert_eq!(left_value(None), None);',
    call: 'left_value(Some((2, 9)))',
    output: 'Some(2)',
    topic: 'enums',
    solution:
      'fn left_value(pair: Option<(i32, i32)>) -> Option<i32> {\n    match pair {\n        Some((left, _)) => Some(left),\n        None => None,\n    }\n}',
    exampleCode:
      'fn left_value(pair: Option<(i32, i32)>) -> Option<i32> {\n    match pair {\n        Some((left, _)) => Some(left),\n        None => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", left_value(Some((2, 9))));\n}',
    testCode:
      'fn main() {\n    assert_eq!(left_value(Some((2, 9))), Some(2));\n    assert_eq!(left_value(None), None);\n}',
  },
  {
    slug: 'option',
    title: 'Some and None',
    rule: 'Option models either a present value or an absent value without a null reference.',
    decision: 'Return None when searching an empty slice.',
    signature: 'fn first_number(values: &[i32]) -> Option<i32>',
    body: 'if values.is_empty() { None } else { Some(values[0]) }',
    assertions:
      'assert_eq!(first_number(&[0, 3]), Some(0)); assert_eq!(first_number(&[]), None);',
    call: 'first_number(&[0, 3])',
    output: 'Some(0)',
    topic: 'option',
    solution:
      'fn first_number(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        None\n    } else {\n        Some(values[0])\n    }\n}',
    exampleCode:
      'fn first_number(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        None\n    } else {\n        Some(values[0])\n    }\n}\n\nfn main() {\n    println!("{:?}", first_number(&[0, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(first_number(&[0, 3]), Some(0));\n    assert_eq!(first_number(&[]), None);\n}',
  },
  {
    slug: 'option-map',
    title: 'Map a present value',
    rule: 'Option::map calls a transformation function for Some and preserves None without calling it.',
    decision:
      'Pass a named function to map when that function returns the transformed value directly.',
    signature: 'fn doubled(value: Option<i32>) -> Option<i32>',
    body: 'fn double_number(n: i32) -> i32 { n * 2 } value.map(double_number)',
    assertions:
      'assert_eq!(doubled(Some(3)), Some(6)); assert_eq!(doubled(Some(-2)), Some(-4)); assert_eq!(doubled(None), None);',
    call: 'doubled(Some(3))',
    output: 'Some(6)',
    topic: 'option',
    solution:
      'fn doubled(value: Option<i32>) -> Option<i32> {\n    fn double_number(n: i32) -> i32 {\n        n * 2\n    }\n    value.map(double_number)\n}',
    exampleCode:
      'fn doubled(value: Option<i32>) -> Option<i32> {\n    fn double_number(n: i32) -> i32 {\n        n * 2\n    }\n    value.map(double_number)\n}\n\nfn main() {\n    println!("{:?}", doubled(Some(3)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled(Some(3)), Some(6));\n    assert_eq!(doubled(Some(-2)), Some(-4));\n    assert_eq!(doubled(None), None);\n}',
  },
  {
    slug: 'option-and-then',
    title: 'Chain optional operations',
    rule: 'Option::and_then calls a function returning Option for Some and flattens the result, preserving None.',
    decision:
      'Pair the present number with its divisor, then pass a named checked-division function to and_then so invalid division returns None.',
    signature:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32>',
    body: 'fn divide_pair(pair: (i32, i32)) -> Option<i32> { pair.0.checked_div(pair.1) } let pair = match value { Some(n) => Some((n, divisor)), None => None }; pair.and_then(divide_pair)',
    assertions:
      'assert_eq!(optional_divide(Some(8), 2), Some(4)); assert_eq!(optional_divide(Some(8), 0), None); assert_eq!(optional_divide(None, 2), None); assert_eq!(optional_divide(Some(i32::MIN), -1), None);',
    call: 'optional_divide(Some(8), 2)',
    output: 'Some(4)',
    topic: 'option',
    solution:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32> {\n    fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n        pair.0.checked_div(pair.1)\n    }\n    let pair = match value {\n        Some(n) => Some((n, divisor)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}',
    exampleCode:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32> {\n    fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n        pair.0.checked_div(pair.1)\n    }\n    let pair = match value {\n        Some(n) => Some((n, divisor)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}\n\nfn main() {\n    println!("{:?}", optional_divide(Some(8), 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(optional_divide(Some(8), 2), Some(4));\n    assert_eq!(optional_divide(Some(8), 0), None);\n    assert_eq!(optional_divide(None, 2), None);\n    assert_eq!(optional_divide(Some(i32::MIN), -1), None);\n}',
  },
  {
    slug: 'option-transpose',
    title: 'Transpose optional errors',
    rule: 'transpose converts Option<Result<T,E>> into Result<Option<T>,E>.',
    decision:
      'Keep absence successful while preserving a present parsing error.',
    signature:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError>',
    body: 'text.map(str::parse::<i32>).transpose()',
    assertions:
      'assert_eq!(parse_optional(Some("12")).unwrap(), Some(12)); assert_eq!(parse_optional(None).unwrap(), None); assert!(parse_optional(Some("bad")).is_err());',
    call: 'parse_optional(Some("12"))',
    output: 'Ok(Some(12))',
    topic: 'option',
    solution:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}',
    exampleCode:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}\n\nfn main() {\n    println!("{:?}", parse_optional(Some("12")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_optional(Some("12")).unwrap(), Some(12));\n    assert_eq!(parse_optional(None).unwrap(), None);\n    assert!(parse_optional(Some("bad")).is_err());\n}',
  },
  {
    slug: 'result',
    title: 'Ok and Err',
    rule: 'Result distinguishes a successful payload from a recoverable error payload.',
    decision:
      'Return Err for invalid input instead of inventing a success value.',
    signature: "fn nonnegative(n: i32) -> Result<u32, &'static str>",
    body: 'if n < 0 { Err("negative") } else { Ok(n as u32) }',
    assertions:
      'assert_eq!(nonnegative(3), Ok(3)); assert_eq!(nonnegative(0), Ok(0)); assert_eq!(nonnegative(-1), Err("negative"));',
    call: 'nonnegative(-1)',
    output: 'Err("negative")',
    topic: 'errors',
    solution:
      'fn nonnegative(n: i32) -> Result<u32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n as u32)\n    }\n}',
    exampleCode:
      'fn nonnegative(n: i32) -> Result<u32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n as u32)\n    }\n}\n\nfn main() {\n    println!("{:?}", nonnegative(-1));\n}',
    testCode:
      'fn main() {\n    assert_eq!(nonnegative(3), Ok(3));\n    assert_eq!(nonnegative(0), Ok(0));\n    assert_eq!(nonnegative(-1), Err("negative"));\n}',
  },
  {
    slug: 'result-map',
    title: 'Transform success',
    rule: 'Result::map calls a transformation function for Ok while preserving the Err payload.',
    decision:
      'Pass a named increment function to map so arithmetic applies only to a successful input.',
    signature:
      "fn add_success(value: Result<i32, &'static str>) -> Result<i32, &'static str>",
    body: 'fn increment(n: i32) -> i32 { n + 1 } value.map(increment)',
    assertions:
      'assert_eq!(add_success(Ok(2)), Ok(3)); assert_eq!(add_success(Ok(-1)), Ok(0)); assert_eq!(add_success(Err("bad")), Err("bad"));',
    call: 'add_success(Ok(2))',
    output: 'Ok(3)',
    topic: 'errors',
    solution:
      "fn add_success(value: Result<i32, &'static str>) -> Result<i32, &'static str> {\n    fn increment(n: i32) -> i32 {\n        n + 1\n    }\n    value.map(increment)\n}",
    exampleCode:
      'fn add_success(value: Result<i32, &\'static str>) -> Result<i32, &\'static str> {\n    fn increment(n: i32) -> i32 {\n        n + 1\n    }\n    value.map(increment)\n}\n\nfn main() {\n    println!("{:?}", add_success(Ok(2)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(add_success(Ok(2)), Ok(3));\n    assert_eq!(add_success(Ok(-1)), Ok(0));\n    assert_eq!(add_success(Err("bad")), Err("bad"));\n}',
  },
  {
    slug: 'map-error',
    title: 'Translate an error',
    rule: 'Result::map_err calls a transformation function for the error payload and preserves Ok.',
    decision:
      'Pass a named context function to map_err to format the error without changing a successful result.',
    signature: 'fn contextual(value: Result<i32, &str>) -> Result<i32, String>',
    body: 'fn context(error: &str) -> String { format!("input: {}", error) } value.map_err(context)',
    assertions:
      'assert_eq!(contextual(Ok(7)), Ok(7)); assert_eq!(contextual(Err("bad")), Err(String::from("input: bad"))); assert_eq!(contextual(Err("")), Err(String::from("input: ")));',
    call: 'contextual(Err("bad"))',
    output: 'Err("input: bad")',
    topic: 'errors',
    solution:
      'fn contextual(value: Result<i32, &str>) -> Result<i32, String> {\n    fn context(error: &str) -> String {\n        format!("input: {}", error)\n    }\n    value.map_err(context)\n}',
    exampleCode:
      'fn contextual(value: Result<i32, &str>) -> Result<i32, String> {\n    fn context(error: &str) -> String {\n        format!("input: {}", error)\n    }\n    value.map_err(context)\n}\n\nfn main() {\n    println!("{:?}", contextual(Err("bad")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(contextual(Ok(7)), Ok(7));\n    assert_eq!(contextual(Err("bad")), Err(String::from("input: bad")));\n    assert_eq!(contextual(Err("")), Err(String::from("input: ")));\n}',
  },
  {
    slug: 'question-mark',
    title: 'Propagate with question mark',
    rule: 'The ? operator returns early on an error and unwraps a success for further work.',
    decision:
      'Use a compatible Result return type when propagating parsing errors.',
    signature:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError>',
    body: 'let left = a.parse::<i32>()?; let right = b.parse::<i32>()?; Ok(left + right)',
    assertions:
      'assert_eq!(parse_sum("3", "4").unwrap(), 7); assert!(parse_sum("bad", "4").is_err()); assert!(parse_sum("3", "bad").is_err());',
    call: 'parse_sum("3", "4")',
    output: 'Ok(7)',
    topic: 'errors',
    solution:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let left = a.parse::<i32>()?;\n    let right = b.parse::<i32>()?;\n    Ok(left + right)\n}',
    exampleCode:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let left = a.parse::<i32>()?;\n    let right = b.parse::<i32>()?;\n    Ok(left + right)\n}\n\nfn main() {\n    println!("{:?}", parse_sum("3", "4"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_sum("3", "4").unwrap(), 7);\n    assert!(parse_sum("bad", "4").is_err());\n    assert!(parse_sum("3", "bad").is_err());\n}',
  },
  {
    slug: 'turbofish',
    title: 'Choose a type argument with turbofish',
    rule: 'When the result type of a generic function such as parse cannot be inferred, writing ::<T> after its name chooses T.',
    decision:
      'Write parse::<u8>() so the text is checked against the u8 range.',
    signature:
      'fn parse_byte(text: &str) -> Result<u8, std::num::ParseIntError>',
    body: 'text.parse::<u8>()',
    assertions:
      'assert_eq!(parse_byte("200"), Ok(200)); assert!(parse_byte("256").is_err()); assert!(parse_byte("-1").is_err());',
    call: 'parse_byte("200")',
    output: 'Ok(200)',
    topic: 'conversions',
    solution:
      'fn parse_byte(text: &str) -> Result<u8, std::num::ParseIntError> {\n    text.parse::<u8>()\n}',
    exampleCode:
      'fn parse_byte(text: &str) -> Result<u8, std::num::ParseIntError> {\n    text.parse::<u8>()\n}\n\nfn main() {\n    println!("{:?}", parse_byte("200"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_byte("200"), Ok(200));\n    assert!(parse_byte("256").is_err());\n    assert!(parse_byte("-1").is_err());\n}',
  },
  {
    slug: 'from-into',
    title: 'Lossless conversions with From',
    rule: 'From defines a conversion that cannot fail, and into performs the same conversion when the target type is known.',
    decision:
      'Widen each smaller integer to i64 with From or into before adding.',
    signature: 'fn widen_sum(a: i32, b: u8) -> i64',
    body: 'let left = i64::from(a); let right: i64 = b.into(); left + right',
    assertions:
      'assert_eq!(widen_sum(-3, 200), 197); assert_eq!(widen_sum(i32::MAX, 255), 2147483902); assert_eq!(widen_sum(0, 0), 0);',
    call: 'widen_sum(-3, 200)',
    output: '197',
    topic: 'conversions',
    solution:
      'fn widen_sum(a: i32, b: u8) -> i64 {\n    let left = i64::from(a);\n    let right: i64 = b.into();\n    left + right\n}',
    exampleCode:
      'fn widen_sum(a: i32, b: u8) -> i64 {\n    let left = i64::from(a);\n    let right: i64 = b.into();\n    left + right\n}\n\nfn main() {\n    println!("{}", widen_sum(-3, 200));\n}',
    testCode:
      'fn main() {\n    assert_eq!(widen_sum(-3, 200), 197);\n    assert_eq!(widen_sum(i32::MAX, 255), 2147483902);\n    assert_eq!(widen_sum(0, 0), 0);\n}',
  },
  {
    slug: 'try-from',
    title: 'Fallible conversions with TryFrom',
    rule: 'TryFrom and try_into return a Result because the value might not fit the target type.',
    decision:
      'Match on the Result of u8::try_from and choose an explicit fallback for each out-of-range side.',
    signature: 'fn clamp_to_byte(n: i32) -> u8',
    body: 'match u8::try_from(n) { Ok(byte) => byte, Err(_) => { if n < 0 { 0 } else { 255 } } }',
    assertions:
      'assert_eq!(clamp_to_byte(7), 7); assert_eq!(clamp_to_byte(300), 255); assert_eq!(clamp_to_byte(-5), 0); assert_eq!(clamp_to_byte(255), 255);',
    call: 'clamp_to_byte(300)',
    output: '255',
    topic: 'conversions',
    solution:
      'fn clamp_to_byte(n: i32) -> u8 {\n    match u8::try_from(n) {\n        Ok(byte) => byte,\n        Err(_) => {\n            if n < 0 {\n                0\n            } else {\n                255\n            }\n        }\n    }\n}',
    exampleCode:
      'fn clamp_to_byte(n: i32) -> u8 {\n    match u8::try_from(n) {\n        Ok(byte) => byte,\n        Err(_) => {\n            if n < 0 {\n                0\n            } else {\n                255\n            }\n        }\n    }\n}\n\nfn main() {\n    println!("{}", clamp_to_byte(300));\n}',
    testCode:
      'fn main() {\n    assert_eq!(clamp_to_byte(7), 7);\n    assert_eq!(clamp_to_byte(300), 255);\n    assert_eq!(clamp_to_byte(-5), 0);\n    assert_eq!(clamp_to_byte(255), 255);\n}',
  },
  {
    slug: 'copied-cloned',
    title: 'Copy out of an optional reference',
    rule: 'copied turns an Option<&T> into an Option<T> by copying the value, and cloned does the same by cloning it.',
    decision:
      'Call copied on the Option<&i32> from first or last when the caller needs an owned i32.',
    signature: 'fn ends(values: &[i32]) -> (Option<i32>, Option<i32>)',
    body: '(values.first().copied(), values.last().copied())',
    assertions:
      'assert_eq!(ends(&[3, 8, 5]), (Some(3), Some(5))); assert_eq!(ends(&[]), (None, None)); assert_eq!(ends(&[7]), (Some(7), Some(7)));',
    call: 'ends(&[3, 8, 5])',
    output: '(Some(3), Some(5))',
    topic: 'option-tools',
    solution:
      'fn ends(values: &[i32]) -> (Option<i32>, Option<i32>) {\n    (values.first().copied(), values.last().copied())\n}',
    exampleCode:
      'fn ends(values: &[i32]) -> (Option<i32>, Option<i32>) {\n    (values.first().copied(), values.last().copied())\n}\n\nfn main() {\n    println!("{:?}", ends(&[3, 8, 5]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(ends(&[3, 8, 5]), (Some(3), Some(5)));\n    assert_eq!(ends(&[]), (None, None));\n    assert_eq!(ends(&[7]), (Some(7), Some(7)));\n}',
  },
  {
    slug: 'option-queries',
    title: 'Query and default optional values',
    rule: 'Methods such as is_some, unwrap_or, ok, and ok_or inspect or convert an Option or Result without a match.',
    decision:
      'Turn a failed parse into None with ok, then supply the fallback with unwrap_or.',
    signature: 'fn port_or_default(text: &str) -> u16',
    body: 'text.parse::<u16>().ok().unwrap_or(8080)',
    assertions:
      'assert_eq!(port_or_default("443"), 443); assert_eq!(port_or_default("http"), 8080); assert_eq!(port_or_default("70000"), 8080); assert_eq!(port_or_default("0"), 0);',
    call: 'port_or_default("443")',
    output: '443',
    topic: 'option-tools',
    solution:
      'fn port_or_default(text: &str) -> u16 {\n    text.parse::<u16>().ok().unwrap_or(8080)\n}',
    exampleCode:
      'fn port_or_default(text: &str) -> u16 {\n    text.parse::<u16>().ok().unwrap_or(8080)\n}\n\nfn main() {\n    println!("{}", port_or_default("443"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(port_or_default("443"), 443);\n    assert_eq!(port_or_default("http"), 8080);\n    assert_eq!(port_or_default("70000"), 8080);\n    assert_eq!(port_or_default("0"), 0);\n}',
  },
  {
    slug: 'unwrap',
    title: 'Unwrap and expect',
    rule: 'unwrap and expect return the value inside Some or Ok and panic on None or Err, and expect adds your message to the panic.',
    decision:
      'Use expect with a message that names the broken assumption, and only where failure would be a bug.',
    signature: 'fn total_of(a: &str, b: &str) -> i32',
    body: 'let left: i32 = a.parse().expect("left operand must be a number"); let right: i32 = b.parse().expect("right operand must be a number"); left + right',
    assertions:
      'assert_eq!(total_of("3", "4"), 7); assert_eq!(total_of("-10", "4"), -6);',
    call: 'total_of("3", "4")',
    output: '7',
    topic: 'option-tools',
    solution:
      'fn total_of(a: &str, b: &str) -> i32 {\n    let left: i32 = a.parse().expect("left operand must be a number");\n    let right: i32 = b.parse().expect("right operand must be a number");\n    left + right\n}',
    exampleCode:
      'fn total_of(a: &str, b: &str) -> i32 {\n    let left: i32 = a.parse().expect("left operand must be a number");\n    let right: i32 = b.parse().expect("right operand must be a number");\n    left + right\n}\n\nfn main() {\n    println!("{}", total_of("3", "4"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(total_of("3", "4"), 7);\n    assert_eq!(total_of("-10", "4"), -6);\n}',
  },
  {
    slug: 'option-question-mark',
    title: 'Question mark on Option',
    rule: 'In a function returning Option, ? unwraps Some and returns None from the whole function as soon as a value is missing.',
    decision:
      'Apply ? to each lookup that might be missing and wrap the final result in Some.',
    signature: 'fn first_plus_last(values: &[i32]) -> Option<i32>',
    body: 'let first = values.first()?; let last = values.last()?; Some(first + last)',
    assertions:
      'assert_eq!(first_plus_last(&[2, 5, 9]), Some(11)); assert_eq!(first_plus_last(&[]), None); assert_eq!(first_plus_last(&[4]), Some(8));',
    call: 'first_plus_last(&[2, 5, 9])',
    output: 'Some(11)',
    topic: 'option-tools',
    solution:
      'fn first_plus_last(values: &[i32]) -> Option<i32> {\n    let first = values.first()?;\n    let last = values.last()?;\n    Some(first + last)\n}',
    exampleCode:
      'fn first_plus_last(values: &[i32]) -> Option<i32> {\n    let first = values.first()?;\n    let last = values.last()?;\n    Some(first + last)\n}\n\nfn main() {\n    println!("{:?}", first_plus_last(&[2, 5, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(first_plus_last(&[2, 5, 9]), Some(11));\n    assert_eq!(first_plus_last(&[]), None);\n    assert_eq!(first_plus_last(&[4]), Some(8));\n}',
  },
  {
    slug: 'vec-push',
    title: 'Vector push and pop',
    rule: 'Vec owns a contiguous growable sequence and pop returns an optional last element.',
    decision: 'Use pop to handle an empty vector without invalid indexing.',
    signature:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize)',
    body: 'values.push(extra); let removed = values.pop(); (removed, values.len())',
    assertions:
      'assert_eq!(pushed_then_popped(vec![1, 2], 9), (Some(9), 2)); assert_eq!(pushed_then_popped(vec![], 3), (Some(3), 0));',
    call: 'pushed_then_popped(vec![1, 2], 9)',
    output: '(Some(9), 2)',
    topic: 'vectors',
    solution:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize) {\n    values.push(extra);\n    let removed = values.pop();\n    (removed, values.len())\n}',
    exampleCode:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize) {\n    values.push(extra);\n    let removed = values.pop();\n    (removed, values.len())\n}\n\nfn main() {\n    println!("{:?}", pushed_then_popped(vec![1, 2], 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(pushed_then_popped(vec![1, 2], 9), (Some(9), 2));\n    assert_eq!(pushed_then_popped(vec![], 3), (Some(3), 0));\n}',
  },
  {
    slug: 'vec-get',
    title: 'Checked vector access',
    rule: 'get returns an optional reference rather than panicking on an invalid index.',
    decision:
      'Copy an i32 from the optional reference when an owned value is required.',
    signature: 'fn at(values: &[i32], index: usize) -> Option<i32>',
    body: 'values.get(index).copied()',
    assertions:
      'assert_eq!(at(&[5, 8], 1), Some(8)); assert_eq!(at(&[5], 2), None); assert_eq!(at(&[], 0), None);',
    call: 'at(&[5, 8], 1)',
    output: 'Some(8)',
    topic: 'vectors',
    solution:
      'fn at(values: &[i32], index: usize) -> Option<i32> {\n    values.get(index).copied()\n}',
    exampleCode:
      'fn at(values: &[i32], index: usize) -> Option<i32> {\n    values.get(index).copied()\n}\n\nfn main() {\n    println!("{:?}", at(&[5, 8], 1));\n}',
    testCode:
      'fn main() {\n    assert_eq!(at(&[5, 8], 1), Some(8));\n    assert_eq!(at(&[5], 2), None);\n    assert_eq!(at(&[], 0), None);\n}',
  },
  {
    slug: 'vec-retain',
    title: 'Retain matching elements',
    rule: 'retain removes elements for which its predicate is false while preserving order.',
    decision:
      'Pass a named predicate accepting &i32 to retain, and keep an element when its dereferenced value is nonnegative.',
    signature: 'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32>',
    body: 'fn is_nonnegative(n: &i32) -> bool { *n >= 0 } values.retain(is_nonnegative); values',
    assertions:
      'assert_eq!(keep_nonnegative(vec![-1, 0, 3, -4]), vec![0, 3]); assert!(keep_nonnegative(vec![-1]).is_empty()); assert_eq!(keep_nonnegative(vec![3, 1, 0]), vec![3, 1, 0]); assert!(keep_nonnegative(vec![]).is_empty());',
    call: 'keep_nonnegative(vec![-1, 0, 3, -4])',
    output: '[0, 3]',
    topic: 'vectors',
    solution:
      'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32> {\n    fn is_nonnegative(n: &i32) -> bool {\n        *n >= 0\n    }\n    values.retain(is_nonnegative);\n    values\n}',
    exampleCode:
      'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32> {\n    fn is_nonnegative(n: &i32) -> bool {\n        *n >= 0\n    }\n    values.retain(is_nonnegative);\n    values\n}\n\nfn main() {\n    println!("{:?}", keep_nonnegative(vec![-1, 0, 3, -4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(keep_nonnegative(vec![-1, 0, 3, -4]), vec![0, 3]);\n    assert!(keep_nonnegative(vec![-1]).is_empty());\n    assert_eq!(keep_nonnegative(vec![3, 1, 0]), vec![3, 1, 0]);\n    assert!(keep_nonnegative(vec![]).is_empty());\n}',
  },
  {
    slug: 'vec-extend',
    title: 'Extend from an iterator',
    rule: 'extend appends items obtained from an iterator in iterator order.',
    decision:
      'Use copied() to turn an iterator of references into copied scalar elements.',
    signature: 'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32>',
    body: 'left.extend(right.iter().copied()); left',
    assertions:
      'assert_eq!(joined(vec![1], &[2, 3]), vec![1, 2, 3]); assert_eq!(joined(vec![1], &[]), vec![1]);',
    call: 'joined(vec![1], &[2, 3])',
    output: '[1, 2, 3]',
    topic: 'vectors',
    solution:
      'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32> {\n    left.extend(right.iter().copied());\n    left\n}',
    exampleCode:
      'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32> {\n    left.extend(right.iter().copied());\n    left\n}\n\nfn main() {\n    println!("{:?}", joined(vec![1], &[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(joined(vec![1], &[2, 3]), vec![1, 2, 3]);\n    assert_eq!(joined(vec![1], &[]), vec![1]);\n}',
  },
  {
    slug: 'while-let',
    title: 'Loop while a pattern matches',
    rule: 'while let repeats its body as long as the value matches the pattern and stops at the first value that does not.',
    decision:
      'Pop from the vector in the while let condition so the loop ends when pop returns None.',
    signature: 'fn reversed(mut stack: Vec<i32>) -> Vec<i32>',
    body: 'let mut out = Vec::new(); while let Some(top) = stack.pop() { out.push(top); } out',
    assertions:
      'assert_eq!(reversed(vec![1, 2, 3]), vec![3, 2, 1]); assert!(reversed(vec![]).is_empty()); assert_eq!(reversed(vec![5]), vec![5]);',
    call: 'reversed(vec![1, 2, 3])',
    output: '[3, 2, 1]',
    topic: 'queues',
    solution:
      'fn reversed(mut stack: Vec<i32>) -> Vec<i32> {\n    let mut out = Vec::new();\n    while let Some(top) = stack.pop() {\n        out.push(top);\n    }\n    out\n}',
    exampleCode:
      'fn reversed(mut stack: Vec<i32>) -> Vec<i32> {\n    let mut out = Vec::new();\n    while let Some(top) = stack.pop() {\n        out.push(top);\n    }\n    out\n}\n\nfn main() {\n    println!("{:?}", reversed(vec![1, 2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(reversed(vec![1, 2, 3]), vec![3, 2, 1]);\n    assert!(reversed(vec![]).is_empty());\n    assert_eq!(reversed(vec![5]), vec![5]);\n}',
  },
  {
    slug: 'vecdeque',
    title: 'Queues with VecDeque',
    rule: 'VecDeque adds and removes values cheaply at both ends, so push_back with pop_front serves values first in, first out.',
    decision:
      'Push new values at the back and drop the oldest from the front once the window is too long.',
    signature: 'fn last_k(values: &[i32], k: usize) -> Vec<i32>',
    body: 'let mut window = std::collections::VecDeque::new(); for &value in values { window.push_back(value); if window.len() > k { window.pop_front(); } } let mut out = Vec::new(); while let Some(value) = window.pop_front() { out.push(value); } out',
    assertions:
      'assert_eq!(last_k(&[1, 2, 3, 4], 2), vec![3, 4]); assert_eq!(last_k(&[5], 3), vec![5]); assert!(last_k(&[1, 2], 0).is_empty());',
    call: 'last_k(&[1, 2, 3, 4], 2)',
    output: '[3, 4]',
    topic: 'queues',
    solution:
      'fn last_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut window = std::collections::VecDeque::new();\n    for &value in values {\n        window.push_back(value);\n        if window.len() > k {\n            window.pop_front();\n        }\n    }\n    let mut out = Vec::new();\n    while let Some(value) = window.pop_front() {\n        out.push(value);\n    }\n    out\n}',
    exampleCode:
      'fn last_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut window = std::collections::VecDeque::new();\n    for &value in values {\n        window.push_back(value);\n        if window.len() > k {\n            window.pop_front();\n        }\n    }\n    let mut out = Vec::new();\n    while let Some(value) = window.pop_front() {\n        out.push(value);\n    }\n    out\n}\n\nfn main() {\n    println!("{:?}", last_k(&[1, 2, 3, 4], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(last_k(&[1, 2, 3, 4], 2), vec![3, 4]);\n    assert_eq!(last_k(&[5], 3), vec![5]);\n    assert!(last_k(&[1, 2], 0).is_empty());\n}',
  },
  {
    slug: 'map-entry',
    title: 'Hash map entry updates',
    rule: 'entry accesses an existing value or inserts a value for an absent key.',
    decision: 'Increment the mutable value returned by or_insert.',
    signature:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize>',
    body: 'let mut counts = std::collections::HashMap::new(); for &n in values { *counts.entry(n).or_insert(0) += 1; } counts',
    assertions:
      'let m = frequencies(&[2, 2, 3]); assert_eq!(m.get(&2), Some(&2)); assert_eq!(m.get(&3), Some(&1)); assert!(frequencies(&[]).is_empty());',
    call: 'frequencies(&[2, 2, 3]).get(&2).copied()',
    output: 'Some(2)',
    topic: 'maps-sets',
    solution:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize> {\n    let mut counts = std::collections::HashMap::new();\n    for &n in values {\n        *counts.entry(n).or_insert(0) += 1;\n    }\n    counts\n}',
    exampleCode:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize> {\n    let mut counts = std::collections::HashMap::new();\n    for &n in values {\n        *counts.entry(n).or_insert(0) += 1;\n    }\n    counts\n}\n\nfn main() {\n    println!("{:?}", frequencies(&[2, 2, 3]).get(&2).copied());\n}',
    testCode:
      'fn main() {\n    let m = frequencies(&[2, 2, 3]);\n    assert_eq!(m.get(&2), Some(&2));\n    assert_eq!(m.get(&3), Some(&1));\n    assert!(frequencies(&[]).is_empty());\n}',
  },
  {
    slug: 'map-lookup',
    title: 'Borrowed map lookup',
    rule: 'A map lookup returns an optional reference to a value associated with its key.',
    decision: 'Keep absent keys distinct from keys whose stored value is zero.',
    signature:
      'fn find_score(entries: &[(&str, u32)], name: &str) -> Option<u32>',
    body: 'let mut scores = std::collections::HashMap::new(); for &(key, value) in entries { scores.insert(key, value); } scores.get(name).copied()',
    assertions:
      'let entries = [("a", 0), ("b", 8)]; assert_eq!(find_score(&entries, "a"), Some(0)); assert_eq!(find_score(&entries, "x"), None);',
    call: 'find_score(&[("a", 0), ("b", 8)], "b")',
    output: 'Some(8)',
    topic: 'maps-sets',
    solution:
      'fn find_score(entries: &[(&str, u32)], name: &str) -> Option<u32> {\n    let mut scores = std::collections::HashMap::new();\n    for &(key, value) in entries {\n        scores.insert(key, value);\n    }\n    scores.get(name).copied()\n}',
    exampleCode:
      'fn find_score(entries: &[(&str, u32)], name: &str) -> Option<u32> {\n    let mut scores = std::collections::HashMap::new();\n    for &(key, value) in entries {\n        scores.insert(key, value);\n    }\n    scores.get(name).copied()\n}\n\nfn main() {\n    println!("{:?}", find_score(&[("a", 0), ("b", 8)], "b"));\n}',
    testCode:
      'fn main() {\n    let entries = [("a", 0), ("b", 8)];\n    assert_eq!(find_score(&entries, "a"), Some(0));\n    assert_eq!(find_score(&entries, "x"), None);\n}',
  },
  {
    slug: 'hash-set',
    title: 'Deduplicate with a set',
    rule: 'HashSet stores at most one element equal to each distinct value.',
    decision:
      'Use the set length to count unique values without depending on iteration order.',
    signature: 'fn unique_count(values: &[i32]) -> usize',
    body: 'let mut seen = std::collections::HashSet::new(); for &value in values { seen.insert(value); } seen.len()',
    assertions:
      'assert_eq!(unique_count(&[3, 3, 1, 3]), 2); assert_eq!(unique_count(&[]), 0);',
    call: 'unique_count(&[3, 3, 1, 3])',
    output: '2',
    topic: 'maps-sets',
    solution:
      'fn unique_count(values: &[i32]) -> usize {\n    let mut seen = std::collections::HashSet::new();\n    for &value in values {\n        seen.insert(value);\n    }\n    seen.len()\n}',
    exampleCode:
      'fn unique_count(values: &[i32]) -> usize {\n    let mut seen = std::collections::HashSet::new();\n    for &value in values {\n        seen.insert(value);\n    }\n    seen.len()\n}\n\nfn main() {\n    println!("{:?}", unique_count(&[3, 3, 1, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(unique_count(&[3, 3, 1, 3]), 2);\n    assert_eq!(unique_count(&[]), 0);\n}',
  },
  {
    slug: 'btree-range',
    title: 'Ordered map ranges',
    rule: 'BTreeMap keeps keys ordered and can visit only keys within a specified range.',
    decision:
      'Use an inclusive range when both boundary keys should participate.',
    signature:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32',
    body: 'if low > high { return 0; } let mut map = std::collections::BTreeMap::new(); for &(key, value) in entries { map.insert(key, value); } let mut total = 0; for (_, value) in map.range(low..=high) { total += value; } total',
    assertions:
      'assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2), 8); assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 2, 4), 12); assert_eq!(range_total(&[(1, 3)], 4, 2), 0);',
    call: 'range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2)',
    output: '8',
    topic: 'maps-sets',
    solution:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32 {\n    if low > high {\n        return 0;\n    }\n    let mut map = std::collections::BTreeMap::new();\n    for &(key, value) in entries {\n        map.insert(key, value);\n    }\n    let mut total = 0;\n    for (_, value) in map.range(low..=high) {\n        total += value;\n    }\n    total\n}',
    exampleCode:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32 {\n    if low > high {\n        return 0;\n    }\n    let mut map = std::collections::BTreeMap::new();\n    for &(key, value) in entries {\n        map.insert(key, value);\n    }\n    let mut total = 0;\n    for (_, value) in map.range(low..=high) {\n        total += value;\n    }\n    total\n}\n\nfn main() {\n    println!("{:?}", range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2), 8);\n    assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 2, 4), 12);\n    assert_eq!(range_total(&[(1, 3)], 4, 2), 0);\n}',
  },
  {
    slug: 'generic-functions',
    title: 'Generic function parameters',
    rule: 'A type parameter lets one function work with several concrete types.',
    decision:
      'Return the input without assuming operations unavailable on an unconstrained type.',
    signature: 'fn identity<T>(value: T) -> T',
    body: 'value',
    assertions:
      'assert_eq!(identity(7), 7); assert_eq!(identity(String::from("rust")), "rust");',
    call: 'identity(7)',
    output: '7',
    topic: 'generics',
    solution: 'fn identity<T>(value: T) -> T {\n    value\n}',
    exampleCode:
      'fn identity<T>(value: T) -> T {\n    value\n}\n\nfn main() {\n    println!("{:?}", identity(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(identity(7), 7);\n    assert_eq!(identity(String::from("rust")), "rust");\n}',
  },
  {
    slug: 'generic-structs',
    title: 'Generic record fields',
    rule: 'A generic struct stores fields parameterized by its declared type argument.',
    decision:
      'Use the same type parameter consistently in the field and impl definitions.',
    signature: 'fn unwrap_holder<T>(value: T) -> T',
    body: 'struct Holder<T> { value: T } let holder = Holder { value }; holder.value',
    assertions:
      'assert_eq!(unwrap_holder(3), 3); assert_eq!(unwrap_holder("hi"), "hi");',
    call: 'unwrap_holder("hi")',
    output: '"hi"',
    topic: 'generics',
    solution:
      'fn unwrap_holder<T>(value: T) -> T {\n    struct Holder<T> {\n        value: T,\n    }\n    let holder = Holder { value };\n    holder.value\n}',
    exampleCode:
      'fn unwrap_holder<T>(value: T) -> T {\n    struct Holder<T> {\n        value: T,\n    }\n    let holder = Holder { value };\n    holder.value\n}\n\nfn main() {\n    println!("{:?}", unwrap_holder("hi"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(unwrap_holder(3), 3);\n    assert_eq!(unwrap_holder("hi"), "hi");\n}',
  },
  {
    slug: 'trait-bounds',
    title: 'Constrain operations with bounds',
    rule: 'A trait bound states the operations a generic type must support.',
    decision:
      'Require Ord before using an ordering comparison in a generic function.',
    signature: 'fn larger<T: Ord>(a: T, b: T) -> T',
    body: 'if a >= b { a } else { b }',
    assertions:
      'assert_eq!(larger(3, 9), 9); assert_eq!(larger("z", "a"), "z"); assert_eq!(larger(4, 4), 4);',
    call: 'larger(3, 9)',
    output: '9',
    topic: 'generics',
    solution:
      'fn larger<T: Ord>(a: T, b: T) -> T {\n    if a >= b {\n        a\n    } else {\n        b\n    }\n}',
    exampleCode:
      'fn larger<T: Ord>(a: T, b: T) -> T {\n    if a >= b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{:?}", larger(3, 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(larger(3, 9), 9);\n    assert_eq!(larger("z", "a"), "z");\n    assert_eq!(larger(4, 4), 4);\n}',
  },
  {
    slug: 'where',
    title: 'Readable where clauses',
    rule: 'A where clause places generic constraints after the parameter and return declarations.',
    decision:
      'Require Clone when returning an independent copy of a borrowed generic value.',
    signature: 'fn owned_copy<T>(value: &T) -> T where T: Clone',
    body: 'value.clone()',
    assertions:
      'assert_eq!(owned_copy(&String::from("hi")), "hi"); assert_eq!(owned_copy(&8), 8);',
    call: 'owned_copy(&String::from("hi"))',
    output: '"hi"',
    topic: 'generics',
    solution:
      'fn owned_copy<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}',
    exampleCode:
      'fn owned_copy<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}\n\nfn main() {\n    println!("{:?}", owned_copy(&String::from("hi")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(owned_copy(&String::from("hi")), "hi");\n    assert_eq!(owned_copy(&8), 8);\n}',
  },
  {
    slug: 'trait-impl',
    title: 'Implement a trait',
    rule: 'An impl of a trait supplies the required behavior for a concrete type.',
    decision:
      'Keep the implementation method signature compatible with the trait definition.',
    signature: 'fn measured(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } Count(n).size()',
    assertions: 'assert_eq!(measured(5), 5); assert_eq!(measured(0), 0);',
    call: 'measured(5)',
    output: '5',
    topic: 'traits',
    solution:
      'fn measured(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).size()\n}',
    exampleCode:
      'fn measured(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).size()\n}\n\nfn main() {\n    println!("{:?}", measured(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(measured(5), 5);\n    assert_eq!(measured(0), 0);\n}',
  },
  {
    slug: 'default-method',
    title: 'Default trait methods',
    rule: 'A trait may provide a default method that uses its required methods.',
    decision:
      'Implement the required primitive and reuse the default derived behavior.',
    signature: 'fn doubled_measure(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; fn doubled(&self) -> u32 { self.size() * 2 } } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } Count(n).doubled()',
    assertions:
      'assert_eq!(doubled_measure(5), 10); assert_eq!(doubled_measure(0), 0);',
    call: 'doubled_measure(5)',
    output: '10',
    topic: 'traits',
    solution:
      'fn doubled_measure(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n        fn doubled(&self) -> u32 {\n            self.size() * 2\n        }\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).doubled()\n}',
    exampleCode:
      'fn doubled_measure(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n        fn doubled(&self) -> u32 {\n            self.size() * 2\n        }\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).doubled()\n}\n\nfn main() {\n    println!("{:?}", doubled_measure(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled_measure(5), 10);\n    assert_eq!(doubled_measure(0), 0);\n}',
  },
  {
    slug: 'associated-types',
    title: 'Associated trait types',
    rule: 'An associated type names an output type chosen by each trait implementation.',
    decision:
      'Specify the associated type in the impl and use Self::Item in the method.',
    signature: 'fn associated_value(n: i32) -> i32',
    body: 'trait Source { type Item; fn get(&self) -> Self::Item; } struct Number(i32); impl Source for Number { type Item = i32; fn get(&self) -> Self::Item { self.0 } } Number(n).get()',
    assertions:
      'assert_eq!(associated_value(-2), -2); assert_eq!(associated_value(0), 0);',
    call: 'associated_value(-2)',
    output: '-2',
    topic: 'traits',
    solution:
      'fn associated_value(n: i32) -> i32 {\n    trait Source {\n        type Item;\n        fn get(&self) -> Self::Item;\n    }\n    struct Number(i32);\n    impl Source for Number {\n        type Item = i32;\n        fn get(&self) -> Self::Item {\n            self.0\n        }\n    }\n    Number(n).get()\n}',
    exampleCode:
      'fn associated_value(n: i32) -> i32 {\n    trait Source {\n        type Item;\n        fn get(&self) -> Self::Item;\n    }\n    struct Number(i32);\n    impl Source for Number {\n        type Item = i32;\n        fn get(&self) -> Self::Item {\n            self.0\n        }\n    }\n    Number(n).get()\n}\n\nfn main() {\n    println!("{:?}", associated_value(-2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(associated_value(-2), -2);\n    assert_eq!(associated_value(0), 0);\n}',
  },
  {
    slug: 'trait-objects',
    title: 'Dynamic trait dispatch',
    rule: 'A dyn trait reference can call object-safe behavior implemented by different concrete types.',
    decision:
      'Call the shared method through &dyn Trait without naming the concrete implementor.',
    signature: 'fn dynamic_size(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } fn observe(value: &dyn Measure) -> u32 { value.size() } observe(&Count(n))',
    assertions:
      'assert_eq!(dynamic_size(8), 8); assert_eq!(dynamic_size(0), 0);',
    call: 'dynamic_size(8)',
    output: '8',
    topic: 'traits',
    solution:
      'fn dynamic_size(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    fn observe(value: &dyn Measure) -> u32 {\n        value.size()\n    }\n    observe(&Count(n))\n}',
    exampleCode:
      'fn dynamic_size(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    fn observe(value: &dyn Measure) -> u32 {\n        value.size()\n    }\n    observe(&Count(n))\n}\n\nfn main() {\n    println!("{:?}", dynamic_size(8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(dynamic_size(8), 8);\n    assert_eq!(dynamic_size(0), 0);\n}',
  },
  {
    slug: 'lifetime-elision',
    title: 'Elided input lifetime',
    rule: 'With one input reference lifetime, elision assigns that lifetime to an output reference.',
    decision:
      'Return a slice borrowed from the supplied string rather than local storage.',
    signature: 'fn trimmed(text: &str) -> &str',
    body: 'text.trim()',
    assertions:
      'assert_eq!(trimmed("  hi  "), "hi"); assert_eq!(trimmed("   "), "");',
    call: 'trimmed("  hi  ")',
    output: '"hi"',
    topic: 'lifetimes',
    solution: 'fn trimmed(text: &str) -> &str {\n    text.trim()\n}',
    exampleCode:
      'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    println!("{:?}", trimmed("  hi  "));\n}',
    testCode:
      'fn main() {\n    assert_eq!(trimmed("  hi  "), "hi");\n    assert_eq!(trimmed("   "), "");\n}',
  },
  {
    slug: 'lifetime-explicit',
    title: 'Explicit lifetime relations',
    rule: 'A shared lifetime parameter relates output validity to the referenced inputs.',
    decision:
      'Tie a returned choice between two borrows to a lifetime supported by both inputs.',
    signature: "fn longer<'a>(a: &'a str, b: &'a str) -> &'a str",
    body: 'if a.len() >= b.len() { a } else { b }',
    assertions:
      'assert_eq!(longer("a", "rust"), "rust"); assert_eq!(longer("ab", "cd"), "ab");',
    call: 'longer("a", "rust")',
    output: '"rust"',
    topic: 'lifetimes',
    solution:
      "fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}",
    exampleCode:
      'fn longer<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{:?}", longer("a", "rust"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(longer("a", "rust"), "rust");\n    assert_eq!(longer("ab", "cd"), "ab");\n}',
  },
  {
    slug: 'borrowed-struct',
    title: 'Structs holding borrows',
    rule: 'A struct containing a reference must track the reference lifetime.',
    decision:
      'Keep the referenced owner alive while its borrowed view is used.',
    signature: 'fn view_length(text: &str) -> usize',
    body: "struct View<'a> { text: &'a str } impl View<'_> { fn len(&self) -> usize { self.text.len() } } View { text }.len()",
    assertions:
      'assert_eq!(view_length("rust"), 4); assert_eq!(view_length(""), 0);',
    call: 'view_length("rust")',
    output: '4',
    topic: 'lifetimes',
    solution:
      "fn view_length(text: &str) -> usize {\n    struct View<'a> {\n        text: &'a str,\n    }\n    impl View<'_> {\n        fn len(&self) -> usize {\n            self.text.len()\n        }\n    }\n    View { text }.len()\n}",
    exampleCode:
      'fn view_length(text: &str) -> usize {\n    struct View<\'a> {\n        text: &\'a str,\n    }\n    impl View<\'_> {\n        fn len(&self) -> usize {\n            self.text.len()\n        }\n    }\n    View { text }.len()\n}\n\nfn main() {\n    println!("{:?}", view_length("rust"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(view_length("rust"), 4);\n    assert_eq!(view_length(""), 0);\n}',
  },
  {
    slug: 'static',
    title: 'Static references and bounds',
    rule: 'A string literal can provide a static reference because its bytes live for the program.',
    decision:
      'Return a literal when the contract promises a static string reference.',
    signature: "fn status_label(ok: bool) -> &'static str",
    body: 'if ok { "ready" } else { "waiting" }',
    assertions:
      'assert_eq!(status_label(true), "ready"); assert_eq!(status_label(false), "waiting");',
    call: 'status_label(true)',
    output: '"ready"',
    topic: 'lifetimes',
    solution:
      'fn status_label(ok: bool) -> &\'static str {\n    if ok {\n        "ready"\n    } else {\n        "waiting"\n    }\n}',
    exampleCode:
      'fn status_label(ok: bool) -> &\'static str {\n    if ok {\n        "ready"\n    } else {\n        "waiting"\n    }\n}\n\nfn main() {\n    println!("{:?}", status_label(true));\n}',
    testCode:
      'fn main() {\n    assert_eq!(status_label(true), "ready");\n    assert_eq!(status_label(false), "waiting");\n}',
  },
  {
    slug: 'closure-capture',
    title: 'Capture the environment',
    rule: 'A closure may borrow values from the scope where it is created.',
    decision: 'Use a captured immutable offset when transforming an input.',
    signature: 'fn offset_value(n: i32, offset: i32) -> i32',
    body: 'let shifted = |value| value + offset; shifted(n)',
    assertions:
      'assert_eq!(offset_value(3, 4), 7); assert_eq!(offset_value(-2, 0), -2);',
    call: 'offset_value(3, 4)',
    output: '7',
    topic: 'closures',
    solution:
      'fn offset_value(n: i32, offset: i32) -> i32 {\n    let shifted = |value| value + offset;\n    shifted(n)\n}',
    exampleCode:
      'fn offset_value(n: i32, offset: i32) -> i32 {\n    let shifted = |value| value + offset;\n    shifted(n)\n}\n\nfn main() {\n    println!("{:?}", offset_value(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(offset_value(3, 4), 7);\n    assert_eq!(offset_value(-2, 0), -2);\n}',
  },
  {
    slug: 'fn-bound',
    title: 'Read-only callable bounds',
    rule: 'The Fn trait supports calls through a shared borrow of the callable.',
    decision:
      'Accept Fn when the callable need not mutate its captured environment.',
    signature: 'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32',
    body: 'f(f(value))',
    assertions:
      'assert_eq!(twice(3, |n| n + 2), 7); assert_eq!(twice(2, |n| n * 3), 18);',
    call: 'twice(3, |n| n + 2)',
    output: '7',
    topic: 'closures',
    solution:
      'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32 {\n    f(f(value))\n}',
    exampleCode:
      'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32 {\n    f(f(value))\n}\n\nfn main() {\n    println!("{:?}", twice(3, |n| n + 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(twice(3, |n| n + 2), 7);\n    assert_eq!(twice(2, |n| n * 3), 18);\n}',
  },
  {
    slug: 'fn-mut',
    title: 'Mutable closure captures',
    rule: 'FnMut permits a callable to mutate state captured by mutable borrow.',
    decision:
      'Declare the closure binding mutable when repeatedly invoking its mutable capture.',
    signature: 'fn running_sum(values: &[i32]) -> i32',
    body: 'let mut total = 0; let mut add = |value| { total += value; }; for &value in values { add(value); } total',
    assertions:
      'assert_eq!(running_sum(&[2, -1, 4]), 5); assert_eq!(running_sum(&[]), 0);',
    call: 'running_sum(&[2, -1, 4])',
    output: '5',
    topic: 'closures',
    solution:
      'fn running_sum(values: &[i32]) -> i32 {\n    let mut total = 0;\n    let mut add = |value| {\n        total += value;\n    };\n    for &value in values {\n        add(value);\n    }\n    total\n}',
    exampleCode:
      'fn running_sum(values: &[i32]) -> i32 {\n    let mut total = 0;\n    let mut add = |value| {\n        total += value;\n    };\n    for &value in values {\n        add(value);\n    }\n    total\n}\n\nfn main() {\n    println!("{:?}", running_sum(&[2, -1, 4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(running_sum(&[2, -1, 4]), 5);\n    assert_eq!(running_sum(&[]), 0);\n}',
  },
  {
    slug: 'fn-once',
    title: 'Consuming closure captures',
    rule: 'FnOnce supports a call that can move captured ownership out of the closure.',
    decision: 'Call a closure that returns its captured String only once.',
    signature: 'fn consume_text(text: String) -> String',
    body: 'let take = move || text; take()',
    assertions:
      'assert_eq!(consume_text("owned".into()), "owned"); assert_eq!(consume_text(String::new()), "");',
    call: 'consume_text("owned".into())',
    output: '"owned"',
    topic: 'closures',
    solution:
      'fn consume_text(text: String) -> String {\n    let take = move || text;\n    take()\n}',
    exampleCode:
      'fn consume_text(text: String) -> String {\n    let take = move || text;\n    take()\n}\n\nfn main() {\n    println!("{:?}", consume_text("owned".into()));\n}',
    testCode:
      'fn main() {\n    assert_eq!(consume_text("owned".into()), "owned");\n    assert_eq!(consume_text(String::new()), "");\n}',
  },
  {
    slug: 'iterator-lazy',
    title: 'Lazy iterator adapters',
    rule: 'Iterator adapters describe work that runs when the iterator is consumed.',
    decision: 'Use a consuming method such as sum to evaluate the pipeline.',
    signature: 'fn squares_total(values: &[i32]) -> i32',
    body: 'values.iter().map(|n| n * n).sum()',
    assertions:
      'assert_eq!(squares_total(&[2, 3]), 13); assert_eq!(squares_total(&[]), 0);',
    call: 'squares_total(&[2, 3])',
    output: '13',
    topic: 'iterators',
    solution:
      'fn squares_total(values: &[i32]) -> i32 {\n    values.iter().map(|n| n * n).sum()\n}',
    exampleCode:
      'fn squares_total(values: &[i32]) -> i32 {\n    values.iter().map(|n| n * n).sum()\n}\n\nfn main() {\n    println!("{:?}", squares_total(&[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(squares_total(&[2, 3]), 13);\n    assert_eq!(squares_total(&[]), 0);\n}',
  },
  {
    slug: 'map-filter',
    title: 'Map and filter in order',
    rule: 'filter selects elements while map transforms each surviving element.',
    decision:
      'Filter before mapping when the predicate applies to the original value.',
    signature: 'fn positive_doubles(values: &[i32]) -> Vec<i32>',
    body: 'values.iter().copied().filter(|n| *n > 0).map(|n| n * 2).collect()',
    assertions:
      'assert_eq!(positive_doubles(&[-1, 0, 2, 3]), vec![4, 6]); assert!(positive_doubles(&[]).is_empty());',
    call: 'positive_doubles(&[-1, 0, 2, 3])',
    output: '[4, 6]',
    topic: 'iterators',
    solution:
      'fn positive_doubles(values: &[i32]) -> Vec<i32> {\n    values\n        .iter()\n        .copied()\n        .filter(|n| *n > 0)\n        .map(|n| n * 2)\n        .collect()\n}',
    exampleCode:
      'fn positive_doubles(values: &[i32]) -> Vec<i32> {\n    values\n        .iter()\n        .copied()\n        .filter(|n| *n > 0)\n        .map(|n| n * 2)\n        .collect()\n}\n\nfn main() {\n    println!("{:?}", positive_doubles(&[-1, 0, 2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(positive_doubles(&[-1, 0, 2, 3]), vec![4, 6]);\n    assert!(positive_doubles(&[]).is_empty());\n}',
  },
  {
    slug: 'fold',
    title: 'Fold an accumulator',
    rule: 'fold applies one update per element starting from an explicit initial accumulator.',
    decision:
      'Choose an initial value that also represents the empty sequence correctly.',
    signature: 'fn product(values: &[i32]) -> i32',
    body: 'values.iter().fold(1, |acc, n| acc * n)',
    assertions:
      'assert_eq!(product(&[2, 3, 4]), 24); assert_eq!(product(&[]), 1);',
    call: 'product(&[2, 3, 4])',
    output: '24',
    topic: 'iterators',
    solution:
      'fn product(values: &[i32]) -> i32 {\n    values.iter().fold(1, |acc, n| acc * n)\n}',
    exampleCode:
      'fn product(values: &[i32]) -> i32 {\n    values.iter().fold(1, |acc, n| acc * n)\n}\n\nfn main() {\n    println!("{:?}", product(&[2, 3, 4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(product(&[2, 3, 4]), 24);\n    assert_eq!(product(&[]), 1);\n}',
  },
  {
    slug: 'collect',
    title: 'Collect fallible iterators',
    rule: 'Collecting Result items into Result<Vec<T>,E> propagates an encountered error.',
    decision:
      'Declare the target collection type so Rust knows the desired aggregation.',
    signature:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError>',
    body: 'values.iter().map(|s| s.parse::<i32>()).collect()',
    assertions:
      'assert_eq!(parse_all(&["2", "3"]).unwrap(), vec![2, 3]); assert!(parse_all(&["2", "bad"]).is_err()); assert_eq!(parse_all(&[]).unwrap(), Vec::<i32>::new());',
    call: 'parse_all(&["2", "3"])',
    output: 'Ok([2, 3])',
    topic: 'iterators',
    solution:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError> {\n    values.iter().map(|s| s.parse::<i32>()).collect()\n}',
    exampleCode:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError> {\n    values.iter().map(|s| s.parse::<i32>()).collect()\n}\n\nfn main() {\n    println!("{:?}", parse_all(&["2", "3"]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_all(&["2", "3"]).unwrap(), vec![2, 3]);\n    assert!(parse_all(&["2", "bad"]).is_err());\n    assert_eq!(parse_all(&[]).unwrap(), Vec::<i32>::new());\n}',
  },
  {
    slug: 'module-privacy',
    title: 'Module visibility',
    rule: 'Items are private unless their visibility permits access from the caller.',
    decision: 'Expose a function with pub when its parent module must call it.',
    signature: 'fn module_answer() -> u32',
    body: 'mod worker { pub fn answer() -> u32 { 42 } } worker::answer()',
    assertions: 'assert_eq!(module_answer(), 42);',
    call: 'module_answer()',
    output: '42',
    topic: 'modules',
    solution:
      'fn module_answer() -> u32 {\n    mod worker {\n        pub fn answer() -> u32 {\n            42\n        }\n    }\n    worker::answer()\n}',
    exampleCode:
      'fn module_answer() -> u32 {\n    mod worker {\n        pub fn answer() -> u32 {\n            42\n        }\n    }\n    worker::answer()\n}\n\nfn main() {\n    println!("{}", module_answer());\n}',
    testCode: 'fn main() {\n    assert_eq!(module_answer(), 42);\n}',
  },
  {
    slug: 'use',
    title: 'Import paths with use',
    rule: 'use introduces a path under a local name without copying the underlying item.',
    decision:
      'Alias an imported item when a concise name helps avoid collisions.',
    signature: 'fn imported_length(values: &[i32]) -> usize',
    body: 'use std::collections::VecDeque as Queue; let q: Queue<_> = values.iter().copied().collect(); q.len()',
    assertions:
      'assert_eq!(imported_length(&[1, 2]), 2); assert_eq!(imported_length(&[]), 0);',
    call: 'imported_length(&[1, 2])',
    output: '2',
    topic: 'modules',
    solution:
      'fn imported_length(values: &[i32]) -> usize {\n    use std::collections::VecDeque as Queue;\n    let q: Queue<_> = values.iter().copied().collect();\n    q.len()\n}',
    exampleCode:
      'fn imported_length(values: &[i32]) -> usize {\n    use std::collections::VecDeque as Queue;\n    let q: Queue<_> = values.iter().copied().collect();\n    q.len()\n}\n\nfn main() {\n    println!("{:?}", imported_length(&[1, 2]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(imported_length(&[1, 2]), 2);\n    assert_eq!(imported_length(&[]), 0);\n}',
  },
  {
    slug: 'reexport',
    title: 'Re-export a public API',
    rule: 'pub use exposes an accessible item through a new public path.',
    decision:
      'Keep implementation details inside a private module and export the supported function.',
    signature: 'fn facade_value() -> i32',
    body: 'mod api { mod detail { pub fn value() -> i32 { 7 } } pub use self::detail::value; } api::value()',
    assertions: 'assert_eq!(facade_value(), 7);',
    call: 'facade_value()',
    output: '7',
    topic: 'modules',
    solution:
      'fn facade_value() -> i32 {\n    mod api {\n        mod detail {\n            pub fn value() -> i32 {\n                7\n            }\n        }\n        pub use self::detail::value;\n    }\n    api::value()\n}',
    exampleCode:
      'fn facade_value() -> i32 {\n    mod api {\n        mod detail {\n            pub fn value() -> i32 {\n                7\n            }\n        }\n        pub use self::detail::value;\n    }\n    api::value()\n}\n\nfn main() {\n    println!("{:?}", facade_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(facade_value(), 7);\n}',
  },
  {
    slug: 'module-paths',
    title: 'Relative module paths',
    rule: 'super refers to the parent module and self refers to the current module.',
    decision: 'Use super to read an accessible item in the parent module.',
    signature: 'fn parent_value() -> i32',
    body: 'mod outer { const BASE: i32 = 6; pub mod inner { pub fn value() -> i32 { super::BASE + 1 } } } outer::inner::value()',
    assertions: 'assert_eq!(parent_value(), 7);',
    call: 'parent_value()',
    output: '7',
    topic: 'modules',
    solution:
      'fn parent_value() -> i32 {\n    mod outer {\n        const BASE: i32 = 6;\n        pub mod inner {\n            pub fn value() -> i32 {\n                super::BASE + 1\n            }\n        }\n    }\n    outer::inner::value()\n}',
    exampleCode:
      'fn parent_value() -> i32 {\n    mod outer {\n        const BASE: i32 = 6;\n        pub mod inner {\n            pub fn value() -> i32 {\n                super::BASE + 1\n            }\n        }\n    }\n    outer::inner::value()\n}\n\nfn main() {\n    println!("{:?}", parent_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(parent_value(), 7);\n}',
  },
  {
    slug: 'package-name',
    title: 'Package names and crates',
    rule: 'The name field in Cargo.toml identifies the package, and Rust code refers to its library crate with each dash replaced by an underscore.',
    decision:
      'Read the name from the manifest line and replace dashes with underscores before writing the use path.',
    signature: 'fn import_line(manifest_line: &str) -> Option<String>',
    body: 'let quoted = manifest_line.strip_prefix("name = ")?; let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?; Some(format!("use {};", name.replace(\'-\', "_")))',
    assertions:
      'assert_eq!(import_line("name = \\"my-tool\\""), Some(String::from("use my_tool;"))); assert_eq!(import_line("name = \\"serde\\""), Some(String::from("use serde;"))); assert_eq!(import_line("version = \\"1.0.0\\""), None);',
    call: 'import_line("name = \\"my-tool\\"")',
    output: 'Some("use my_tool;")',
    topic: 'cargo',
    solution:
      'fn import_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(format!("use {};", name.replace(\'-\', "_")))\n}',
    exampleCode:
      'fn import_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(format!("use {};", name.replace(\'-\', "_")))\n}\n\nfn main() {\n    println!("{:?}", import_line("name = \\"my-tool\\""));\n}',
    testCode:
      'fn main() {\n    assert_eq!(import_line("name = \\"my-tool\\""), Some(String::from("use my_tool;")));\n    assert_eq!(import_line("name = \\"serde\\""), Some(String::from("use serde;")));\n    assert_eq!(import_line("version = \\"1.0.0\\""), None);\n}',
  },
  {
    slug: 'semver',
    title: 'Semantic version components',
    rule: 'A basic semantic version contains major, minor, and patch integer components.',
    decision:
      'Reject malformed component counts rather than silently truncating them.',
    signature: 'fn version_parts(text: &str) -> Option<(u32, u32, u32)>',
    body: "let mut parts = text.split('.'); let major = parts.next()?.parse().ok()?; let minor = parts.next()?.parse().ok()?; let patch = parts.next()?.parse().ok()?; if parts.next().is_some() { return None; } Some((major, minor, patch))",
    assertions:
      'assert_eq!(version_parts("1.2.3"), Some((1, 2, 3))); assert_eq!(version_parts("1.2"), None); assert_eq!(version_parts("a.2.3"), None); assert_eq!(version_parts("1.2.3.4"), None);',
    call: 'version_parts("1.2.3")',
    output: 'Some((1, 2, 3))',
    topic: 'cargo',
    solution:
      "fn version_parts(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split('.');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}",
    exampleCode:
      'fn version_parts(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split(\'.\');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}\n\nfn main() {\n    println!("{:?}", version_parts("1.2.3"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(version_parts("1.2.3"), Some((1, 2, 3)));\n    assert_eq!(version_parts("1.2"), None);\n    assert_eq!(version_parts("a.2.3"), None);\n    assert_eq!(version_parts("1.2.3.4"), None);\n}',
  },
  {
    slug: 'cfg',
    title: 'Conditional compilation',
    rule: 'cfg attributes decide whether an item is compiled rather than choosing a runtime branch.',
    decision:
      'Make mutually exclusive definitions available under complementary cfg predicates.',
    signature: 'fn build_value() -> u32',
    body: '#[cfg(all())] fn selected() -> u32 { 7 } #[cfg(any())] fn selected() -> u32 { 99 } selected()',
    assertions: 'assert_eq!(build_value(), 7);',
    call: 'build_value()',
    output: '7',
    topic: 'cargo',
    solution:
      'fn build_value() -> u32 {\n    #[cfg(all())]\n    fn selected() -> u32 {\n        7\n    }\n    #[cfg(any())]\n    fn selected() -> u32 {\n        99\n    }\n    selected()\n}',
    exampleCode:
      'fn build_value() -> u32 {\n    #[cfg(all())]\n    fn selected() -> u32 {\n        7\n    }\n    #[cfg(any())]\n    fn selected() -> u32 {\n        99\n    }\n    selected()\n}\n\nfn main() {\n    println!("{}", build_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(build_value(), 7);\n}',
  },
  {
    slug: 'test-contract',
    title: 'Testable library behavior',
    rule: 'A function that returns its result can be checked by a #[test] assertion, while text printed inside a function cannot be compared.',
    decision:
      'Return the formatted line and let main or a test decide what to do with it.',
    signature: 'fn summary(passed: u32, total: u32) -> String',
    body: 'format!("{}/{} passed", passed, total)',
    assertions:
      'assert_eq!(summary(3, 4), "3/4 passed"); assert_eq!(summary(0, 0), "0/0 passed");',
    call: 'summary(3, 4)',
    output: '3/4 passed',
    printNote:
      'A normal build leaves out the #[cfg(test)] module, so the program prints only the line that summary returns.',
    topic: 'cargo',
    solution:
      'fn summary(passed: u32, total: u32) -> String {\n    format!("{}/{} passed", passed, total)\n}',
    exampleCode:
      'fn summary(passed: u32, total: u32) -> String {\n    format!("{}/{} passed", passed, total)\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn counts_both_numbers() {\n        assert_eq!(summary(3, 4), "3/4 passed");\n    }\n}\n\nfn main() {\n    println!("{}", summary(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(summary(3, 4), "3/4 passed");\n    assert_eq!(summary(0, 0), "0/0 passed");\n}',
  },
  {
    slug: 'assertions',
    title: 'Assertion macros',
    rule: 'assert! panics when its condition is false, and assert_eq! panics when its two values differ, printing both with Debug.',
    decision:
      'State a precondition with assert! and a message before the code that depends on it.',
    signature: 'fn average(values: &[u32]) -> u32',
    body: 'assert!(!values.is_empty(), "average needs at least one value"); let mut total = 0; for &value in values { total += value; } total / values.len() as u32',
    assertions:
      'assert_eq!(average(&[2, 4, 9]), 5); assert_eq!(average(&[7]), 7); assert_eq!(average(&[1, 2]), 1);',
    call: 'average(&[2, 4, 9])',
    output: '5',
    topic: 'testing',
    solution:
      'fn average(values: &[u32]) -> u32 {\n    assert!(!values.is_empty(), "average needs at least one value");\n    let mut total = 0;\n    for &value in values {\n        total += value;\n    }\n    total / values.len() as u32\n}',
    exampleCode:
      'fn average(values: &[u32]) -> u32 {\n    assert!(!values.is_empty(), "average needs at least one value");\n    let mut total = 0;\n    for &value in values {\n        total += value;\n    }\n    total / values.len() as u32\n}\n\nfn main() {\n    println!("{}", average(&[2, 4, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(average(&[2, 4, 9]), 5);\n    assert_eq!(average(&[7]), 7);\n    assert_eq!(average(&[1, 2]), 1);\n}',
  },
  {
    slug: 'test-attribute',
    title: 'Test functions',
    rule: 'cargo test runs every #[test] function, and a test passes when it returns without panicking.',
    decision:
      'Put tests in a #[cfg(test)] module that brings the code under test into scope with use super::*.',
    signature: 'fn is_leap(year: u32) -> bool',
    body: '(year % 4 == 0 && year % 100 != 0) || year % 400 == 0',
    assertions:
      'assert!(is_leap(2024)); assert!(!is_leap(2023)); assert!(!is_leap(1900)); assert!(is_leap(2000));',
    call: 'is_leap(2024)',
    output: 'true',
    printNote:
      'A normal build compiles main and is_leap but leaves out the #[cfg(test)] module, so only main prints.',
    topic: 'testing',
    solution:
      'fn is_leap(year: u32) -> bool {\n    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0\n}',
    exampleCode:
      'fn is_leap(year: u32) -> bool {\n    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn century_years_need_400() {\n        assert!(!is_leap(1900));\n        assert!(is_leap(2000));\n    }\n}\n\nfn main() {\n    println!("{}", is_leap(2024));\n}',
    testCode:
      'fn main() {\n    assert!(is_leap(2024));\n    assert!(!is_leap(2023));\n    assert!(!is_leap(1900));\n    assert!(is_leap(2000));\n}',
  },
  {
    slug: 'boundary-tests',
    title: 'Boundary-oriented contracts',
    rule: 'Boundary tests exercise values at and just outside a contract limit.',
    decision:
      'Check equality with the capacity limit separately from an oversized request.',
    signature: 'fn fits(used: usize, extra: usize, capacity: usize) -> bool',
    body: 'used.checked_add(extra).is_some_and(|total| total <= capacity)',
    assertions:
      'assert!(fits(3, 2, 5)); assert!(!fits(3, 3, 5)); assert!(!fits(usize::MAX, 1, usize::MAX)); assert!(fits(0, 0, 0));',
    call: 'fits(3, 2, 5)',
    output: 'true',
    topic: 'testing',
    solution:
      'fn fits(used: usize, extra: usize, capacity: usize) -> bool {\n    used.checked_add(extra)\n        .is_some_and(|total| total <= capacity)\n}',
    exampleCode:
      'fn fits(used: usize, extra: usize, capacity: usize) -> bool {\n    used.checked_add(extra)\n        .is_some_and(|total| total <= capacity)\n}\n\nfn main() {\n    println!("{:?}", fits(3, 2, 5));\n}',
    testCode:
      'fn main() {\n    assert!(fits(3, 2, 5));\n    assert!(!fits(3, 3, 5));\n    assert!(!fits(usize::MAX, 1, usize::MAX));\n    assert!(fits(0, 0, 0));\n}',
  },
  {
    slug: 'table-tests',
    title: 'Table-driven examples',
    rule: 'A table-driven test checks several input-output cases with the same assertion logic.',
    decision:
      'Define behavior for zero and negative inputs rather than testing only positives.',
    signature: 'fn clamp_small(n: i32) -> i32',
    body: 'n.clamp(-2, 2)',
    assertions:
      'for (input, expected) in [(-9, -2), (-2, -2), (0, 0), (2, 2), (9, 2)] { assert_eq!(clamp_small(input), expected); }',
    call: 'clamp_small(9)',
    output: '2',
    topic: 'testing',
    solution: 'fn clamp_small(n: i32) -> i32 {\n    n.clamp(-2, 2)\n}',
    exampleCode:
      'fn clamp_small(n: i32) -> i32 {\n    n.clamp(-2, 2)\n}\n\nfn main() {\n    println!("{:?}", clamp_small(9));\n}',
    testCode:
      'fn main() {\n    for (input, expected) in [(-9, -2), (-2, -2), (0, 0), (2, 2), (9, 2)] {\n        assert_eq!(clamp_small(input), expected);\n    }\n}',
  },
  {
    slug: 'invariants',
    title: 'Test algebraic invariants',
    rule: 'An invariant states a relationship that should hold for a family of inputs.',
    decision:
      'Check round-trip behavior as well as concrete representative cases.',
    signature: 'fn reverse_copy(values: &[i32]) -> Vec<i32>',
    body: 'values.iter().rev().copied().collect()',
    assertions:
      'assert_eq!(reverse_copy(&[1, 2, 3]), vec![3, 2, 1]); for n in 0..20 { let input: Vec<_> = (0..n).collect(); assert_eq!(reverse_copy(&reverse_copy(&input)), input); }',
    call: 'reverse_copy(&[1, 2, 3])',
    output: '[3, 2, 1]',
    topic: 'testing',
    solution:
      'fn reverse_copy(values: &[i32]) -> Vec<i32> {\n    values.iter().rev().copied().collect()\n}',
    exampleCode:
      'fn reverse_copy(values: &[i32]) -> Vec<i32> {\n    values.iter().rev().copied().collect()\n}\n\nfn main() {\n    println!("{:?}", reverse_copy(&[1, 2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(reverse_copy(&[1, 2, 3]), vec![3, 2, 1]);\n    for n in 0..20 {\n        let input: Vec<_> = (0..n).collect();\n        assert_eq!(reverse_copy(&reverse_copy(&input)), input);\n    }\n}',
  },
  {
    slug: 'panic-contracts',
    title: 'Avoid unexpected panics',
    rule: 'A checked API can report invalid input instead of panicking.',
    decision:
      'Validate a divisor with checked_div when zero and overflow are possible.',
    signature: 'fn safe_quotient(a: i32, b: i32) -> Option<i32>',
    body: 'a.checked_div(b)',
    assertions:
      'assert_eq!(safe_quotient(8, 2), Some(4)); assert_eq!(safe_quotient(8, 0), None); assert_eq!(safe_quotient(i32::MIN, -1), None);',
    call: 'safe_quotient(8, 0)',
    output: 'None',
    topic: 'testing',
    solution:
      'fn safe_quotient(a: i32, b: i32) -> Option<i32> {\n    a.checked_div(b)\n}',
    exampleCode:
      'fn safe_quotient(a: i32, b: i32) -> Option<i32> {\n    a.checked_div(b)\n}\n\nfn main() {\n    println!("{:?}", safe_quotient(8, 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(safe_quotient(8, 2), Some(4));\n    assert_eq!(safe_quotient(8, 0), None);\n    assert_eq!(safe_quotient(i32::MIN, -1), None);\n}',
  },
  {
    slug: 'box',
    title: 'Box heap ownership',
    rule: 'Box owns a heap allocation with one owning pointer.',
    decision: 'Dereference a Box to access its stored value.',
    signature: 'fn boxed_increment(n: i32) -> i32',
    body: 'let mut owned = Box::new(n); *owned += 1; *owned',
    assertions:
      'assert_eq!(boxed_increment(4), 5); assert_eq!(boxed_increment(-1), 0);',
    call: 'boxed_increment(4)',
    output: '5',
    topic: 'smart-pointers',
    solution:
      'fn boxed_increment(n: i32) -> i32 {\n    let mut owned = Box::new(n);\n    *owned += 1;\n    *owned\n}',
    exampleCode:
      'fn boxed_increment(n: i32) -> i32 {\n    let mut owned = Box::new(n);\n    *owned += 1;\n    *owned\n}\n\nfn main() {\n    println!("{:?}", boxed_increment(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(boxed_increment(4), 5);\n    assert_eq!(boxed_increment(-1), 0);\n}',
  },
  {
    slug: 'rc',
    title: 'Reference-counted ownership',
    rule: 'Rc shares ownership within one thread using a reference count.',
    decision:
      'Clone the Rc pointer to add an owner without cloning its payload.',
    signature: 'fn rc_owners() -> usize',
    body: 'let first = std::rc::Rc::new(String::from("data")); let second = std::rc::Rc::clone(&first); let count = std::rc::Rc::strong_count(&second); count',
    assertions: 'assert_eq!(rc_owners(), 2);',
    call: 'rc_owners()',
    output: '2',
    topic: 'smart-pointers',
    solution:
      'fn rc_owners() -> usize {\n    let first = std::rc::Rc::new(String::from("data"));\n    let second = std::rc::Rc::clone(&first);\n    let count = std::rc::Rc::strong_count(&second);\n    count\n}',
    exampleCode:
      'fn rc_owners() -> usize {\n    let first = std::rc::Rc::new(String::from("data"));\n    let second = std::rc::Rc::clone(&first);\n    let count = std::rc::Rc::strong_count(&second);\n    count\n}\n\nfn main() {\n    println!("{:?}", rc_owners());\n}',
    testCode: 'fn main() {\n    assert_eq!(rc_owners(), 2);\n}',
  },
  {
    slug: 'arc',
    title: 'Atomic reference counts',
    rule: 'Arc uses an atomic ownership count suitable for sharing ownership across threads.',
    decision:
      'Remember that Arc alone does not grant mutable access to an ordinary shared payload.',
    signature: 'fn arc_owners() -> usize',
    body: 'let first = std::sync::Arc::new(7); let second = std::sync::Arc::clone(&first); std::sync::Arc::strong_count(&second)',
    assertions: 'assert_eq!(arc_owners(), 2);',
    call: 'arc_owners()',
    output: '2',
    topic: 'smart-pointers',
    solution:
      'fn arc_owners() -> usize {\n    let first = std::sync::Arc::new(7);\n    let second = std::sync::Arc::clone(&first);\n    std::sync::Arc::strong_count(&second)\n}',
    exampleCode:
      'fn arc_owners() -> usize {\n    let first = std::sync::Arc::new(7);\n    let second = std::sync::Arc::clone(&first);\n    std::sync::Arc::strong_count(&second)\n}\n\nfn main() {\n    println!("{:?}", arc_owners());\n}',
    testCode: 'fn main() {\n    assert_eq!(arc_owners(), 2);\n}',
  },
  {
    slug: 'weak',
    title: 'Weak references',
    rule: 'A Weak pointer does not keep its payload alive and upgrade can fail after strong owners disappear.',
    decision: 'Check upgrade before accessing a weakly referenced payload.',
    signature: 'fn weak_expires() -> bool',
    body: 'let strong = std::rc::Rc::new(7); let weak = std::rc::Rc::downgrade(&strong); assert!(weak.upgrade().is_some()); drop(strong); weak.upgrade().is_none()',
    assertions: 'assert!(weak_expires());',
    call: 'weak_expires()',
    output: 'true',
    topic: 'smart-pointers',
    solution:
      'fn weak_expires() -> bool {\n    let strong = std::rc::Rc::new(7);\n    let weak = std::rc::Rc::downgrade(&strong);\n    assert!(weak.upgrade().is_some());\n    drop(strong);\n    weak.upgrade().is_none()\n}',
    exampleCode:
      'fn weak_expires() -> bool {\n    let strong = std::rc::Rc::new(7);\n    let weak = std::rc::Rc::downgrade(&strong);\n    assert!(weak.upgrade().is_some());\n    drop(strong);\n    weak.upgrade().is_none()\n}\n\nfn main() {\n    println!("{:?}", weak_expires());\n}',
    testCode: 'fn main() {\n    assert!(weak_expires());\n}',
  },
  {
    slug: 'cell',
    title: 'Cell replacement',
    rule: 'Cell permits interior mutation by moving or copying values rather than exposing borrowed references.',
    decision:
      'Use get and set for a Copy payload behind a shared Cell reference.',
    signature: 'fn cell_add(n: i32) -> i32',
    body: 'let value = std::cell::Cell::new(n); let shared = &value; shared.set(shared.get() + 1); shared.get()',
    assertions: 'assert_eq!(cell_add(3), 4); assert_eq!(cell_add(-1), 0);',
    call: 'cell_add(3)',
    output: '4',
    topic: 'interior-mutability',
    solution:
      'fn cell_add(n: i32) -> i32 {\n    let value = std::cell::Cell::new(n);\n    let shared = &value;\n    shared.set(shared.get() + 1);\n    shared.get()\n}',
    exampleCode:
      'fn cell_add(n: i32) -> i32 {\n    let value = std::cell::Cell::new(n);\n    let shared = &value;\n    shared.set(shared.get() + 1);\n    shared.get()\n}\n\nfn main() {\n    println!("{:?}", cell_add(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(cell_add(3), 4);\n    assert_eq!(cell_add(-1), 0);\n}',
  },
  {
    slug: 'refcell',
    title: 'Runtime checked borrowing',
    rule: 'RefCell checks shared and exclusive borrow rules at runtime.',
    decision:
      'Drop the mutable borrow guard before requesting another overlapping borrow.',
    signature: 'fn refcell_append() -> Vec<i32>',
    body: 'let cell = std::cell::RefCell::new(vec![1]); { cell.borrow_mut().push(2); } let result = cell.borrow().clone(); result',
    assertions: 'assert_eq!(refcell_append(), vec![1, 2]);',
    call: 'refcell_append()',
    output: '[1, 2]',
    topic: 'interior-mutability',
    solution:
      'fn refcell_append() -> Vec<i32> {\n    let cell = std::cell::RefCell::new(vec![1]);\n    {\n        cell.borrow_mut().push(2);\n    }\n    let result = cell.borrow().clone();\n    result\n}',
    exampleCode:
      'fn refcell_append() -> Vec<i32> {\n    let cell = std::cell::RefCell::new(vec![1]);\n    {\n        cell.borrow_mut().push(2);\n    }\n    let result = cell.borrow().clone();\n    result\n}\n\nfn main() {\n    println!("{:?}", refcell_append());\n}',
    testCode: 'fn main() {\n    assert_eq!(refcell_append(), vec![1, 2]);\n}',
  },
  {
    slug: 'try-borrow',
    title: 'Fallible borrow attempts',
    rule: 'try_borrow returns an error when an active exclusive borrow prevents shared access.',
    decision:
      'Use a fallible borrow when a conflict belongs in normal control flow.',
    signature: 'fn borrow_conflict() -> bool',
    body: 'let cell = std::cell::RefCell::new(1); let guard = cell.borrow_mut(); let blocked = cell.try_borrow().is_err(); drop(guard); blocked && cell.try_borrow().is_ok()',
    assertions: 'assert!(borrow_conflict());',
    call: 'borrow_conflict()',
    output: 'true',
    topic: 'interior-mutability',
    solution:
      'fn borrow_conflict() -> bool {\n    let cell = std::cell::RefCell::new(1);\n    let guard = cell.borrow_mut();\n    let blocked = cell.try_borrow().is_err();\n    drop(guard);\n    blocked && cell.try_borrow().is_ok()\n}',
    exampleCode:
      'fn borrow_conflict() -> bool {\n    let cell = std::cell::RefCell::new(1);\n    let guard = cell.borrow_mut();\n    let blocked = cell.try_borrow().is_err();\n    drop(guard);\n    blocked && cell.try_borrow().is_ok()\n}\n\nfn main() {\n    println!("{:?}", borrow_conflict());\n}',
    testCode: 'fn main() {\n    assert!(borrow_conflict());\n}',
  },
  {
    slug: 'cow',
    title: 'Clone only on mutation',
    rule: 'Cow can hold either borrowed data or owned data and to_mut creates ownership when needed.',
    decision: 'Retain a borrowed value when no content change is needed.',
    signature: "fn with_period(text: &str) -> std::borrow::Cow<'_, str>",
    body: "let mut result = std::borrow::Cow::Borrowed(text); if !text.ends_with('.') { result.to_mut().push('.'); } result",
    assertions:
      'assert!(matches!(with_period("done."), std::borrow::Cow::Borrowed(_))); assert!(matches!(with_period("done"), std::borrow::Cow::Owned(_))); assert_eq!(with_period("done"), "done."); assert_eq!(with_period(""), ".");',
    call: 'with_period("done")',
    output: '"done."',
    topic: 'interior-mutability',
    solution:
      "fn with_period(text: &str) -> std::borrow::Cow<'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(text);\n    if !text.ends_with('.') {\n        result.to_mut().push('.');\n    }\n    result\n}",
    exampleCode:
      "fn with_period(text: &str) -> std::borrow::Cow<'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(text);\n    if !text.ends_with('.') {\n        result.to_mut().push('.');\n    }\n    result\n}\n\nfn main() {\n    println!(\"{:?}\", with_period(\"done\"));\n}",
    testCode:
      'fn main() {\n    assert!(matches!(with_period("done."), std::borrow::Cow::Borrowed(_)));\n    assert!(matches!(with_period("done"), std::borrow::Cow::Owned(_)));\n    assert_eq!(with_period("done"), "done.");\n    assert_eq!(with_period(""), ".");\n}',
  },
  {
    slug: 'thread-move',
    title: 'Move ownership into a thread',
    rule: 'A move closure can transfer owned input into a spawned thread.',
    decision: 'Join the thread to obtain its result and wait for completion.',
    signature: 'fn thread_length(text: String) -> usize',
    body: 'std::thread::spawn(move || text.len()).join().unwrap()',
    assertions:
      'assert_eq!(thread_length("rust".into()), 4); assert_eq!(thread_length(String::new()), 0);',
    call: 'thread_length("rust".into())',
    output: '4',
    topic: 'concurrency',
    solution:
      'fn thread_length(text: String) -> usize {\n    std::thread::spawn(move || text.len()).join().unwrap()\n}',
    exampleCode:
      'fn thread_length(text: String) -> usize {\n    std::thread::spawn(move || text.len()).join().unwrap()\n}\n\nfn main() {\n    println!("{:?}", thread_length("rust".into()));\n}',
    testCode:
      'fn main() {\n    assert_eq!(thread_length("rust".into()), 4);\n    assert_eq!(thread_length(String::new()), 0);\n}',
  },
  {
    slug: 'scoped-threads',
    title: 'Scoped thread borrows',
    rule: 'Scoped threads may borrow local data because the scope waits for them to finish.',
    decision:
      'Join a scoped handle before combining its borrowed-input result.',
    signature: 'fn scoped_sum(values: &[i32]) -> i32',
    body: 'std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())',
    assertions:
      'assert_eq!(scoped_sum(&[2, 3]), 5); assert_eq!(scoped_sum(&[]), 0);',
    call: 'scoped_sum(&[2, 3])',
    output: '5',
    topic: 'concurrency',
    solution:
      'fn scoped_sum(values: &[i32]) -> i32 {\n    std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())\n}',
    exampleCode:
      'fn scoped_sum(values: &[i32]) -> i32 {\n    std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())\n}\n\nfn main() {\n    println!("{:?}", scoped_sum(&[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(scoped_sum(&[2, 3]), 5);\n    assert_eq!(scoped_sum(&[]), 0);\n}',
  },
  {
    slug: 'mutex',
    title: 'Mutex-protected state',
    rule: 'A mutex grants exclusive access through a lock guard.',
    decision:
      'Release the guard before waiting for another thread that needs the same lock.',
    signature: 'fn worker_increment(n: i32) -> i32',
    body: 'let shared = std::sync::Arc::new(std::sync::Mutex::new(n)); let other = std::sync::Arc::clone(&shared); std::thread::spawn(move || { *other.lock().unwrap() += 1; }).join().unwrap(); let result = *shared.lock().unwrap(); result',
    assertions:
      'assert_eq!(worker_increment(3), 4); assert_eq!(worker_increment(-1), 0);',
    call: 'worker_increment(3)',
    output: '4',
    topic: 'concurrency',
    solution:
      'fn worker_increment(n: i32) -> i32 {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(n));\n    let other = std::sync::Arc::clone(&shared);\n    std::thread::spawn(move || {\n        *other.lock().unwrap() += 1;\n    })\n    .join()\n    .unwrap();\n    let result = *shared.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn worker_increment(n: i32) -> i32 {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(n));\n    let other = std::sync::Arc::clone(&shared);\n    std::thread::spawn(move || {\n        *other.lock().unwrap() += 1;\n    })\n    .join()\n    .unwrap();\n    let result = *shared.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", worker_increment(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(worker_increment(3), 4);\n    assert_eq!(worker_increment(-1), 0);\n}',
  },
  {
    slug: 'channels',
    title: 'Transfer messages through channels',
    rule: 'An mpsc channel transfers owned messages from senders to one receiver.',
    decision:
      'Receive the sent message and join the producer without relying on thread timing.',
    signature: 'fn channel_value(n: i32) -> i32',
    body: 'let (sender, receiver) = std::sync::mpsc::channel(); let handle = std::thread::spawn(move || sender.send(n).unwrap()); let value = receiver.recv().unwrap(); handle.join().unwrap(); value',
    assertions:
      'assert_eq!(channel_value(7), 7); assert_eq!(channel_value(-2), -2);',
    call: 'channel_value(7)',
    output: '7',
    topic: 'concurrency',
    solution:
      'fn channel_value(n: i32) -> i32 {\n    let (sender, receiver) = std::sync::mpsc::channel();\n    let handle = std::thread::spawn(move || sender.send(n).unwrap());\n    let value = receiver.recv().unwrap();\n    handle.join().unwrap();\n    value\n}',
    exampleCode:
      'fn channel_value(n: i32) -> i32 {\n    let (sender, receiver) = std::sync::mpsc::channel();\n    let handle = std::thread::spawn(move || sender.send(n).unwrap());\n    let value = receiver.recv().unwrap();\n    handle.join().unwrap();\n    value\n}\n\nfn main() {\n    println!("{:?}", channel_value(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(channel_value(7), 7);\n    assert_eq!(channel_value(-2), -2);\n}',
  },
  {
    slug: 'atomic-load-store',
    title: 'Atomic loads and stores',
    rule: 'Atomic integer loads and stores access one value without a data race.',
    decision:
      'Use Relaxed only when this counter does not publish access to other memory.',
    signature: 'fn atomic_replaced(n: u32) -> u32',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(0); value.store(n, Ordering::Relaxed); value.load(Ordering::Relaxed)',
    assertions:
      'assert_eq!(atomic_replaced(7), 7); assert_eq!(atomic_replaced(0), 0);',
    call: 'atomic_replaced(7)',
    output: '7',
    topic: 'atomics',
    solution:
      'fn atomic_replaced(n: u32) -> u32 {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(0);\n    value.store(n, Ordering::Relaxed);\n    value.load(Ordering::Relaxed)\n}',
    exampleCode:
      'fn atomic_replaced(n: u32) -> u32 {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(0);\n    value.store(n, Ordering::Relaxed);\n    value.load(Ordering::Relaxed)\n}\n\nfn main() {\n    println!("{:?}", atomic_replaced(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(atomic_replaced(7), 7);\n    assert_eq!(atomic_replaced(0), 0);\n}',
  },
  {
    slug: 'atomic-fetch',
    title: 'Atomic read-modify-write',
    rule: 'fetch_add performs one atomic update and returns the previous value.',
    decision: 'Distinguish the returned old value from the stored new value.',
    signature: 'fn atomic_increment(n: u32) -> (u32, u32)',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(n); let previous = value.fetch_add(1, Ordering::Relaxed); (previous, value.load(Ordering::Relaxed))',
    assertions:
      'assert_eq!(atomic_increment(4), (4, 5)); assert_eq!(atomic_increment(0), (0, 1));',
    call: 'atomic_increment(4)',
    output: '(4, 5)',
    topic: 'atomics',
    solution:
      'fn atomic_increment(n: u32) -> (u32, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(n);\n    let previous = value.fetch_add(1, Ordering::Relaxed);\n    (previous, value.load(Ordering::Relaxed))\n}',
    exampleCode:
      'fn atomic_increment(n: u32) -> (u32, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(n);\n    let previous = value.fetch_add(1, Ordering::Relaxed);\n    (previous, value.load(Ordering::Relaxed))\n}\n\nfn main() {\n    println!("{:?}", atomic_increment(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(atomic_increment(4), (4, 5));\n    assert_eq!(atomic_increment(0), (0, 1));\n}',
  },
  {
    slug: 'compare-exchange',
    title: 'Compare and exchange',
    rule: 'compare_exchange updates the atomic only if its current value equals the expected value.',
    decision: 'Handle the failure result without assuming the update happened.',
    signature:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32)',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(current); let changed = value.compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst).is_ok(); (changed, value.load(Ordering::SeqCst))',
    assertions:
      'assert_eq!(conditional_swap(3, 3, 8), (true, 8)); assert_eq!(conditional_swap(4, 3, 8), (false, 4));',
    call: 'conditional_swap(3, 3, 8)',
    output: '(true, 8)',
    topic: 'atomics',
    solution:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(current);\n    let changed = value\n        .compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst)\n        .is_ok();\n    (changed, value.load(Ordering::SeqCst))\n}',
    exampleCode:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(current);\n    let changed = value\n        .compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst)\n        .is_ok();\n    (changed, value.load(Ordering::SeqCst))\n}\n\nfn main() {\n    println!("{:?}", conditional_swap(3, 3, 8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(conditional_swap(3, 3, 8), (true, 8));\n    assert_eq!(conditional_swap(4, 3, 8), (false, 4));\n}',
  },
  {
    slug: 'acquire-release',
    title: 'Acquire and release publication',
    rule: 'A release store and an acquire load that observes it establish a synchronization relationship.',
    decision:
      'Use a release store to publish readiness and an acquire load to observe it.',
    signature: 'fn readiness_round_trip() -> bool',
    body: 'use std::sync::atomic::{AtomicBool, Ordering}; let ready = AtomicBool::new(false); ready.store(true, Ordering::Release); ready.load(Ordering::Acquire)',
    assertions: 'assert!(readiness_round_trip());',
    call: 'readiness_round_trip()',
    output: 'true',
    topic: 'atomics',
    solution:
      'fn readiness_round_trip() -> bool {\n    use std::sync::atomic::{AtomicBool, Ordering};\n    let ready = AtomicBool::new(false);\n    ready.store(true, Ordering::Release);\n    ready.load(Ordering::Acquire)\n}',
    exampleCode:
      'fn readiness_round_trip() -> bool {\n    use std::sync::atomic::{AtomicBool, Ordering};\n    let ready = AtomicBool::new(false);\n    ready.store(true, Ordering::Release);\n    ready.load(Ordering::Acquire)\n}\n\nfn main() {\n    println!("{:?}", readiness_round_trip());\n}',
    testCode: 'fn main() {\n    assert!(readiness_round_trip());\n}',
  },
  {
    slug: 'send',
    title: 'Transfer across thread boundaries',
    rule: 'Send means ownership of a value may be transferred safely between threads.',
    decision:
      'Require Send on generic owned input that is moved into a spawned thread.',
    signature: "fn send_identity<T: Send + 'static>(value: T) -> T",
    body: 'std::thread::spawn(move || value).join().unwrap()',
    assertions:
      'assert_eq!(send_identity(7), 7); assert_eq!(send_identity(String::from("ok")), "ok");',
    call: 'send_identity(7)',
    output: '7',
    topic: 'send-sync',
    solution:
      "fn send_identity<T: Send + 'static>(value: T) -> T {\n    std::thread::spawn(move || value).join().unwrap()\n}",
    exampleCode:
      'fn send_identity<T: Send + \'static>(value: T) -> T {\n    std::thread::spawn(move || value).join().unwrap()\n}\n\nfn main() {\n    println!("{:?}", send_identity(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(send_identity(7), 7);\n    assert_eq!(send_identity(String::from("ok")), "ok");\n}',
  },
  {
    slug: 'sync',
    title: 'Share references across threads',
    rule: 'Sync means shared references to a type can be sent safely between threads.',
    decision:
      'Require Sync for the borrowed target and Send for an owned worker result.',
    signature: 'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T',
    body: 'std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())',
    assertions:
      'assert_eq!(synced_copy(&9), 9); assert_eq!(synced_copy(&true), true);',
    call: 'synced_copy(&9)',
    output: '9',
    topic: 'send-sync',
    solution:
      'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T {\n    std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())\n}',
    exampleCode:
      'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T {\n    std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())\n}\n\nfn main() {\n    println!("{:?}", synced_copy(&9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(synced_copy(&9), 9);\n    assert_eq!(synced_copy(&true), true);\n}',
  },
  {
    slug: 'arc-mutex',
    title: 'Combine ownership and synchronization',
    rule: 'Arc shares ownership while Mutex controls exclusive access to the shared payload.',
    decision: 'Clone Arc for workers and lock only while updating the counter.',
    signature: 'fn parallel_count(workers: usize) -> usize',
    body: 'let count = std::sync::Arc::new(std::sync::Mutex::new(0)); let mut handles = Vec::new(); for _ in 0..workers { let count = std::sync::Arc::clone(&count); handles.push(std::thread::spawn(move || { *count.lock().unwrap() += 1; })); } for handle in handles { handle.join().unwrap(); } let result = *count.lock().unwrap(); result',
    assertions:
      'assert_eq!(parallel_count(4), 4); assert_eq!(parallel_count(0), 0);',
    call: 'parallel_count(4)',
    output: '4',
    topic: 'send-sync',
    solution:
      'fn parallel_count(workers: usize) -> usize {\n    let count = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for _ in 0..workers {\n        let count = std::sync::Arc::clone(&count);\n        handles.push(std::thread::spawn(move || {\n            *count.lock().unwrap() += 1;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    let result = *count.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn parallel_count(workers: usize) -> usize {\n    let count = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for _ in 0..workers {\n        let count = std::sync::Arc::clone(&count);\n        handles.push(std::thread::spawn(move || {\n            *count.lock().unwrap() += 1;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    let result = *count.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", parallel_count(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parallel_count(4), 4);\n    assert_eq!(parallel_count(0), 0);\n}',
  },
  {
    slug: 'deadlock-scope',
    title: 'Keep lock scopes short',
    rule: 'A lock guard releases the mutex when the guard is dropped.',
    decision:
      'End a guard scope before taking the same non-reentrant mutex again.',
    signature: 'fn two_updates(n: i32) -> i32',
    body: 'let value = std::sync::Mutex::new(n); { *value.lock().unwrap() += 1; } { *value.lock().unwrap() += 2; } let result = *value.lock().unwrap(); result',
    assertions:
      'assert_eq!(two_updates(4), 7); assert_eq!(two_updates(-3), 0);',
    call: 'two_updates(4)',
    output: '7',
    topic: 'send-sync',
    solution:
      'fn two_updates(n: i32) -> i32 {\n    let value = std::sync::Mutex::new(n);\n    {\n        *value.lock().unwrap() += 1;\n    }\n    {\n        *value.lock().unwrap() += 2;\n    }\n    let result = *value.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn two_updates(n: i32) -> i32 {\n    let value = std::sync::Mutex::new(n);\n    {\n        *value.lock().unwrap() += 1;\n    }\n    {\n        *value.lock().unwrap() += 2;\n    }\n    let result = *value.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", two_updates(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(two_updates(4), 7);\n    assert_eq!(two_updates(-3), 0);\n}',
  },
  {
    slug: 'future-ready',
    title: 'Poll a ready future',
    rule: 'A Future exposes progress through Poll::Pending or Poll::Ready(output).',
    decision:
      'Poll with a Context and inspect Ready without expecting construction to run the future.',
    signature: 'fn ready_value(n: i32) -> Option<i32>',
    body: 'use std::future::Future; let mut future = std::future::ready(n); let mut context = std::task::Context::from_waker(std::task::Waker::noop()); match std::pin::Pin::new(&mut future).poll(&mut context) { std::task::Poll::Ready(value) => Some(value), std::task::Poll::Pending => None, }',
    assertions:
      'assert_eq!(ready_value(7), Some(7)); assert_eq!(ready_value(-2), Some(-2));',
    call: 'ready_value(7)',
    output: 'Some(7)',
    topic: 'async',
    solution:
      'fn ready_value(n: i32) -> Option<i32> {\n    use std::future::Future;\n    let mut future = std::future::ready(n);\n    let mut context = std::task::Context::from_waker(std::task::Waker::noop());\n    match std::pin::Pin::new(&mut future).poll(&mut context) {\n        std::task::Poll::Ready(value) => Some(value),\n        std::task::Poll::Pending => None,\n    }\n}',
    exampleCode:
      'fn ready_value(n: i32) -> Option<i32> {\n    use std::future::Future;\n    let mut future = std::future::ready(n);\n    let mut context = std::task::Context::from_waker(std::task::Waker::noop());\n    match std::pin::Pin::new(&mut future).poll(&mut context) {\n        std::task::Poll::Ready(value) => Some(value),\n        std::task::Poll::Pending => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", ready_value(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(ready_value(7), Some(7));\n    assert_eq!(ready_value(-2), Some(-2));\n}',
  },
  {
    slug: 'future-pending',
    title: 'Pending and wakeups',
    rule: 'A future returning Pending must arrange for a wakeup when progress may become possible.',
    decision:
      'Record a state transition and wake the task before returning Pending in this finite demonstration.',
    signature: 'fn two_poll_result(n: i32) -> i32',
    body: "use std::future::Future; struct Later { value: i32, waiting: bool } impl Future for Later { type Output = i32; fn poll(mut self: std::pin::Pin<&mut Self>, cx: &mut std::task::Context<'_>) -> std::task::Poll<i32> { if self.waiting { self.waiting = false; cx.waker().wake_by_ref(); std::task::Poll::Pending } else { std::task::Poll::Ready(self.value) } } } let mut future = std::pin::pin!(Later { value: n, waiting: true }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); assert!(future.as_mut().poll(&mut cx).is_pending()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }",
    assertions:
      'assert_eq!(two_poll_result(8), 8); assert_eq!(two_poll_result(0), 0);',
    call: 'two_poll_result(8)',
    output: '8',
    topic: 'async',
    solution:
      "fn two_poll_result(n: i32) -> i32 {\n    use std::future::Future;\n    struct Later {\n        value: i32,\n        waiting: bool,\n    }\n    impl Future for Later {\n        type Output = i32;\n        fn poll(\n            mut self: std::pin::Pin<&mut Self>,\n            cx: &mut std::task::Context<'_>,\n        ) -> std::task::Poll<i32> {\n            if self.waiting {\n                self.waiting = false;\n                cx.waker().wake_by_ref();\n                std::task::Poll::Pending\n            } else {\n                std::task::Poll::Ready(self.value)\n            }\n        }\n    }\n    let mut future = std::pin::pin!(Later {\n        value: n,\n        waiting: true\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    assert!(future.as_mut().poll(&mut cx).is_pending());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}",
    exampleCode:
      'fn two_poll_result(n: i32) -> i32 {\n    use std::future::Future;\n    struct Later {\n        value: i32,\n        waiting: bool,\n    }\n    impl Future for Later {\n        type Output = i32;\n        fn poll(\n            mut self: std::pin::Pin<&mut Self>,\n            cx: &mut std::task::Context<\'_>,\n        ) -> std::task::Poll<i32> {\n            if self.waiting {\n                self.waiting = false;\n                cx.waker().wake_by_ref();\n                std::task::Poll::Pending\n            } else {\n                std::task::Poll::Ready(self.value)\n            }\n        }\n    }\n    let mut future = std::pin::pin!(Later {\n        value: n,\n        waiting: true\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    assert!(future.as_mut().poll(&mut cx).is_pending());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", two_poll_result(8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(two_poll_result(8), 8);\n    assert_eq!(two_poll_result(0), 0);\n}',
  },
  {
    slug: 'future-pin',
    title: 'Pin a future before polling',
    rule: 'Pin constrains moving a pinned non-Unpin value through the pinned pointer.',
    decision:
      'Use Box::pin to place an async future behind an owning pinned pointer.',
    signature: 'fn pinned_double(n: i32) -> i32',
    body: 'use std::future::Future; let mut future = Box::pin(async move { n * 2 }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }',
    assertions:
      'assert_eq!(pinned_double(3), 6); assert_eq!(pinned_double(-2), -4);',
    call: 'pinned_double(3)',
    output: '6',
    topic: 'async',
    solution:
      'fn pinned_double(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move { n * 2 });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}',
    exampleCode:
      'fn pinned_double(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move { n * 2 });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", pinned_double(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(pinned_double(3), 6);\n    assert_eq!(pinned_double(-2), -4);\n}',
  },
  {
    slug: 'await',
    title: 'Compose with await',
    rule: 'await waits for a future result while allowing the surrounding task to suspend.',
    decision:
      'Await the ready inner future inside an async block before using its output.',
    signature: 'fn await_sum(a: i32, b: i32) -> i32',
    body: 'use std::future::Future; let mut future = Box::pin(async move { let left = std::future::ready(a).await; left + b }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }',
    assertions:
      'assert_eq!(await_sum(3, 4), 7); assert_eq!(await_sum(-2, 2), 0);',
    call: 'await_sum(3, 4)',
    output: '7',
    topic: 'async',
    solution:
      'fn await_sum(a: i32, b: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move {\n        let left = std::future::ready(a).await;\n        left + b\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}',
    exampleCode:
      'fn await_sum(a: i32, b: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move {\n        let left = std::future::ready(a).await;\n        left + b\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", await_sum(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(await_sum(3, 4), 7);\n    assert_eq!(await_sum(-2, 2), 0);\n}',
  },
  {
    slug: 'raw-pointers',
    title: 'Create and compare raw pointers',
    rule: 'Creating a raw pointer from a valid reference is safe; dereferencing a raw pointer requires additional guarantees.',
    decision:
      'Compare pointer locations separately from comparing pointed-to values.',
    signature: 'fn same_location(a: &i32, b: &i32) -> bool',
    body: 'std::ptr::eq(a, b)',
    assertions:
      'let a = 3; let b = 3; assert!(same_location(&a, &a)); assert!(!same_location(&a, &b));',
    call: '{ let a = 3; same_location(&a, &a) }',
    output: 'true',
    topic: 'unsafe',
    solution:
      'fn same_location(a: &i32, b: &i32) -> bool {\n    std::ptr::eq(a, b)\n}',
    exampleCode:
      'fn same_location(a: &i32, b: &i32) -> bool {\n    std::ptr::eq(a, b)\n}\n\nfn main() {\n    println!("{:?}", {\n        let a = 3;\n        same_location(&a, &a)\n    });\n}',
    testCode:
      'fn main() {\n    let a = 3;\n    let b = 3;\n    assert!(same_location(&a, &a));\n    assert!(!same_location(&a, &b));\n}',
  },
  {
    slug: 'raw-dereference',
    title: 'Prove a raw dereference',
    rule: 'A raw dereference needs valid alignment, initialized memory, a live allocation, and compatible aliasing.',
    decision:
      'Derive the pointer from a nonempty borrowed slice that remains alive during the read.',
    signature: 'fn raw_first(values: &[i32]) -> Option<i32>',
    body: 'if values.is_empty() { return None; } let pointer = values.as_ptr(); Some(unsafe { *pointer })',
    assertions:
      'assert_eq!(raw_first(&[7, 8]), Some(7)); assert_eq!(raw_first(&[]), None);',
    call: 'raw_first(&[7, 8])',
    output: 'Some(7)',
    topic: 'unsafe',
    solution:
      'fn raw_first(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        return None;\n    }\n    let pointer = values.as_ptr();\n    Some(unsafe { *pointer })\n}',
    exampleCode:
      'fn raw_first(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        return None;\n    }\n    let pointer = values.as_ptr();\n    Some(unsafe { *pointer })\n}\n\nfn main() {\n    println!("{:?}", raw_first(&[7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(raw_first(&[7, 8]), Some(7));\n    assert_eq!(raw_first(&[]), None);\n}',
  },
  {
    slug: 'raw-slices',
    title: 'Build a slice from raw parts',
    rule: 'from_raw_parts requires a valid single-allocation region with a correct length and lifetime.',
    decision:
      'Keep the new slice length within the original borrowed allocation.',
    signature: 'fn raw_prefix_total(values: &[i32], count: usize) -> i32',
    body: 'let count = count.min(values.len()); let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) }; view.iter().sum()',
    assertions:
      'assert_eq!(raw_prefix_total(&[2, 3, 7], 2), 5); assert_eq!(raw_prefix_total(&[2], 9), 2); assert_eq!(raw_prefix_total(&[], 3), 0);',
    call: 'raw_prefix_total(&[2, 3, 7], 2)',
    output: '5',
    topic: 'unsafe',
    solution:
      'fn raw_prefix_total(values: &[i32], count: usize) -> i32 {\n    let count = count.min(values.len());\n    let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) };\n    view.iter().sum()\n}',
    exampleCode:
      'fn raw_prefix_total(values: &[i32], count: usize) -> i32 {\n    let count = count.min(values.len());\n    let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) };\n    view.iter().sum()\n}\n\nfn main() {\n    println!("{:?}", raw_prefix_total(&[2, 3, 7], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(raw_prefix_total(&[2, 3, 7], 2), 5);\n    assert_eq!(raw_prefix_total(&[2], 9), 2);\n    assert_eq!(raw_prefix_total(&[], 3), 0);\n}',
  },
  {
    slug: 'unsafe-wrapper',
    title: 'Encapsulate disjoint mutable regions',
    rule: 'A safe wrapper can use unsafe internally when it proves disjoint valid mutable slices.',
    decision:
      'Check the split point before constructing two nonoverlapping mutable views.',
    signature: 'fn increment_halves(values: &mut [i32], mid: usize)',
    body: 'let mid = mid.min(values.len()); let len = values.len(); let pointer = values.as_mut_ptr(); let (left, right) = unsafe { (std::slice::from_raw_parts_mut(pointer, mid), std::slice::from_raw_parts_mut(pointer.add(mid), len - mid)) }; for n in left { *n += 1; } for n in right { *n += 2; }',
    assertions:
      'let mut v = [1, 1, 1]; increment_halves(&mut v, 1); assert_eq!(v, [2, 3, 3]); let mut empty = []; increment_halves(&mut empty, 9); let mut v = [1]; increment_halves(&mut v, 9); assert_eq!(v, [2]);',
    call: '{ let mut v = [1, 1, 1]; increment_halves(&mut v, 1); v }',
    output: '[2, 3, 3]',
    topic: 'unsafe',
    solution:
      'fn increment_halves(values: &mut [i32], mid: usize) {\n    let mid = mid.min(values.len());\n    let len = values.len();\n    let pointer = values.as_mut_ptr();\n    let (left, right) = unsafe {\n        (\n            std::slice::from_raw_parts_mut(pointer, mid),\n            std::slice::from_raw_parts_mut(pointer.add(mid), len - mid),\n        )\n    };\n    for n in left {\n        *n += 1;\n    }\n    for n in right {\n        *n += 2;\n    }\n}',
    exampleCode:
      'fn increment_halves(values: &mut [i32], mid: usize) {\n    let mid = mid.min(values.len());\n    let len = values.len();\n    let pointer = values.as_mut_ptr();\n    let (left, right) = unsafe {\n        (\n            std::slice::from_raw_parts_mut(pointer, mid),\n            std::slice::from_raw_parts_mut(pointer.add(mid), len - mid),\n        )\n    };\n    for n in left {\n        *n += 1;\n    }\n    for n in right {\n        *n += 2;\n    }\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut v = [1, 1, 1];\n        increment_halves(&mut v, 1);\n        v\n    });\n}',
    testCode:
      'fn main() {\n    let mut v = [1, 1, 1];\n    increment_halves(&mut v, 1);\n    assert_eq!(v, [2, 3, 3]);\n    let mut empty = [];\n    increment_halves(&mut empty, 9);\n    let mut v = [1];\n    increment_halves(&mut v, 9);\n    assert_eq!(v, [2]);\n}',
  },
  {
    slug: 'repr-c',
    title: 'C-compatible field layout',
    rule: 'repr(C) gives a struct a C-compatible field layout for an appropriate target ABI.',
    decision:
      'Use fixed-width fields and verify the layout expected by the receiving interface.',
    signature: 'fn point_size() -> usize',
    body: '#[repr(C)] struct Point { x: i32, y: i32 } std::mem::size_of::<Point>()',
    assertions: 'assert_eq!(point_size(), 8);',
    call: 'point_size()',
    output: '8',
    topic: 'interop',
    solution:
      'fn point_size() -> usize {\n    #[repr(C)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    std::mem::size_of::<Point>()\n}',
    exampleCode:
      'fn point_size() -> usize {\n    #[repr(C)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    std::mem::size_of::<Point>()\n}\n\nfn main() {\n    println!("{:?}", point_size());\n}',
    testCode: 'fn main() {\n    assert_eq!(point_size(), 8);\n}',
  },
  {
    slug: 'extern-abi',
    title: 'Extern function ABI',
    rule: 'extern "C" selects the C calling convention for a function boundary.',
    decision:
      'Use ABI-compatible scalar types in this local boundary demonstration.',
    signature: 'fn c_boundary_add(a: i32, b: i32) -> i32',
    body: 'extern "C" fn add(a: i32, b: i32) -> i32 { a + b } add(a, b)',
    assertions:
      'assert_eq!(c_boundary_add(3, 4), 7); assert_eq!(c_boundary_add(-2, 2), 0);',
    call: 'c_boundary_add(3, 4)',
    output: '7',
    topic: 'interop',
    solution:
      'fn c_boundary_add(a: i32, b: i32) -> i32 {\n    extern "C" fn add(a: i32, b: i32) -> i32 {\n        a + b\n    }\n    add(a, b)\n}',
    exampleCode:
      'fn c_boundary_add(a: i32, b: i32) -> i32 {\n    extern "C" fn add(a: i32, b: i32) -> i32 {\n        a + b\n    }\n    add(a, b)\n}\n\nfn main() {\n    println!("{}", c_boundary_add(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(c_boundary_add(3, 4), 7);\n    assert_eq!(c_boundary_add(-2, 2), 0);\n}',
  },
  {
    slug: 'c-strings',
    title: 'Nul-terminated strings',
    rule: 'A C string ends in a nul byte and cannot contain an interior nul in its content.',
    decision: 'Validate the byte slice before constructing a borrowed CStr.',
    signature: 'fn c_string_length(bytes: &[u8]) -> Option<usize>',
    body: 'std::ffi::CStr::from_bytes_with_nul(bytes).ok().map(|s| s.to_bytes().len())',
    assertions:
      'assert_eq!(c_string_length(b"hi\u0000"), Some(2)); assert_eq!(c_string_length(b"hi"), None); assert_eq!(c_string_length(b"h\u0000i\u0000"), None);',
    call: 'c_string_length(b"hi\u0000")',
    output: 'Some(2)',
    topic: 'interop',
    solution:
      'fn c_string_length(bytes: &[u8]) -> Option<usize> {\n    std::ffi::CStr::from_bytes_with_nul(bytes)\n        .ok()\n        .map(|s| s.to_bytes().len())\n}',
    exampleCode:
      'fn c_string_length(bytes: &[u8]) -> Option<usize> {\n    std::ffi::CStr::from_bytes_with_nul(bytes)\n        .ok()\n        .map(|s| s.to_bytes().len())\n}\n\nfn main() {\n    println!("{:?}", c_string_length(b"hi\u0000"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(c_string_length(b"hi\u0000"), Some(2));\n    assert_eq!(c_string_length(b"hi"), None);\n    assert_eq!(c_string_length(b"h\u0000i\u0000"), None);\n}',
  },
  {
    slug: 'byte-order',
    title: 'Explicit byte order',
    rule: 'A binary protocol must specify byte order instead of inheriting the host memory representation.',
    decision:
      'Decode a fixed array with from_be_bytes when the protocol uses big-endian bytes.',
    signature: 'fn big_endian_u32(bytes: &[u8]) -> Option<u32>',
    body: 'let array: [u8; 4] = bytes.try_into().ok()?; Some(u32::from_be_bytes(array))',
    assertions:
      'assert_eq!(big_endian_u32(&[0, 0, 1, 0]), Some(256)); assert_eq!(big_endian_u32(&[1, 2]), None);',
    call: 'big_endian_u32(&[0, 0, 1, 0])',
    output: 'Some(256)',
    topic: 'interop',
    solution:
      'fn big_endian_u32(bytes: &[u8]) -> Option<u32> {\n    let array: [u8; 4] = bytes.try_into().ok()?;\n    Some(u32::from_be_bytes(array))\n}',
    exampleCode:
      'fn big_endian_u32(bytes: &[u8]) -> Option<u32> {\n    let array: [u8; 4] = bytes.try_into().ok()?;\n    Some(u32::from_be_bytes(array))\n}\n\nfn main() {\n    println!("{:?}", big_endian_u32(&[0, 0, 1, 0]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(big_endian_u32(&[0, 0, 1, 0]), Some(256));\n    assert_eq!(big_endian_u32(&[1, 2]), None);\n}',
  },
  {
    slug: 'capacity',
    title: 'Length versus capacity',
    rule: 'Vec length counts initialized elements while capacity counts space reserved for elements.',
    decision:
      'Reserve capacity before repeated pushes without treating spare capacity as initialized values.',
    signature: 'fn reserved_fill(n: usize) -> (usize, bool)',
    body: 'let mut values = Vec::with_capacity(n); for value in 0..n { values.push(value); } (values.len(), values.capacity() >= n)',
    assertions:
      'assert_eq!(reserved_fill(5), (5, true)); assert_eq!(reserved_fill(0), (0, true));',
    call: 'reserved_fill(5)',
    output: '(5, true)',
    topic: 'performance',
    solution:
      'fn reserved_fill(n: usize) -> (usize, bool) {\n    let mut values = Vec::with_capacity(n);\n    for value in 0..n {\n        values.push(value);\n    }\n    (values.len(), values.capacity() >= n)\n}',
    exampleCode:
      'fn reserved_fill(n: usize) -> (usize, bool) {\n    let mut values = Vec::with_capacity(n);\n    for value in 0..n {\n        values.push(value);\n    }\n    (values.len(), values.capacity() >= n)\n}\n\nfn main() {\n    println!("{:?}", reserved_fill(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(reserved_fill(5), (5, true));\n    assert_eq!(reserved_fill(0), (0, true));\n}',
  },
  {
    slug: 'layout',
    title: 'Size and alignment',
    rule: 'size_of measures the storage size of a type while align_of describes its alignment requirement.',
    decision: 'Account for struct padding when comparing storage costs.',
    signature: 'fn padded_layout() -> (usize, usize)',
    body: '#[repr(C)] struct Record { tag: u8, value: u32 } (std::mem::size_of::<Record>(), std::mem::align_of::<Record>())',
    assertions: 'assert_eq!(padded_layout(), (8, 4));',
    call: 'padded_layout()',
    output: '(8, 4)',
    topic: 'performance',
    solution:
      'fn padded_layout() -> (usize, usize) {\n    #[repr(C)]\n    struct Record {\n        tag: u8,\n        value: u32,\n    }\n    (\n        std::mem::size_of::<Record>(),\n        std::mem::align_of::<Record>(),\n    )\n}',
    exampleCode:
      'fn padded_layout() -> (usize, usize) {\n    #[repr(C)]\n    struct Record {\n        tag: u8,\n        value: u32,\n    }\n    (\n        std::mem::size_of::<Record>(),\n        std::mem::align_of::<Record>(),\n    )\n}\n\nfn main() {\n    println!("{:?}", padded_layout());\n}',
    testCode: 'fn main() {\n    assert_eq!(padded_layout(), (8, 4));\n}',
  },
  {
    slug: 'checked-arithmetic',
    title: 'Checked size arithmetic',
    rule: 'checked_mul reports overflow rather than silently inventing a wrapped allocation size.',
    decision:
      'Use checked arithmetic before accepting a size derived from untrusted counts.',
    signature: 'fn byte_budget(items: usize, width: usize) -> Option<usize>',
    body: 'items.checked_mul(width)',
    assertions:
      'assert_eq!(byte_budget(4, 8), Some(32)); assert_eq!(byte_budget(usize::MAX, 2), None); assert_eq!(byte_budget(99, 0), Some(0));',
    call: 'byte_budget(4, 8)',
    output: 'Some(32)',
    topic: 'performance',
    solution:
      'fn byte_budget(items: usize, width: usize) -> Option<usize> {\n    items.checked_mul(width)\n}',
    exampleCode:
      'fn byte_budget(items: usize, width: usize) -> Option<usize> {\n    items.checked_mul(width)\n}\n\nfn main() {\n    println!("{:?}", byte_budget(4, 8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(byte_budget(4, 8), Some(32));\n    assert_eq!(byte_budget(usize::MAX, 2), None);\n    assert_eq!(byte_budget(99, 0), Some(0));\n}',
  },
  {
    slug: 'sort-dedup',
    title: 'Sort then deduplicate',
    rule: 'Vec::dedup removes adjacent duplicates, so sorting first groups equal values.',
    decision:
      'Sort before dedup when duplicates may occur in separated positions.',
    signature: 'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32>',
    body: 'values.sort_unstable(); values.dedup(); values',
    assertions:
      'assert_eq!(sorted_unique(vec![3, 1, 3, 2, 1]), vec![1, 2, 3]); assert!(sorted_unique(vec![]).is_empty());',
    call: 'sorted_unique(vec![3, 1, 3, 2, 1])',
    output: '[1, 2, 3]',
    topic: 'performance',
    solution:
      'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32> {\n    values.sort_unstable();\n    values.dedup();\n    values\n}',
    exampleCode:
      'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32> {\n    values.sort_unstable();\n    values.dedup();\n    values\n}\n\nfn main() {\n    println!("{:?}", sorted_unique(vec![3, 1, 3, 2, 1]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sorted_unique(vec![3, 1, 3, 2, 1]), vec![1, 2, 3]);\n    assert!(sorted_unique(vec![]).is_empty());\n}',
  },
  {
    slug: 'binary-search',
    title: 'Lower-bound binary search',
    rule: 'A lower bound finds the first sorted position whose value is at least the target.',
    decision:
      'Maintain a half-open search interval and return its converged boundary.',
    signature: 'fn lower_bound(values: &[i32], target: i32) -> usize',
    body: 'let (mut low, mut high) = (0, values.len()); while low < high { let mid = low + (high - low) / 2; if values[mid] < target { low = mid + 1; } else { high = mid; } } low',
    assertions:
      'assert_eq!(lower_bound(&[1, 3, 3, 7], 3), 1); assert_eq!(lower_bound(&[1, 3], 9), 2); assert_eq!(lower_bound(&[], 4), 0);',
    call: 'lower_bound(&[1, 3, 3, 7], 3)',
    output: '1',
    topic: 'algorithms',
    solution:
      'fn lower_bound(values: &[i32], target: i32) -> usize {\n    let (mut low, mut high) = (0, values.len());\n    while low < high {\n        let mid = low + (high - low) / 2;\n        if values[mid] < target {\n            low = mid + 1;\n        } else {\n            high = mid;\n        }\n    }\n    low\n}',
    exampleCode:
      'fn lower_bound(values: &[i32], target: i32) -> usize {\n    let (mut low, mut high) = (0, values.len());\n    while low < high {\n        let mid = low + (high - low) / 2;\n        if values[mid] < target {\n            low = mid + 1;\n        } else {\n            high = mid;\n        }\n    }\n    low\n}\n\nfn main() {\n    println!("{:?}", lower_bound(&[1, 3, 3, 7], 3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(lower_bound(&[1, 3, 3, 7], 3), 1);\n    assert_eq!(lower_bound(&[1, 3], 9), 2);\n    assert_eq!(lower_bound(&[], 4), 0);\n}',
  },
  {
    slug: 'two-pointers',
    title: 'Two-pointer pair search',
    rule: 'On sorted input, a too-small pair sum can be increased by advancing its left pointer.',
    decision:
      'Use distinct indices and compare the sum in a wider integer type.',
    signature: 'fn has_pair(values: &[i32], target: i64) -> bool',
    body: 'if values.len() < 2 { return false; } let (mut left, mut right) = (0, values.len() - 1); while left < right { let sum = values[left] as i64 + values[right] as i64; if sum == target { return true; } if sum < target { left += 1; } else { right -= 1; } } false',
    assertions:
      'assert!(has_pair(&[1, 3, 5], 8)); assert!(!has_pair(&[4], 8)); assert!(!has_pair(&[], 0)); assert!(has_pair(&[i32::MAX, i32::MAX], 4294967294));',
    call: 'has_pair(&[1, 3, 5], 8)',
    output: 'true',
    topic: 'algorithms',
    solution:
      'fn has_pair(values: &[i32], target: i64) -> bool {\n    if values.len() < 2 {\n        return false;\n    }\n    let (mut left, mut right) = (0, values.len() - 1);\n    while left < right {\n        let sum = values[left] as i64 + values[right] as i64;\n        if sum == target {\n            return true;\n        }\n        if sum < target {\n            left += 1;\n        } else {\n            right -= 1;\n        }\n    }\n    false\n}',
    exampleCode:
      'fn has_pair(values: &[i32], target: i64) -> bool {\n    if values.len() < 2 {\n        return false;\n    }\n    let (mut left, mut right) = (0, values.len() - 1);\n    while left < right {\n        let sum = values[left] as i64 + values[right] as i64;\n        if sum == target {\n            return true;\n        }\n        if sum < target {\n            left += 1;\n        } else {\n            right -= 1;\n        }\n    }\n    false\n}\n\nfn main() {\n    println!("{:?}", has_pair(&[1, 3, 5], 8));\n}',
    testCode:
      'fn main() {\n    assert!(has_pair(&[1, 3, 5], 8));\n    assert!(!has_pair(&[4], 8));\n    assert!(!has_pair(&[], 0));\n    assert!(has_pair(&[i32::MAX, i32::MAX], 4294967294));\n}',
  },
  {
    slug: 'bfs',
    title: 'Queue-based graph traversal',
    rule: 'Breadth-first search discovers shortest hop counts in an unweighted graph.',
    decision:
      'Mark a vertex when enqueuing it so cycles do not produce repeated work.',
    signature:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>>',
    body: 'let mut dist = vec![None; graph.len()]; if start >= graph.len() { return dist; } let mut queue = std::collections::VecDeque::new(); dist[start] = Some(0); queue.push_back(start); while let Some(node) = queue.pop_front() { for &next in &graph[node] { if next < graph.len() && dist[next].is_none() { dist[next] = Some(dist[node].unwrap() + 1); queue.push_back(next); } } } dist',
    assertions:
      'assert_eq!(hop_distances(&[vec![1], vec![2], vec![], vec![]], 0), vec![Some(0), Some(1), Some(2), None]); assert!(hop_distances(&[], 0).is_empty());',
    call: 'hop_distances(&[vec![1], vec![2], vec![]], 0)',
    output: '[Some(0), Some(1), Some(2)]',
    topic: 'algorithms',
    solution:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>> {\n    let mut dist = vec![None; graph.len()];\n    if start >= graph.len() {\n        return dist;\n    }\n    let mut queue = std::collections::VecDeque::new();\n    dist[start] = Some(0);\n    queue.push_back(start);\n    while let Some(node) = queue.pop_front() {\n        for &next in &graph[node] {\n            if next < graph.len() && dist[next].is_none() {\n                dist[next] = Some(dist[node].unwrap() + 1);\n                queue.push_back(next);\n            }\n        }\n    }\n    dist\n}',
    exampleCode:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>> {\n    let mut dist = vec![None; graph.len()];\n    if start >= graph.len() {\n        return dist;\n    }\n    let mut queue = std::collections::VecDeque::new();\n    dist[start] = Some(0);\n    queue.push_back(start);\n    while let Some(node) = queue.pop_front() {\n        for &next in &graph[node] {\n            if next < graph.len() && dist[next].is_none() {\n                dist[next] = Some(dist[node].unwrap() + 1);\n                queue.push_back(next);\n            }\n        }\n    }\n    dist\n}\n\nfn main() {\n    println!("{:?}", hop_distances(&[vec![1], vec![2], vec![]], 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(\n        hop_distances(&[vec![1], vec![2], vec![], vec![]], 0),\n        vec![Some(0), Some(1), Some(2), None]\n    );\n    assert!(hop_distances(&[], 0).is_empty());\n}',
  },
  {
    slug: 'heap-selection',
    title: 'Heap-based top-k selection',
    rule: 'BinaryHeap exposes its greatest stored element at the top.',
    decision: 'Use Reverse to maintain a min-heap of the k largest values.',
    signature: 'fn top_k(values: &[i32], k: usize) -> Vec<i32>',
    body: 'let mut heap = std::collections::BinaryHeap::new(); for &n in values { heap.push(std::cmp::Reverse(n)); if heap.len() > k { heap.pop(); } } let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect(); result.sort_unstable_by(|a, b| b.cmp(a)); result',
    assertions:
      'assert_eq!(top_k(&[2, 8, 3, 7], 2), vec![8, 7]); assert!(top_k(&[2], 0).is_empty()); assert_eq!(top_k(&[2], 9), vec![2]);',
    call: 'top_k(&[2, 8, 3, 7], 2)',
    output: '[8, 7]',
    topic: 'algorithms',
    solution:
      'fn top_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut heap = std::collections::BinaryHeap::new();\n    for &n in values {\n        heap.push(std::cmp::Reverse(n));\n        if heap.len() > k {\n            heap.pop();\n        }\n    }\n    let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect();\n    result.sort_unstable_by(|a, b| b.cmp(a));\n    result\n}',
    exampleCode:
      'fn top_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut heap = std::collections::BinaryHeap::new();\n    for &n in values {\n        heap.push(std::cmp::Reverse(n));\n        if heap.len() > k {\n            heap.pop();\n        }\n    }\n    let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect();\n    result.sort_unstable_by(|a, b| b.cmp(a));\n    result\n}\n\nfn main() {\n    println!("{:?}", top_k(&[2, 8, 3, 7], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(top_k(&[2, 8, 3, 7], 2), vec![8, 7]);\n    assert!(top_k(&[2], 0).is_empty());\n    assert_eq!(top_k(&[2], 9), vec![2]);\n}',
  },
  {
    slug: 'frame-header',
    title: 'Validate a frame header',
    rule: 'A length-prefixed frame parser must validate its fixed header before reading the payload.',
    decision:
      'Decode only the two-byte big-endian length after confirming both bytes exist.',
    signature: 'fn declared_length(bytes: &[u8]) -> Option<usize>',
    body: 'let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?; Some(u16::from_be_bytes(header) as usize)',
    assertions:
      'assert_eq!(declared_length(&[0, 3, 9]), Some(3)); assert_eq!(declared_length(&[1]), None); assert_eq!(declared_length(&[1, 0]), Some(256));',
    call: 'declared_length(&[0, 3, 9])',
    output: 'Some(3)',
    topic: 'systems-project',
    solution:
      'fn declared_length(bytes: &[u8]) -> Option<usize> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    Some(u16::from_be_bytes(header) as usize)\n}',
    exampleCode:
      'fn declared_length(bytes: &[u8]) -> Option<usize> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    Some(u16::from_be_bytes(header) as usize)\n}\n\nfn main() {\n    println!("{:?}", declared_length(&[0, 3, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(declared_length(&[0, 3, 9]), Some(3));\n    assert_eq!(declared_length(&[1]), None);\n    assert_eq!(declared_length(&[1, 0]), Some(256));\n}',
  },
  {
    slug: 'frame-payload',
    title: 'Borrow a validated payload',
    rule: 'A parser can return a slice into the caller buffer after validating the declared payload boundaries.',
    decision: 'Use checked arithmetic and get to reject an incomplete frame.',
    signature: 'fn frame_payload(bytes: &[u8]) -> Option<&[u8]>',
    body: 'let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?; let length = u16::from_be_bytes(header) as usize; bytes.get(2..2usize.checked_add(length)?)',
    assertions:
      'assert_eq!(frame_payload(&[0, 2, 7, 8]), Some(&[7, 8][..])); assert_eq!(frame_payload(&[0, 3, 7]), None); assert_eq!(frame_payload(&[0, 0]), Some(&[][..]));',
    call: 'frame_payload(&[0, 2, 7, 8])',
    output: 'Some([7, 8])',
    topic: 'systems-project',
    solution:
      'fn frame_payload(bytes: &[u8]) -> Option<&[u8]> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    let length = u16::from_be_bytes(header) as usize;\n    bytes.get(2..2usize.checked_add(length)?)\n}',
    exampleCode:
      'fn frame_payload(bytes: &[u8]) -> Option<&[u8]> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    let length = u16::from_be_bytes(header) as usize;\n    bytes.get(2..2usize.checked_add(length)?)\n}\n\nfn main() {\n    println!("{:?}", frame_payload(&[0, 2, 7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(frame_payload(&[0, 2, 7, 8]), Some(&[7, 8][..]));\n    assert_eq!(frame_payload(&[0, 3, 7]), None);\n    assert_eq!(frame_payload(&[0, 0]), Some(&[][..]));\n}',
  },
  {
    slug: 'frame-encode',
    title: 'Encode a bounded frame',
    rule: 'An encoder must reject a payload length that cannot fit its declared header type.',
    decision:
      'Convert the length with try_from before appending header and payload bytes.',
    signature: 'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>>',
    body: 'let length = u16::try_from(payload.len()).ok()?; let mut output = Vec::with_capacity(2 + payload.len()); output.extend_from_slice(&length.to_be_bytes()); output.extend_from_slice(payload); Some(output)',
    assertions:
      'assert_eq!(encode_frame(&[7, 8]), Some(vec![0, 2, 7, 8])); assert_eq!(encode_frame(&[]), Some(vec![0, 0])); assert_eq!(encode_frame(&vec![0; 65536]), None);',
    call: 'encode_frame(&[7, 8])',
    output: 'Some([0, 2, 7, 8])',
    topic: 'systems-project',
    solution:
      'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>> {\n    let length = u16::try_from(payload.len()).ok()?;\n    let mut output = Vec::with_capacity(2 + payload.len());\n    output.extend_from_slice(&length.to_be_bytes());\n    output.extend_from_slice(payload);\n    Some(output)\n}',
    exampleCode:
      'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>> {\n    let length = u16::try_from(payload.len()).ok()?;\n    let mut output = Vec::with_capacity(2 + payload.len());\n    output.extend_from_slice(&length.to_be_bytes());\n    output.extend_from_slice(payload);\n    Some(output)\n}\n\nfn main() {\n    println!("{:?}", encode_frame(&[7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(encode_frame(&[7, 8]), Some(vec![0, 2, 7, 8]));\n    assert_eq!(encode_frame(&[]), Some(vec![0, 0]));\n    assert_eq!(encode_frame(&vec![0; 65536]), None);\n}',
  },
  {
    slug: 'frame-stream',
    title: 'Parse successive complete frames',
    rule: 'A stream decoder advances only after validating each complete length-prefixed frame.',
    decision:
      'Return an error for a trailing incomplete frame instead of silently dropping bytes.',
    signature: 'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>>',
    body: 'let mut offset = 0usize; let mut frames = Vec::new(); while offset < bytes.len() { let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?; let start = offset.checked_add(2)?; let end = start.checked_add(u16::from_be_bytes(header) as usize)?; frames.push(bytes.get(start..end)?.to_vec()); offset = end; } Some(frames)',
    assertions:
      'assert_eq!(decode_frames(&[0, 1, 7, 0, 2, 8, 9]), Some(vec![vec![7], vec![8, 9]])); assert_eq!(decode_frames(&[0]), None); assert_eq!(decode_frames(&[0, 2, 7]), None); assert_eq!(decode_frames(&[]), Some(vec![]));',
    call: 'decode_frames(&[0, 1, 7, 0, 2, 8, 9])',
    output: 'Some([[7], [8, 9]])',
    topic: 'systems-project',
    solution:
      'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>> {\n    let mut offset = 0usize;\n    let mut frames = Vec::new();\n    while offset < bytes.len() {\n        let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?;\n        let start = offset.checked_add(2)?;\n        let end = start.checked_add(u16::from_be_bytes(header) as usize)?;\n        frames.push(bytes.get(start..end)?.to_vec());\n        offset = end;\n    }\n    Some(frames)\n}',
    exampleCode:
      'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>> {\n    let mut offset = 0usize;\n    let mut frames = Vec::new();\n    while offset < bytes.len() {\n        let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?;\n        let start = offset.checked_add(2)?;\n        let end = start.checked_add(u16::from_be_bytes(header) as usize)?;\n        frames.push(bytes.get(start..end)?.to_vec());\n        offset = end;\n    }\n    Some(frames)\n}\n\nfn main() {\n    println!("{:?}", decode_frames(&[0, 1, 7, 0, 2, 8, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(\n        decode_frames(&[0, 1, 7, 0, 2, 8, 9]),\n        Some(vec![vec![7], vec![8, 9]])\n    );\n    assert_eq!(decode_frames(&[0]), None);\n    assert_eq!(decode_frames(&[0, 2, 7]), None);\n    assert_eq!(decode_frames(&[]), Some(vec![]));\n}',
  },
];
