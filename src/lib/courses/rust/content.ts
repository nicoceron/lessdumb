/** Original atomic Rust teaching material. External references are documented in docs/sources/rust.md. */
export interface RustDefinition {
  slug: string;
  title: string;
  rule: string;
  decision: string;
  badRule: string[];
  badDecision: string[];
  outputDistractors: string[];
  signature: string;
  solution: string;
  exampleCode: string;
  testCode: string;
  body: string;
  assertions: string;
  call: string;
  output: string;
  topic: string;
  stage: number;
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
    slug: 'vectors',
    title: 'Growable sequences',
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
    rule: 'A binary starts by calling its main function.',
    decision:
      'Keep helper functions outside main so they can be called independently.',
    badRule: [
      'Rust runs all function bodies in source order.',
      'Every Rust file starts executing at its first let binding.',
    ],
    badDecision: [
      'Name every helper main.',
      'Call a function by writing only its name without parentheses.',
    ],
    signature: "fn greeting() -> &'static str",
    body: '"hello, Rust"',
    assertions: 'assert_eq!(greeting(), "hello, Rust");',
    call: 'greeting()',
    output: '"hello, Rust"',
    topic: 'programs',
    stage: 1,
    solution: 'fn greeting() -> &\'static str {\n    "hello, Rust"\n}',
    exampleCode:
      'fn greeting() -> &\'static str {\n    "hello, Rust"\n}\n\nfn main() {\n    println!("{:?}", greeting());\n}',
    testCode: 'fn main() {\n    assert_eq!(greeting(), "hello, Rust");\n}',
    outputDistractors: ['hello, Rust', '""'],
  },
  {
    slug: 'format',
    title: 'Format values',
    rule: 'Formatting placeholders consume values in their written order.',
    decision:
      'Use format! to create a String rather than printing inside the helper.',
    badRule: [
      'Placeholders reverse their arguments.',
      'The format string becomes a numeric value.',
    ],
    badDecision: [
      'Use println! when a String return value is required.',
      'Put runtime values inside the quoted literal without placeholders.',
    ],
    signature: 'fn label(name: &str, count: u32) -> String',
    body: 'format!("{}: {}", name, count)',
    assertions:
      'assert_eq!(label("tasks", 3), "tasks: 3"); assert_eq!(label("done", 0), "done: 0");',
    call: 'label("tasks", 3)',
    output: '"tasks: 3"',
    topic: 'programs',
    stage: 2,
    solution:
      'fn label(name: &str, count: u32) -> String {\n    format!("{}: {}", name, count)\n}',
    exampleCode:
      'fn label(name: &str, count: u32) -> String {\n    format!("{}: {}", name, count)\n}\n\nfn main() {\n    println!("{:?}", label("tasks", 3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(label("tasks", 3), "tasks: 3");\n    assert_eq!(label("done", 0), "done: 0");\n}',
    outputDistractors: ['tasks: 3', '""'],
  },
  {
    slug: 'bindings',
    title: 'Mutable bindings',
    rule: 'A let mut binding permits assigning a new value to that binding.',
    decision: 'Update the accumulator after creating it with mut.',
    badRule: [
      'Every let binding is mutable.',
      'mut changes a value into a pointer.',
    ],
    badDecision: [
      'Declare an immutable accumulator and assign to it twice.',
      'Return the original value before applying the increment.',
    ],
    signature: 'fn bump(n: i32) -> i32',
    body: 'let mut value = n; value += 1; value',
    assertions: 'assert_eq!(bump(0), 1); assert_eq!(bump(-4), -3);',
    call: 'bump(4)',
    output: '5',
    topic: 'programs',
    stage: 3,
    solution:
      'fn bump(n: i32) -> i32 {\n    let mut value = n;\n    value += 1;\n    value\n}',
    exampleCode:
      'fn bump(n: i32) -> i32 {\n    let mut value = n;\n    value += 1;\n    value\n}\n\nfn main() {\n    println!("{:?}", bump(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(bump(0), 1);\n    assert_eq!(bump(-4), -3);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'scope',
    title: 'Block scope and shadowing',
    rule: 'A shadowing binding replaces a name only within its scope.',
    decision:
      'Return the inner block expression while the outer input remains available.',
    badRule: [
      'A block deletes bindings from its parent scope.',
      'Shadowing requires mut on the earlier binding.',
    ],
    badDecision: [
      'Expect a local shadow to change the caller variable.',
      'Add a semicolon after the intended block return expression.',
    ],
    signature: 'fn scoped(n: i32) -> i32',
    body: 'let inside = { let n = n * 2; n + 1 }; inside + n',
    assertions: 'assert_eq!(scoped(3), 10); assert_eq!(scoped(-2), -5);',
    call: 'scoped(3)',
    output: '10',
    topic: 'programs',
    stage: 4,
    solution:
      'fn scoped(n: i32) -> i32 {\n    let inside = {\n        let n = n * 2;\n        n + 1\n    };\n    inside + n\n}',
    exampleCode:
      'fn scoped(n: i32) -> i32 {\n    let inside = {\n        let n = n * 2;\n        n + 1\n    };\n    inside + n\n}\n\nfn main() {\n    println!("{:?}", scoped(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(scoped(3), 10);\n    assert_eq!(scoped(-2), -5);\n}',
    outputDistractors: ['11', '9'],
  },
  {
    slug: 'integers',
    title: 'Integer arithmetic',
    rule: 'Integer division discards the fractional part toward zero.',
    decision:
      'Use the remainder to find how many items are left after complete groups.',
    badRule: [
      'Integer division always produces an f64.',
      'Integer remainder is the quotient.',
    ],
    badDecision: [
      'Multiply the divisor by the dividend to obtain the remainder.',
      'Assume division by zero returns zero.',
    ],
    signature: 'fn groups(items: u32, size: u32) -> (u32, u32)',
    body: '(items / size, items % size)',
    assertions:
      'assert_eq!(groups(17, 5), (3, 2)); assert_eq!(groups(4, 7), (0, 4));',
    call: 'groups(17, 5)',
    output: '(3, 2)',
    topic: 'values',
    stage: 1,
    solution:
      'fn groups(items: u32, size: u32) -> (u32, u32) {\n    (items / size, items % size)\n}',
    exampleCode:
      'fn groups(items: u32, size: u32) -> (u32, u32) {\n    (items / size, items % size)\n}\n\nfn main() {\n    println!("{:?}", groups(17, 5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(groups(17, 5), (3, 2));\n    assert_eq!(groups(4, 7), (0, 4));\n}',
    outputDistractors: ['3, 2', '()'],
  },
  {
    slug: 'floats',
    title: 'Floating point values',
    rule: 'A floating point type can represent fractional results approximately.',
    decision:
      'Convert both integers before division to preserve a fractional ratio.',
    badRule: [
      'Casting after integer division restores lost fractions.',
      'f64 represents every rational number exactly.',
    ],
    badDecision: [
      'Compute a / b using integers and cast only the result.',
      'Compare arbitrary computed floats with exact equality in every test.',
    ],
    signature: 'fn ratio(a: u32, b: u32) -> f64',
    body: 'a as f64 / b as f64',
    assertions:
      'assert!((ratio(3, 2) - 1.5).abs() < 1e-9); assert!((ratio(1, 4) - 0.25).abs() < 1e-9);',
    call: 'ratio(3, 2)',
    output: '1.5',
    topic: 'values',
    stage: 2,
    solution: 'fn ratio(a: u32, b: u32) -> f64 {\n    a as f64 / b as f64\n}',
    exampleCode:
      'fn ratio(a: u32, b: u32) -> f64 {\n    a as f64 / b as f64\n}\n\nfn main() {\n    println!("{:?}", ratio(3, 2));\n}',
    testCode:
      'fn main() {\n    assert!((ratio(3, 2) - 1.5).abs() < 1e-9);\n    assert!((ratio(1, 4) - 0.25).abs() < 1e-9);\n}',
    outputDistractors: ['2.5', '0.75'],
  },
  {
    slug: 'booleans',
    title: 'Boolean expressions',
    rule: 'Boolean && requires both comparisons to be true.',
    decision:
      'Check both bounds when expressing membership in a closed interval.',
    badRule: [
      '&& means either operand may be true.',
      'A bool automatically becomes an integer in arithmetic.',
    ],
    badDecision: [
      'Use || to require both bounds.',
      'Check only the lower bound for a bounded interval.',
    ],
    signature: 'fn in_range(n: i32, low: i32, high: i32) -> bool',
    body: 'n >= low && n <= high',
    assertions:
      'assert!(in_range(3, 1, 3)); assert!(!in_range(0, 1, 3)); assert!(!in_range(4, 1, 3));',
    call: 'in_range(3, 1, 3)',
    output: 'true',
    topic: 'values',
    stage: 3,
    solution:
      'fn in_range(n: i32, low: i32, high: i32) -> bool {\n    n >= low && n <= high\n}',
    exampleCode:
      'fn in_range(n: i32, low: i32, high: i32) -> bool {\n    n >= low && n <= high\n}\n\nfn main() {\n    println!("{:?}", in_range(3, 1, 3));\n}',
    testCode:
      'fn main() {\n    assert!(in_range(3, 1, 3));\n    assert!(!in_range(0, 1, 3));\n    assert!(!in_range(4, 1, 3));\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'tuples-arrays',
    title: 'Tuples and fixed arrays',
    rule: 'A tuple may contain different types while an array has one element type.',
    decision: 'Read tuple fields by their fixed numeric field positions.',
    badRule: [
      'Tuples can only store identical element types.',
      'An array grows automatically when indexed beyond its length.',
    ],
    badDecision: [
      'Index a tuple using a runtime loop variable.',
      'Treat array length as unrelated to its type.',
    ],
    signature: 'fn endpoints(values: [i32; 3]) -> (i32, i32)',
    body: '(values[0], values[2])',
    assertions:
      'assert_eq!(endpoints([2, 4, 8]), (2, 8)); assert_eq!(endpoints([-1, 0, 1]), (-1, 1));',
    call: 'endpoints([2, 4, 8])',
    output: '(2, 8)',
    topic: 'values',
    stage: 4,
    solution:
      'fn endpoints(values: [i32; 3]) -> (i32, i32) {\n    (values[0], values[2])\n}',
    exampleCode:
      'fn endpoints(values: [i32; 3]) -> (i32, i32) {\n    (values[0], values[2])\n}\n\nfn main() {\n    println!("{:?}", endpoints([2, 4, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(endpoints([2, 4, 8]), (2, 8));\n    assert_eq!(endpoints([-1, 0, 1]), (-1, 1));\n}',
    outputDistractors: ['2, 8', '()'],
  },
  {
    slug: 'if',
    title: 'If as an expression',
    rule: 'The selected if branch can produce a value.',
    decision: 'Make both branches produce the same result type.',
    badRule: [
      'Only the true branch must have the declared return type.',
      'An if expression always returns bool.',
    ],
    badDecision: [
      'Return an integer in one branch and text in the other.',
      'Require a semicolon after each branch final value.',
    ],
    signature: 'fn absolute(n: i32) -> i32',
    body: 'if n < 0 { -n } else { n }',
    assertions:
      'assert_eq!(absolute(-7), 7); assert_eq!(absolute(4), 4); assert_eq!(absolute(0), 0);',
    call: 'absolute(-7)',
    output: '7',
    topic: 'control',
    stage: 1,
    solution:
      'fn absolute(n: i32) -> i32 {\n    if n < 0 {\n        -n\n    } else {\n        n\n    }\n}',
    exampleCode:
      'fn absolute(n: i32) -> i32 {\n    if n < 0 {\n        -n\n    } else {\n        n\n    }\n}\n\nfn main() {\n    println!("{:?}", absolute(-7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(absolute(-7), 7);\n    assert_eq!(absolute(4), 4);\n    assert_eq!(absolute(0), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'match',
    title: 'Exhaustive match',
    rule: 'A match must handle every possible input value or provide a fallback.',
    decision: 'Place the fallback after the specific patterns.',
    badRule: [
      'Rust silently skips unmatched values.',
      'Every match must have exactly two arms.',
    ],
    badDecision: [
      'Place _ first and expect later specific arms to be selected.',
      'Leave an i32 match without handling remaining integers.',
    ],
    signature: "fn sign(n: i32) -> &'static str",
    body: 'match n { 0 => "zero", n if n < 0 => "negative", _ => "positive" }',
    assertions:
      'assert_eq!(sign(0), "zero"); assert_eq!(sign(-3), "negative"); assert_eq!(sign(2), "positive");',
    call: 'sign(-3)',
    output: '"negative"',
    topic: 'control',
    stage: 2,
    solution:
      'fn sign(n: i32) -> &\'static str {\n    match n {\n        0 => "zero",\n        n if n < 0 => "negative",\n        _ => "positive",\n    }\n}',
    exampleCode:
      'fn sign(n: i32) -> &\'static str {\n    match n {\n        0 => "zero",\n        n if n < 0 => "negative",\n        _ => "positive",\n    }\n}\n\nfn main() {\n    println!("{:?}", sign(-3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sign(0), "zero");\n    assert_eq!(sign(-3), "negative");\n    assert_eq!(sign(2), "positive");\n}',
    outputDistractors: ['negative', '""'],
  },
  {
    slug: 'loop',
    title: 'Break with a value',
    rule: 'A loop expression can return a value supplied to break.',
    decision:
      'Advance the loop variable before repeating so the stop condition becomes reachable.',
    badRule: [
      'break can only return bool.',
      'loop automatically increments an integer binding.',
    ],
    badDecision: [
      'Repeat the same state forever after a failed condition.',
      'Use continue to exit the loop with a value.',
    ],
    signature: 'fn next_even(n: i32) -> i32',
    body: 'let mut x = n; loop { if x % 2 == 0 { break x; } x += 1; }',
    assertions:
      'assert_eq!(next_even(3), 4); assert_eq!(next_even(4), 4); assert_eq!(next_even(-3), -2);',
    call: 'next_even(3)',
    output: '4',
    topic: 'control',
    stage: 3,
    solution:
      'fn next_even(n: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x % 2 == 0 {\n            break x;\n        }\n        x += 1;\n    }\n}',
    exampleCode:
      'fn next_even(n: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x % 2 == 0 {\n            break x;\n        }\n        x += 1;\n    }\n}\n\nfn main() {\n    println!("{:?}", next_even(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(next_even(3), 4);\n    assert_eq!(next_even(4), 4);\n    assert_eq!(next_even(-3), -2);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'ranges',
    title: 'Half-open ranges',
    rule: 'A range a..b includes a and excludes b.',
    decision: 'Use ..= when an inclusive upper bound is required.',
    badRule: [
      'a..b includes both endpoints.',
      'A range always counts downward.',
    ],
    badDecision: [
      'Add one to each element instead of making the upper bound inclusive.',
      'Use n..0 to iterate upward from zero.',
    ],
    signature: 'fn sum_to(n: u32) -> u32',
    body: 'let mut total = 0; for x in 1..=n { total += x; } total',
    assertions:
      'assert_eq!(sum_to(4), 10); assert_eq!(sum_to(0), 0); assert_eq!(sum_to(1), 1);',
    call: 'sum_to(4)',
    output: '10',
    topic: 'control',
    stage: 4,
    solution:
      'fn sum_to(n: u32) -> u32 {\n    let mut total = 0;\n    for x in 1..=n {\n        total += x;\n    }\n    total\n}',
    exampleCode:
      'fn sum_to(n: u32) -> u32 {\n    let mut total = 0;\n    for x in 1..=n {\n        total += x;\n    }\n    total\n}\n\nfn main() {\n    println!("{:?}", sum_to(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sum_to(4), 10);\n    assert_eq!(sum_to(0), 0);\n    assert_eq!(sum_to(1), 1);\n}',
    outputDistractors: ['11', '9'],
  },
  {
    slug: 'parameters',
    title: 'Typed parameters',
    rule: 'Each function parameter declares the type accepted by the function.',
    decision: 'Keep the argument order consistent with the parameter order.',
    badRule: [
      'Rust function parameters never need types.',
      'Arguments are sorted alphabetically before a call.',
    ],
    badDecision: [
      'Pass text to a parameter declared i32.',
      'Reverse noncommutative arguments while preserving the same meaning.',
    ],
    signature: 'fn difference(a: i32, b: i32) -> i32',
    body: 'a - b',
    assertions:
      'assert_eq!(difference(8, 3), 5); assert_eq!(difference(3, 8), -5);',
    call: 'difference(8, 3)',
    output: '5',
    topic: 'functions',
    stage: 1,
    solution: 'fn difference(a: i32, b: i32) -> i32 {\n    a - b\n}',
    exampleCode:
      'fn difference(a: i32, b: i32) -> i32 {\n    a - b\n}\n\nfn main() {\n    println!("{:?}", difference(8, 3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(difference(8, 3), 5);\n    assert_eq!(difference(3, 8), -5);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'returns',
    title: 'Tail expression returns',
    rule: 'The last expression without a semicolon supplies a block return value.',
    decision: 'Omit the semicolon on the expression that should be returned.',
    badRule: [
      'Every final expression must end in a semicolon.',
      'The function return type is always inferred from callers.',
    ],
    badDecision: [
      'End a numeric tail expression with a semicolon in an i32 function.',
      'Use return without a value in an i32 function.',
    ],
    signature: 'fn square(n: i32) -> i32',
    body: 'n * n',
    assertions:
      'assert_eq!(square(-3), 9); assert_eq!(square(0), 0); assert_eq!(square(4), 16);',
    call: 'square(-3)',
    output: '9',
    topic: 'functions',
    stage: 2,
    solution: 'fn square(n: i32) -> i32 {\n    n * n\n}',
    exampleCode:
      'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn main() {\n    println!("{:?}", square(-3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(square(-3), 9);\n    assert_eq!(square(0), 0);\n    assert_eq!(square(4), 16);\n}',
    outputDistractors: ['10', '8'],
  },
  {
    slug: 'unit',
    title: 'Unit and local side effects',
    rule: 'A block ending in an assignment statement evaluates to the unit value (), while the assignment changes its local binding.',
    decision:
      'Capture the unit result of the assignment block and return it alongside the updated integer in a tuple.',
    badRule: [
      'Unit is identical to the integer zero.',
      'An assignment expression returns the assigned integer instead of unit.',
    ],
    badDecision: [
      'Treat the unit result as the updated integer.',
      'Return the original integer after the local assignment changed it.',
    ],
    signature: 'fn replacement_unit(start: i32, replacement: i32) -> ((), i32)',
    body: 'let mut value = start; let result = { value = replacement; }; (result, value)',
    assertions:
      'assert_eq!(replacement_unit(9, 0), ((), 0)); assert_eq!(replacement_unit(0, -3), ((), -3)); assert_eq!(replacement_unit(4, 4), ((), 4));',
    call: 'replacement_unit(9, 0)',
    output: '((), 0)',
    topic: 'functions',
    stage: 3,
    solution:
      'fn replacement_unit(start: i32, replacement: i32) -> ((), i32) {\n    let mut value = start;\n    let result = {\n        value = replacement;\n    };\n    (result, value)\n}',
    exampleCode:
      'fn replacement_unit(start: i32, replacement: i32) -> ((), i32) {\n    let mut value = start;\n    let result = {\n        value = replacement;\n    };\n    (result, value)\n}\n\nfn main() {\n    println!("{:?}", replacement_unit(9, 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(replacement_unit(9, 0), ((), 0));\n    assert_eq!(replacement_unit(0, -3), ((), -3));\n    assert_eq!(replacement_unit(4, 4), ((), 4));\n}',
    outputDistractors: ['(0, 0)', '((), 9)'],
  },
  {
    slug: 'recursion',
    title: 'Recursive base cases',
    rule: 'A recursive function needs a terminating base case.',
    decision: 'Reduce the problem size on each recursive call.',
    badRule: [
      'Recursion stops automatically after one call.',
      'A recursive call cannot use a smaller input.',
    ],
    badDecision: [
      'Call the same function with the unchanged input forever.',
      'Handle positive inputs but omit zero as a base case.',
    ],
    signature: 'fn factorial(n: u32) -> u64',
    body: 'if n == 0 { 1 } else { n as u64 * factorial(n - 1) }',
    assertions:
      'assert_eq!(factorial(0), 1); assert_eq!(factorial(5), 120); assert_eq!(factorial(1), 1);',
    call: 'factorial(5)',
    output: '120',
    topic: 'functions',
    stage: 4,
    solution:
      'fn factorial(n: u32) -> u64 {\n    if n == 0 {\n        1\n    } else {\n        n as u64 * factorial(n - 1)\n    }\n}',
    exampleCode:
      'fn factorial(n: u32) -> u64 {\n    if n == 0 {\n        1\n    } else {\n        n as u64 * factorial(n - 1)\n    }\n}\n\nfn main() {\n    println!("{:?}", factorial(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(factorial(0), 1);\n    assert_eq!(factorial(5), 120);\n    assert_eq!(factorial(1), 1);\n}',
    outputDistractors: ['121', '119'],
  },
  {
    slug: 'moves',
    title: 'Move owned values',
    rule: 'Moving a String transfers responsibility for its allocation.',
    decision:
      'Return the moved String instead of trying to read the old binding.',
    badRule: [
      'Moving String duplicates its allocation.',
      'A moved binding is readable until the next scope.',
    ],
    badDecision: [
      'Read the original String after returning it by move.',
      'Expect ownership transfer to shorten the string.',
    ],
    signature: 'fn transfer(text: String) -> String',
    body: 'let moved = text; moved',
    assertions:
      'assert_eq!(transfer(String::from("rust")), "rust"); assert_eq!(transfer(String::new()), "");',
    call: 'transfer(String::from("rust"))',
    output: '"rust"',
    topic: 'ownership',
    stage: 1,
    solution:
      'fn transfer(text: String) -> String {\n    let moved = text;\n    moved\n}',
    exampleCode:
      'fn transfer(text: String) -> String {\n    let moved = text;\n    moved\n}\n\nfn main() {\n    println!("{:?}", transfer(String::from("rust")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(transfer(String::from("rust")), "rust");\n    assert_eq!(transfer(String::new()), "");\n}',
    outputDistractors: ['rust', '""'],
  },
  {
    slug: 'copy',
    title: 'Copy scalar values',
    rule: 'Copy types can be duplicated implicitly without invalidating the source.',
    decision: 'Use both integer bindings after assigning one to the other.',
    badRule: [
      'All heap-owning types implement Copy.',
      'Copy values require calling clone at every assignment.',
    ],
    badDecision: [
      'Assume assigning i32 invalidates its source.',
      'Treat a copied integer as shared mutable storage.',
    ],
    signature: 'fn copy_total(n: i32) -> i32',
    body: 'let other = n; n + other',
    assertions: 'assert_eq!(copy_total(4), 8); assert_eq!(copy_total(-3), -6);',
    call: 'copy_total(4)',
    output: '8',
    topic: 'ownership',
    stage: 2,
    solution:
      'fn copy_total(n: i32) -> i32 {\n    let other = n;\n    n + other\n}',
    exampleCode:
      'fn copy_total(n: i32) -> i32 {\n    let other = n;\n    n + other\n}\n\nfn main() {\n    println!("{:?}", copy_total(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(copy_total(4), 8);\n    assert_eq!(copy_total(-3), -6);\n}',
    outputDistractors: ['9', '7'],
  },
  {
    slug: 'clone',
    title: 'Explicit cloning',
    rule: 'Cloning a String creates an independently owned String with equal contents.',
    decision:
      'Clone the owned String, append with push_str on the clone, and return both independently owned values.',
    badRule: [
      'String clone creates a borrowed &str.',
      'Cloning makes every later mutation affect both strings.',
    ],
    badDecision: [
      'Move the original and then try to use it.',
      'Append to the original when only the independent clone should change.',
    ],
    signature: 'fn copied_suffix(original: String) -> (String, String)',
    body: 'let mut copy = original.clone(); copy.push_str("!"); (original, copy)',
    assertions:
      'assert_eq!(copied_suffix(String::from("hi")), (String::from("hi"), String::from("hi!"))); assert_eq!(copied_suffix(String::new()), (String::new(), String::from("!")));',
    call: 'copied_suffix(String::from("hi"))',
    output: '("hi", "hi!")',
    topic: 'ownership',
    stage: 3,
    solution:
      'fn copied_suffix(original: String) -> (String, String) {\n    let mut copy = original.clone();\n    copy.push_str("!");\n    (original, copy)\n}',
    exampleCode:
      'fn copied_suffix(original: String) -> (String, String) {\n    let mut copy = original.clone();\n    copy.push_str("!");\n    (original, copy)\n}\n\nfn main() {\n    println!("{:?}", copied_suffix(String::from("hi")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(copied_suffix(String::from("hi")), (String::from("hi"), String::from("hi!")));\n    assert_eq!(copied_suffix(String::new()), (String::new(), String::from("!")));\n}',
    outputDistractors: ['"hi", "hi!"', '()'],
  },
  {
    slug: 'drop',
    title: 'Release an owned value',
    rule: 'std::mem::drop consumes an owned String and releases it before the surrounding scope ends.',
    decision:
      'Pass the obsolete String to std::mem::drop and return the separately owned replacement without reading the consumed binding.',
    badRule: [
      'Dropping a String waits for a tracing garbage collector.',
      'Calling std::mem::drop keeps the consumed String binding usable.',
    ],
    badDecision: [
      'Read the original String after std::mem::drop consumed it.',
      'Drop the replacement and then try to return that consumed binding.',
    ],
    signature:
      'fn replace_released(obsolete: String, replacement: String) -> String',
    body: 'std::mem::drop(obsolete); replacement',
    assertions:
      'assert_eq!(replace_released(String::from("old"), String::from("new")), "new"); assert_eq!(replace_released(String::new(), String::from("ready")), "ready"); assert_eq!(replace_released(String::from("old"), String::new()), "");',
    call: 'replace_released(String::from("old"), String::from("new"))',
    output: '"new"',
    topic: 'ownership',
    stage: 4,
    solution:
      'fn replace_released(obsolete: String, replacement: String) -> String {\n    std::mem::drop(obsolete);\n    replacement\n}',
    exampleCode:
      'fn replace_released(obsolete: String, replacement: String) -> String {\n    std::mem::drop(obsolete);\n    replacement\n}\n\nfn main() {\n    println!("{:?}", replace_released(String::from("old"), String::from("new")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(replace_released(String::from("old"), String::from("new")), "new");\n    assert_eq!(replace_released(String::new(), String::from("ready")), "ready");\n    assert_eq!(replace_released(String::from("old"), String::new()), "");\n}',
    outputDistractors: ['"old"', '()'],
  },
  {
    slug: 'shared-borrow',
    title: 'Shared references',
    rule: 'A shared reference permits reading while leaving ownership with the caller.',
    decision:
      'Accept &String when observing an owned string without consuming it.',
    badRule: [
      'A shared reference owns and drops the referenced String.',
      'Shared references permit unrestricted mutation.',
    ],
    badDecision: [
      'Accept String by value when repeated caller use is required.',
      'Clear the String through an immutable shared reference.',
    ],
    signature: 'fn observed_len(text: &String) -> usize',
    body: 'text.len()',
    assertions:
      'let s = String::from("rust"); assert_eq!(observed_len(&s), 4); assert_eq!(observed_len(&s), 4); assert_eq!(s, "rust");',
    call: 'observed_len(&String::from("rust"))',
    output: '4',
    topic: 'borrowing',
    stage: 1,
    solution: 'fn observed_len(text: &String) -> usize {\n    text.len()\n}',
    exampleCode:
      'fn observed_len(text: &String) -> usize {\n    text.len()\n}\n\nfn main() {\n    println!("{:?}", observed_len(&String::from("rust")));\n}',
    testCode:
      'fn main() {\n    let s = String::from("rust");\n    assert_eq!(observed_len(&s), 4);\n    assert_eq!(observed_len(&s), 4);\n    assert_eq!(s, "rust");\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'mutable-borrow',
    title: 'Exclusive mutable references',
    rule: 'A mutable reference grants exclusive access for its active borrow.',
    decision: 'Dereference &mut i32 to update the referenced value.',
    badRule: [
      '&mut permits several active writers to one value.',
      'Changing a referenced value requires moving it out first.',
    ],
    badDecision: [
      'Add to the pointer address instead of the referenced integer.',
      'Create two mutable references and use both concurrently.',
    ],
    signature: 'fn add_to(value: &mut i32, amount: i32)',
    body: '*value += amount;',
    assertions:
      'let mut n = 3; add_to(&mut n, 4); assert_eq!(n, 7); add_to(&mut n, -2); assert_eq!(n, 5);',
    call: '{ let mut n = 3; add_to(&mut n, 4); n }',
    output: '7',
    topic: 'borrowing',
    stage: 2,
    solution:
      'fn add_to(value: &mut i32, amount: i32) {\n    *value += amount;\n}',
    exampleCode:
      'fn add_to(value: &mut i32, amount: i32) {\n    *value += amount;\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut n = 3;\n        add_to(&mut n, 4);\n        n\n    });\n}',
    testCode:
      'fn main() {\n    let mut n = 3;\n    add_to(&mut n, 4);\n    assert_eq!(n, 7);\n    add_to(&mut n, -2);\n    assert_eq!(n, 5);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'borrow-ends',
    title: 'Non-lexical borrow endings',
    rule: 'A borrow can end after its last use before the surrounding scope ends.',
    decision:
      'Finish reading before taking a mutable borrow of the same value.',
    badRule: [
      'Every borrow remains active until the entire function ends.',
      'Last use allows two simultaneous mutable aliases.',
    ],
    badDecision: [
      'Use an old shared borrow again after overlapping mutation.',
      'Keep a shared reference live throughout an exclusive write.',
    ],
    signature: 'fn read_then_append(text: &mut String) -> usize',
    body: "let before = { let view = &*text; view.len() }; text.push('!'); before",
    assertions:
      'let mut s = String::from("hi"); assert_eq!(read_then_append(&mut s), 2); assert_eq!(s, "hi!");',
    call: '{ let mut s = String::from("hi"); read_then_append(&mut s) }',
    output: '2',
    topic: 'borrowing',
    stage: 3,
    solution:
      "fn read_then_append(text: &mut String) -> usize {\n    let before = {\n        let view = &*text;\n        view.len()\n    };\n    text.push('!');\n    before\n}",
    exampleCode:
      'fn read_then_append(text: &mut String) -> usize {\n    let before = {\n        let view = &*text;\n        view.len()\n    };\n    text.push(\'!\');\n    before\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut s = String::from("hi");\n        read_then_append(&mut s)\n    });\n}',
    testCode:
      'fn main() {\n    let mut s = String::from("hi");\n    assert_eq!(read_then_append(&mut s), 2);\n    assert_eq!(s, "hi!");\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'slices',
    title: 'Borrowed slice windows',
    rule: 'A slice borrows a contiguous region without owning its allocation.',
    decision: 'Use a checked length boundary before slicing the prefix.',
    badRule: [
      'Slices duplicate all selected elements.',
      'Slice length is always the backing vector capacity.',
    ],
    badDecision: [
      'Slice beyond length and expect an empty slice.',
      'Return a slice into a local temporary vector.',
    ],
    signature: 'fn prefix(values: &[i32], n: usize) -> &[i32]',
    body: '&values[..n.min(values.len())]',
    assertions:
      'assert_eq!(prefix(&[1, 2, 3], 2), &[1, 2]); assert_eq!(prefix(&[4], 9), &[4]); assert_eq!(prefix(&[], 3), &[]);',
    call: 'prefix(&[1, 2, 3], 2)',
    output: '[1, 2]',
    topic: 'borrowing',
    stage: 4,
    solution:
      'fn prefix(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}',
    exampleCode:
      'fn prefix(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}\n\nfn main() {\n    println!("{:?}", prefix(&[1, 2, 3], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(prefix(&[1, 2, 3], 2), &[1, 2]);\n    assert_eq!(prefix(&[4], 9), &[4]);\n    assert_eq!(prefix(&[], 3), &[]);\n}',
    outputDistractors: ['[]', '[2, 2]'],
  },
  {
    slug: 'utf8-bytes',
    title: 'Bytes and Unicode scalars',
    rule: 'String len counts UTF-8 bytes rather than Unicode scalar values.',
    decision:
      'Compare byte length with chars().count() to distinguish the units.',
    badRule: [
      'String len always counts visible letters.',
      'Every Unicode scalar occupies one UTF-8 byte.',
    ],
    badDecision: [
      'Index a Rust String with an integer to obtain a char.',
      'Assume a Unicode scalar count equals grapheme cluster count.',
    ],
    signature: 'fn text_units(text: &str) -> (usize, usize)',
    body: '(text.len(), text.chars().count())',
    assertions:
      'assert_eq!(text_units("é"), (2, 1)); assert_eq!(text_units("abc"), (3, 3)); assert_eq!(text_units(""), (0, 0));',
    call: 'text_units("é")',
    output: '(2, 1)',
    topic: 'strings',
    stage: 1,
    solution:
      'fn text_units(text: &str) -> (usize, usize) {\n    (text.len(), text.chars().count())\n}',
    exampleCode:
      'fn text_units(text: &str) -> (usize, usize) {\n    (text.len(), text.chars().count())\n}\n\nfn main() {\n    println!("{:?}", text_units("é"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(text_units("é"), (2, 1));\n    assert_eq!(text_units("abc"), (3, 3));\n    assert_eq!(text_units(""), (0, 0));\n}',
    outputDistractors: ['2, 1', '()'],
  },
  {
    slug: 'chars',
    title: 'Iterate Unicode scalars',
    rule: 'The chars iterator decodes a string into Unicode scalar values.',
    decision: 'Use chars().next() when the first scalar is needed.',
    badRule: [
      'chars yields raw u8 bytes.',
      'chars normalizes all combining sequences.',
    ],
    badDecision: [
      'Take the first byte and cast it to char for arbitrary UTF-8.',
      'Assume an empty string contains a null character.',
    ],
    signature: 'fn first_scalar(text: &str) -> Option<char>',
    body: 'text.chars().next()',
    assertions:
      'assert_eq!(first_scalar("éclair"), Some(\'é\')); assert_eq!(first_scalar(""), None);',
    call: 'first_scalar("éclair")',
    output: "Some('é')",
    topic: 'strings',
    stage: 2,
    solution:
      'fn first_scalar(text: &str) -> Option<char> {\n    text.chars().next()\n}',
    exampleCode:
      'fn first_scalar(text: &str) -> Option<char> {\n    text.chars().next()\n}\n\nfn main() {\n    println!("{:?}", first_scalar("éclair"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(first_scalar("éclair"), Some(\'é\'));\n    assert_eq!(first_scalar(""), None);\n}',
    outputDistractors: ['None', "'é'"],
  },
  {
    slug: 'string-boundaries',
    title: 'Checked string boundaries',
    rule: 'str::get returns None when a requested byte range breaks a UTF-8 boundary.',
    decision:
      'Use get instead of unchecked indexing for an arbitrary byte endpoint.',
    badRule: [
      'Every byte boundary is a valid string boundary.',
      'get panics whenever a range is invalid.',
    ],
    badDecision: [
      'Slice directly at byte one of a two-byte scalar.',
      'Treat a None slice as an empty successful string without inspecting it.',
    ],
    signature: 'fn byte_prefix(text: &str, end: usize) -> Option<&str>',
    body: 'text.get(..end)',
    assertions:
      'assert_eq!(byte_prefix("éx", 2), Some("é")); assert_eq!(byte_prefix("éx", 1), None); assert_eq!(byte_prefix("a", 9), None);',
    call: 'byte_prefix("éx", 2)',
    output: 'Some("é")',
    topic: 'strings',
    stage: 3,
    solution:
      'fn byte_prefix(text: &str, end: usize) -> Option<&str> {\n    text.get(..end)\n}',
    exampleCode:
      'fn byte_prefix(text: &str, end: usize) -> Option<&str> {\n    text.get(..end)\n}\n\nfn main() {\n    println!("{:?}", byte_prefix("éx", 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(byte_prefix("éx", 2), Some("é"));\n    assert_eq!(byte_prefix("éx", 1), None);\n    assert_eq!(byte_prefix("a", 9), None);\n}',
    outputDistractors: ['None', '"é"'],
  },
  {
    slug: 'string-conversion',
    title: 'Owned and borrowed text',
    rule: '&str is a borrowed string view while String owns growable UTF-8 storage.',
    decision:
      'Create owned storage only when the output must outlive or change independently of the input.',
    badRule: [
      'String is always a view into a caller allocation.',
      '&str can grow its allocation with push_str.',
    ],
    badDecision: [
      'Return a borrowed local String after the local owner drops.',
      'Mutate &str directly using push.',
    ],
    signature: 'fn shout(text: &str) -> String',
    body: "let mut owned = text.to_owned(); owned.push('!'); owned",
    assertions: 'assert_eq!(shout("go"), "go!"); assert_eq!(shout(""), "!");',
    call: 'shout("go")',
    output: '"go!"',
    topic: 'strings',
    stage: 4,
    solution:
      "fn shout(text: &str) -> String {\n    let mut owned = text.to_owned();\n    owned.push('!');\n    owned\n}",
    exampleCode:
      'fn shout(text: &str) -> String {\n    let mut owned = text.to_owned();\n    owned.push(\'!\');\n    owned\n}\n\nfn main() {\n    println!("{:?}", shout("go"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(shout("go"), "go!");\n    assert_eq!(shout(""), "!");\n}',
    outputDistractors: ['go!', '""'],
  },
  {
    slug: 'struct-fields',
    title: 'Named struct fields',
    rule: 'A struct groups named fields under a distinct type.',
    decision: 'Initialize every field required by the struct definition.',
    badRule: [
      'A struct field name determines its value automatically.',
      'Struct fields can have no declared type.',
    ],
    badDecision: [
      'Leave a required field uninitialized.',
      'Access a named struct field with an array index.',
    ],
    signature: 'fn area(width: u32, height: u32) -> u32',
    body: 'struct Rect { width: u32, height: u32 } let rect = Rect { width, height }; rect.width * rect.height',
    assertions: 'assert_eq!(area(3, 4), 12); assert_eq!(area(0, 8), 0);',
    call: 'area(3, 4)',
    output: '12',
    topic: 'structs',
    stage: 1,
    solution:
      'fn area(width: u32, height: u32) -> u32 {\n    struct Rect {\n        width: u32,\n        height: u32,\n    }\n    let rect = Rect { width, height };\n    rect.width * rect.height\n}',
    exampleCode:
      'fn area(width: u32, height: u32) -> u32 {\n    struct Rect {\n        width: u32,\n        height: u32,\n    }\n    let rect = Rect { width, height };\n    rect.width * rect.height\n}\n\nfn main() {\n    println!("{:?}", area(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(area(3, 4), 12);\n    assert_eq!(area(0, 8), 0);\n}',
    outputDistractors: ['13', '11'],
  },
  {
    slug: 'struct-update',
    title: 'Struct update syntax',
    rule: 'Struct update syntax fills unspecified fields from another value.',
    decision: 'Specify the changed field before the ..base update.',
    badRule: [
      '..base copies all fields even when they are not Copy.',
      'Struct update creates a subclass of the original struct.',
    ],
    badDecision: [
      'Put the update syntax before explicitly initialized fields.',
      'Expect the changed field to retain its previous value.',
    ],
    signature: 'fn revised_score(old: u32, new: u32) -> (u32, bool)',
    body: 'struct Entry { score: u32, active: bool } let base = Entry { score: old, active: true }; let revised = Entry { score: new, ..base }; (revised.score, revised.active)',
    assertions:
      'assert_eq!(revised_score(3, 9), (9, true)); assert_eq!(revised_score(7, 0), (0, true));',
    call: 'revised_score(3, 9)',
    output: '(9, true)',
    topic: 'structs',
    stage: 2,
    solution:
      'fn revised_score(old: u32, new: u32) -> (u32, bool) {\n    struct Entry {\n        score: u32,\n        active: bool,\n    }\n    let base = Entry {\n        score: old,\n        active: true,\n    };\n    let revised = Entry { score: new, ..base };\n    (revised.score, revised.active)\n}',
    exampleCode:
      'fn revised_score(old: u32, new: u32) -> (u32, bool) {\n    struct Entry {\n        score: u32,\n        active: bool,\n    }\n    let base = Entry {\n        score: old,\n        active: true,\n    };\n    let revised = Entry { score: new, ..base };\n    (revised.score, revised.active)\n}\n\nfn main() {\n    println!("{:?}", revised_score(3, 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(revised_score(3, 9), (9, true));\n    assert_eq!(revised_score(7, 0), (0, true));\n}',
    outputDistractors: ['9, true', '()'],
  },
  {
    slug: 'methods',
    title: 'Methods and self',
    rule: 'A method receives its instance through self, &self, or &mut self.',
    decision:
      'Borrow with &self when calculating without consuming or changing the instance.',
    badRule: [
      'Every method must consume self.',
      'Methods are declared inside the struct field list.',
    ],
    badDecision: [
      'Use &mut self for every immutable calculation.',
      'Expect &self to permit changing ordinary fields.',
    ],
    signature: 'fn doubled_score(score: u32) -> u32',
    body: 'struct Score(u32); impl Score { fn doubled(&self) -> u32 { self.0 * 2 } } Score(score).doubled()',
    assertions:
      'assert_eq!(doubled_score(6), 12); assert_eq!(doubled_score(0), 0);',
    call: 'doubled_score(6)',
    output: '12',
    topic: 'structs',
    stage: 3,
    solution:
      'fn doubled_score(score: u32) -> u32 {\n    struct Score(u32);\n    impl Score {\n        fn doubled(&self) -> u32 {\n            self.0 * 2\n        }\n    }\n    Score(score).doubled()\n}',
    exampleCode:
      'fn doubled_score(score: u32) -> u32 {\n    struct Score(u32);\n    impl Score {\n        fn doubled(&self) -> u32 {\n            self.0 * 2\n        }\n    }\n    Score(score).doubled()\n}\n\nfn main() {\n    println!("{:?}", doubled_score(6));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled_score(6), 12);\n    assert_eq!(doubled_score(0), 0);\n}',
    outputDistractors: ['13', '11'],
  },
  {
    slug: 'associated-functions',
    title: 'Associated constructors',
    rule: 'An associated function without self is called through the type.',
    decision: 'Use Type::new when no existing instance is needed.',
    badRule: [
      'Associated functions require a receiver instance.',
      'new is a reserved Rust keyword with automatic constructor behavior.',
    ],
    badDecision: [
      'Call a no-self constructor as an instance method.',
      'Assume fields initialize themselves without code.',
    ],
    signature: 'fn default_count() -> u32',
    body: 'struct Counter { value: u32 } impl Counter { fn new() -> Self { Self { value: 0 } } } Counter::new().value',
    assertions: 'assert_eq!(default_count(), 0);',
    call: 'default_count()',
    output: '0',
    topic: 'structs',
    stage: 4,
    solution:
      'fn default_count() -> u32 {\n    struct Counter {\n        value: u32,\n    }\n    impl Counter {\n        fn new() -> Self {\n            Self { value: 0 }\n        }\n    }\n    Counter::new().value\n}',
    exampleCode:
      'fn default_count() -> u32 {\n    struct Counter {\n        value: u32,\n    }\n    impl Counter {\n        fn new() -> Self {\n            Self { value: 0 }\n        }\n    }\n    Counter::new().value\n}\n\nfn main() {\n    println!("{:?}", default_count());\n}',
    testCode: 'fn main() {\n    assert_eq!(default_count(), 0);\n}',
    outputDistractors: ['1', '-1'],
  },
  {
    slug: 'enum-variants',
    title: 'Enum variants',
    rule: 'An enum value holds exactly one of its declared variants.',
    decision: 'Use an enum to make mutually exclusive states explicit.',
    badRule: [
      'Every enum value contains all variants simultaneously.',
      'Enums can only represent integers.',
    ],
    badDecision: [
      'Store mutually exclusive states as unrelated booleans without checking combinations.',
      'Omit a possible state from the enum declaration and construct it anyway.',
    ],
    signature: 'fn is_ready(ready: bool) -> bool',
    body: 'enum State { Waiting, Ready } let state = if ready { State::Ready } else { State::Waiting }; matches!(state, State::Ready)',
    assertions: 'assert!(is_ready(true)); assert!(!is_ready(false));',
    call: 'is_ready(true)',
    output: 'true',
    topic: 'enums',
    stage: 1,
    solution:
      'fn is_ready(ready: bool) -> bool {\n    enum State {\n        Waiting,\n        Ready,\n    }\n    let state = if ready { State::Ready } else { State::Waiting };\n    matches!(state, State::Ready)\n}',
    exampleCode:
      'fn is_ready(ready: bool) -> bool {\n    enum State {\n        Waiting,\n        Ready,\n    }\n    let state = if ready { State::Ready } else { State::Waiting };\n    matches!(state, State::Ready)\n}\n\nfn main() {\n    println!("{:?}", is_ready(true));\n}',
    testCode:
      'fn main() {\n    assert!(is_ready(true));\n    assert!(!is_ready(false));\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'enum-data',
    title: 'Payload-bearing variants',
    rule: 'Each enum variant may carry data with its own shape.',
    decision:
      'Move the owned String into the Text variant, then match and bind its payload to read its length.',
    badRule: [
      'All variants must carry an identical payload type.',
      'An enum payload is accessible without selecting a variant.',
    ],
    badDecision: [
      'Read a payload field that belongs to a different variant.',
      'Ignore payload values when they determine the result.',
    ],
    signature: 'fn message_size(text: String) -> usize',
    body: 'enum Message { Empty, Text(String) } let message = if text.is_empty() { Message::Empty } else { Message::Text(text) }; match message { Message::Empty => 0, Message::Text(payload) => payload.len() }',
    assertions:
      'assert_eq!(message_size(String::from("rust")), 4); assert_eq!(message_size(String::new()), 0); assert_eq!(message_size(String::from("a")), 1);',
    call: 'message_size(String::from("rust"))',
    output: '4',
    topic: 'enums',
    stage: 2,
    solution:
      'fn message_size(text: String) -> usize {\n    enum Message {\n        Empty,\n        Text(String),\n    }\n    let message = if text.is_empty() {\n        Message::Empty\n    } else {\n        Message::Text(text)\n    };\n    match message {\n        Message::Empty => 0,\n        Message::Text(payload) => payload.len(),\n    }\n}',
    exampleCode:
      'fn message_size(text: String) -> usize {\n    enum Message {\n        Empty,\n        Text(String),\n    }\n    let message = if text.is_empty() {\n        Message::Empty\n    } else {\n        Message::Text(text)\n    };\n    match message {\n        Message::Empty => 0,\n        Message::Text(payload) => payload.len(),\n    }\n}\n\nfn main() {\n    println!("{:?}", message_size(String::from("rust")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(message_size(String::from("rust")), 4);\n    assert_eq!(message_size(String::new()), 0);\n    assert_eq!(message_size(String::from("a")), 1);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'if-let',
    title: 'Focus one pattern',
    rule: 'if let executes a branch when a value matches one selected pattern.',
    decision:
      'Provide an else path when the expression must return for every input.',
    badRule: [
      'if let requires handling every enum variant explicitly.',
      'if let modifies the enum into the requested variant.',
    ],
    badDecision: [
      'Read the payload after the pattern failed.',
      'Omit the else value from an i32-returning if let expression.',
    ],
    signature: 'fn present_or_zero(value: Option<i32>) -> i32',
    body: 'if let Some(n) = value { n } else { 0 }',
    assertions:
      'assert_eq!(present_or_zero(Some(-3)), -3); assert_eq!(present_or_zero(None), 0);',
    call: 'present_or_zero(Some(7))',
    output: '7',
    topic: 'enums',
    stage: 3,
    solution:
      'fn present_or_zero(value: Option<i32>) -> i32 {\n    if let Some(n) = value {\n        n\n    } else {\n        0\n    }\n}',
    exampleCode:
      'fn present_or_zero(value: Option<i32>) -> i32 {\n    if let Some(n) = value {\n        n\n    } else {\n        0\n    }\n}\n\nfn main() {\n    println!("{:?}", present_or_zero(Some(7)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(present_or_zero(Some(-3)), -3);\n    assert_eq!(present_or_zero(None), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'destructure',
    title: 'Destructure nested patterns',
    rule: 'A pattern can unpack nested tuple and enum structure together.',
    decision: 'Bind only the data needed by the selected pattern.',
    badRule: [
      'Nested patterns require separate runtime parsing.',
      'The underscore pattern stores a named value.',
    ],
    badDecision: [
      'Treat _ as a usable local variable.',
      'Swap tuple positions and expect the same extracted field.',
    ],
    signature: 'fn left_value(pair: Option<(i32, i32)>) -> Option<i32>',
    body: 'match pair { Some((left, _)) => Some(left), None => None }',
    assertions:
      'assert_eq!(left_value(Some((2, 9))), Some(2)); assert_eq!(left_value(None), None);',
    call: 'left_value(Some((2, 9)))',
    output: 'Some(2)',
    topic: 'enums',
    stage: 4,
    solution:
      'fn left_value(pair: Option<(i32, i32)>) -> Option<i32> {\n    match pair {\n        Some((left, _)) => Some(left),\n        None => None,\n    }\n}',
    exampleCode:
      'fn left_value(pair: Option<(i32, i32)>) -> Option<i32> {\n    match pair {\n        Some((left, _)) => Some(left),\n        None => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", left_value(Some((2, 9))));\n}',
    testCode:
      'fn main() {\n    assert_eq!(left_value(Some((2, 9))), Some(2));\n    assert_eq!(left_value(None), None);\n}',
    outputDistractors: ['None', '2'],
  },
  {
    slug: 'option',
    title: 'Some and None',
    rule: 'Option models either a present value or an absent value without a null reference.',
    decision: 'Return None when searching an empty slice.',
    badRule: [
      'None contains an uninitialized payload that may be read.',
      'Option always allocates its payload on the heap.',
    ],
    badDecision: [
      'Use unchecked indexing to obtain the first element of any slice.',
      'Return Some(0) when absence must remain distinct from zero.',
    ],
    signature: 'fn first_number(values: &[i32]) -> Option<i32>',
    body: 'values.first().copied()',
    assertions:
      'assert_eq!(first_number(&[0, 3]), Some(0)); assert_eq!(first_number(&[]), None);',
    call: 'first_number(&[0, 3])',
    output: 'Some(0)',
    topic: 'option',
    stage: 1,
    solution:
      'fn first_number(values: &[i32]) -> Option<i32> {\n    values.first().copied()\n}',
    exampleCode:
      'fn first_number(values: &[i32]) -> Option<i32> {\n    values.first().copied()\n}\n\nfn main() {\n    println!("{:?}", first_number(&[0, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(first_number(&[0, 3]), Some(0));\n    assert_eq!(first_number(&[]), None);\n}',
    outputDistractors: ['None', '0'],
  },
  {
    slug: 'option-map',
    title: 'Map a present value',
    rule: 'Option::map calls a transformation function for Some and preserves None without calling it.',
    decision:
      'Pass a named function to map when that function returns the transformed value directly.',
    badRule: [
      'map calls the transformation function for None.',
      'map unwraps and panics on absence.',
    ],
    badDecision: [
      'Use unwrap when absence is a normal input.',
      'Use map for an already optional transformation when a flattened result is required.',
    ],
    signature: 'fn doubled(value: Option<i32>) -> Option<i32>',
    body: 'fn double_number(n: i32) -> i32 { n * 2 } value.map(double_number)',
    assertions:
      'assert_eq!(doubled(Some(3)), Some(6)); assert_eq!(doubled(Some(-2)), Some(-4)); assert_eq!(doubled(None), None);',
    call: 'doubled(Some(3))',
    output: 'Some(6)',
    topic: 'option',
    stage: 2,
    solution:
      'fn doubled(value: Option<i32>) -> Option<i32> {\n    fn double_number(n: i32) -> i32 {\n        n * 2\n    }\n    value.map(double_number)\n}',
    exampleCode:
      'fn doubled(value: Option<i32>) -> Option<i32> {\n    fn double_number(n: i32) -> i32 {\n        n * 2\n    }\n    value.map(double_number)\n}\n\nfn main() {\n    println!("{:?}", doubled(Some(3)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled(Some(3)), Some(6));\n    assert_eq!(doubled(Some(-2)), Some(-4));\n    assert_eq!(doubled(None), None);\n}',
    outputDistractors: ['None', '6'],
  },
  {
    slug: 'option-and-then',
    title: 'Chain optional operations',
    rule: 'Option::and_then calls a function returning Option for Some and flattens the result, preserving None.',
    decision:
      'Pair the present number with its divisor, then pass a named checked-division function to and_then so invalid division returns None.',
    badRule: [
      'and_then produces a nested Option automatically.',
      'None invokes the transformation function with a default zero.',
    ],
    badDecision: [
      'Divide by zero before checking the divisor.',
      'Use map and declare a single Option result for a function already returning Option.',
    ],
    signature:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32>',
    body: 'fn divide_pair(pair: (i32, i32)) -> Option<i32> { pair.0.checked_div(pair.1) } let pair = match value { Some(n) => Some((n, divisor)), None => None }; pair.and_then(divide_pair)',
    assertions:
      'assert_eq!(optional_divide(Some(8), 2), Some(4)); assert_eq!(optional_divide(Some(8), 0), None); assert_eq!(optional_divide(None, 2), None); assert_eq!(optional_divide(Some(i32::MIN), -1), None);',
    call: 'optional_divide(Some(8), 2)',
    output: 'Some(4)',
    topic: 'option',
    stage: 3,
    solution:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32> {\n    fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n        pair.0.checked_div(pair.1)\n    }\n    let pair = match value {\n        Some(n) => Some((n, divisor)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}',
    exampleCode:
      'fn optional_divide(value: Option<i32>, divisor: i32) -> Option<i32> {\n    fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n        pair.0.checked_div(pair.1)\n    }\n    let pair = match value {\n        Some(n) => Some((n, divisor)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}\n\nfn main() {\n    println!("{:?}", optional_divide(Some(8), 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(optional_divide(Some(8), 2), Some(4));\n    assert_eq!(optional_divide(Some(8), 0), None);\n    assert_eq!(optional_divide(None, 2), None);\n    assert_eq!(optional_divide(Some(i32::MIN), -1), None);\n}',
    outputDistractors: ['None', '4'],
  },
  {
    slug: 'option-transpose',
    title: 'Transpose optional errors',
    rule: 'transpose converts Option<Result<T,E>> into Result<Option<T>,E>.',
    decision:
      'Keep absence successful while preserving a present parsing error.',
    badRule: [
      'transpose discards every Err.',
      'transpose changes None into an error.',
    ],
    badDecision: [
      'Turn missing input into a parse failure unconditionally.',
      'Wrap a Result inside Some when the return contract requires Result outside.',
    ],
    signature:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError>',
    body: 'text.map(str::parse::<i32>).transpose()',
    assertions:
      'assert_eq!(parse_optional(Some("12")).unwrap(), Some(12)); assert_eq!(parse_optional(None).unwrap(), None); assert!(parse_optional(Some("bad")).is_err());',
    call: 'parse_optional(Some("12"))',
    output: 'Ok(Some(12))',
    topic: 'option',
    stage: 4,
    solution:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}',
    exampleCode:
      'fn parse_optional(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}\n\nfn main() {\n    println!("{:?}", parse_optional(Some("12")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_optional(Some("12")).unwrap(), Some(12));\n    assert_eq!(parse_optional(None).unwrap(), None);\n    assert!(parse_optional(Some("bad")).is_err());\n}',
    outputDistractors: ['Err("invalid")', 'Some(12)'],
  },
  {
    slug: 'result',
    title: 'Ok and Err',
    rule: 'Result distinguishes a successful payload from a recoverable error payload.',
    decision:
      'Return Err for invalid input instead of inventing a success value.',
    badRule: [
      'Err is a process termination instruction.',
      'Result can store only a bool success flag.',
    ],
    badDecision: [
      'Use panic for every ordinary invalid user input.',
      'Represent invalid input as Ok with a made-up result.',
    ],
    signature: "fn nonnegative(n: i32) -> Result<u32, &'static str>",
    body: 'if n < 0 { Err("negative") } else { Ok(n as u32) }',
    assertions:
      'assert_eq!(nonnegative(3), Ok(3)); assert_eq!(nonnegative(0), Ok(0)); assert_eq!(nonnegative(-1), Err("negative"));',
    call: 'nonnegative(-1)',
    output: 'Err("negative")',
    topic: 'errors',
    stage: 1,
    solution:
      'fn nonnegative(n: i32) -> Result<u32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n as u32)\n    }\n}',
    exampleCode:
      'fn nonnegative(n: i32) -> Result<u32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n as u32)\n    }\n}\n\nfn main() {\n    println!("{:?}", nonnegative(-1));\n}',
    testCode:
      'fn main() {\n    assert_eq!(nonnegative(3), Ok(3));\n    assert_eq!(nonnegative(0), Ok(0));\n    assert_eq!(nonnegative(-1), Err("negative"));\n}',
    outputDistractors: ['Ok(0)', '"negative"'],
  },
  {
    slug: 'result-map',
    title: 'Transform success',
    rule: 'Result::map calls a transformation function for Ok while preserving the Err payload.',
    decision:
      'Pass a named increment function to map so arithmetic applies only to a successful input.',
    badRule: [
      'map transforms the error payload.',
      'map calls the transformation function for every Result.',
    ],
    badDecision: [
      'Overwrite an existing error with an arbitrary success.',
      'Unwrap the error path before applying map.',
    ],
    signature:
      "fn add_success(value: Result<i32, &'static str>) -> Result<i32, &'static str>",
    body: 'fn increment(n: i32) -> i32 { n + 1 } value.map(increment)',
    assertions:
      'assert_eq!(add_success(Ok(2)), Ok(3)); assert_eq!(add_success(Ok(-1)), Ok(0)); assert_eq!(add_success(Err("bad")), Err("bad"));',
    call: 'add_success(Ok(2))',
    output: 'Ok(3)',
    topic: 'errors',
    stage: 2,
    solution:
      "fn add_success(value: Result<i32, &'static str>) -> Result<i32, &'static str> {\n    fn increment(n: i32) -> i32 {\n        n + 1\n    }\n    value.map(increment)\n}",
    exampleCode:
      'fn add_success(value: Result<i32, &\'static str>) -> Result<i32, &\'static str> {\n    fn increment(n: i32) -> i32 {\n        n + 1\n    }\n    value.map(increment)\n}\n\nfn main() {\n    println!("{:?}", add_success(Ok(2)));\n}',
    testCode:
      'fn main() {\n    assert_eq!(add_success(Ok(2)), Ok(3));\n    assert_eq!(add_success(Ok(-1)), Ok(0));\n    assert_eq!(add_success(Err("bad")), Err("bad"));\n}',
    outputDistractors: ['Err("invalid")', '3'],
  },
  {
    slug: 'map-error',
    title: 'Translate an error',
    rule: 'Result::map_err calls a transformation function for the error payload and preserves Ok.',
    decision:
      'Pass a named context function to map_err to format the error without changing a successful result.',
    badRule: [
      'map_err always turns Err into Ok.',
      'map_err modifies the success payload.',
    ],
    badDecision: [
      'Discard the original error before adding its context.',
      'Map the success value when only the error format should change.',
    ],
    signature: 'fn contextual(value: Result<i32, &str>) -> Result<i32, String>',
    body: 'fn context(error: &str) -> String { format!("input: {}", error) } value.map_err(context)',
    assertions:
      'assert_eq!(contextual(Ok(7)), Ok(7)); assert_eq!(contextual(Err("bad")), Err(String::from("input: bad"))); assert_eq!(contextual(Err("")), Err(String::from("input: ")));',
    call: 'contextual(Err("bad"))',
    output: 'Err("input: bad")',
    topic: 'errors',
    stage: 3,
    solution:
      'fn contextual(value: Result<i32, &str>) -> Result<i32, String> {\n    fn context(error: &str) -> String {\n        format!("input: {}", error)\n    }\n    value.map_err(context)\n}',
    exampleCode:
      'fn contextual(value: Result<i32, &str>) -> Result<i32, String> {\n    fn context(error: &str) -> String {\n        format!("input: {}", error)\n    }\n    value.map_err(context)\n}\n\nfn main() {\n    println!("{:?}", contextual(Err("bad")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(contextual(Ok(7)), Ok(7));\n    assert_eq!(contextual(Err("bad")), Err(String::from("input: bad")));\n    assert_eq!(contextual(Err("")), Err(String::from("input: ")));\n}',
    outputDistractors: ['Ok(0)', '"input: bad"'],
  },
  {
    slug: 'question-mark',
    title: 'Propagate with question mark',
    rule: 'The ? operator returns early on an error and unwraps a success for further work.',
    decision:
      'Use a compatible Result return type when propagating parsing errors.',
    badRule: [
      '? ignores an error and continues with zero.',
      '? is allowed in every function regardless of return type.',
    ],
    badDecision: [
      'Use ? in a function returning a bare integer.',
      'Parse both values with unwrap when an error should be returned.',
    ],
    signature:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError>',
    body: 'let left = a.parse::<i32>()?; let right = b.parse::<i32>()?; Ok(left + right)',
    assertions:
      'assert_eq!(parse_sum("3", "4").unwrap(), 7); assert!(parse_sum("bad", "4").is_err()); assert!(parse_sum("3", "bad").is_err());',
    call: 'parse_sum("3", "4")',
    output: 'Ok(7)',
    topic: 'errors',
    stage: 4,
    solution:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let left = a.parse::<i32>()?;\n    let right = b.parse::<i32>()?;\n    Ok(left + right)\n}',
    exampleCode:
      'fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let left = a.parse::<i32>()?;\n    let right = b.parse::<i32>()?;\n    Ok(left + right)\n}\n\nfn main() {\n    println!("{:?}", parse_sum("3", "4"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_sum("3", "4").unwrap(), 7);\n    assert!(parse_sum("bad", "4").is_err());\n    assert!(parse_sum("3", "bad").is_err());\n}',
    outputDistractors: ['Err("invalid")', '7'],
  },
  {
    slug: 'vec-push',
    title: 'Vector push and pop',
    rule: 'Vec owns a contiguous growable sequence and pop returns an optional last element.',
    decision: 'Use pop to handle an empty vector without invalid indexing.',
    badRule: [
      'Vec stores each element in an unrelated allocation.',
      'pop always returns the first element.',
    ],
    badDecision: [
      'Read len - 1 on an empty vector.',
      'Expect pop to leave the last element in the vector.',
    ],
    signature:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize)',
    body: 'values.push(extra); let removed = values.pop(); (removed, values.len())',
    assertions:
      'assert_eq!(pushed_then_popped(vec![1, 2], 9), (Some(9), 2)); assert_eq!(pushed_then_popped(vec![], 3), (Some(3), 0));',
    call: 'pushed_then_popped(vec![1, 2], 9)',
    output: '(Some(9), 2)',
    topic: 'vectors',
    stage: 1,
    solution:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize) {\n    values.push(extra);\n    let removed = values.pop();\n    (removed, values.len())\n}',
    exampleCode:
      'fn pushed_then_popped(mut values: Vec<i32>, extra: i32) -> (Option<i32>, usize) {\n    values.push(extra);\n    let removed = values.pop();\n    (removed, values.len())\n}\n\nfn main() {\n    println!("{:?}", pushed_then_popped(vec![1, 2], 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(pushed_then_popped(vec![1, 2], 9), (Some(9), 2));\n    assert_eq!(pushed_then_popped(vec![], 3), (Some(3), 0));\n}',
    outputDistractors: ['Some(9), 2', '()'],
  },
  {
    slug: 'vec-get',
    title: 'Checked vector access',
    rule: 'get returns an optional reference rather than panicking on an invalid index.',
    decision:
      'Copy an i32 from the optional reference when an owned value is required.',
    badRule: [
      'get allocates a copy of the entire vector.',
      'get silently wraps an out-of-range index.',
    ],
    badDecision: [
      'Use indexing for an arbitrary untrusted index without bounds checks.',
      'Return a reference when the contract requires Option<i32>.',
    ],
    signature: 'fn at(values: &[i32], index: usize) -> Option<i32>',
    body: 'values.get(index).copied()',
    assertions:
      'assert_eq!(at(&[5, 8], 1), Some(8)); assert_eq!(at(&[5], 2), None); assert_eq!(at(&[], 0), None);',
    call: 'at(&[5, 8], 1)',
    output: 'Some(8)',
    topic: 'vectors',
    stage: 2,
    solution:
      'fn at(values: &[i32], index: usize) -> Option<i32> {\n    values.get(index).copied()\n}',
    exampleCode:
      'fn at(values: &[i32], index: usize) -> Option<i32> {\n    values.get(index).copied()\n}\n\nfn main() {\n    println!("{:?}", at(&[5, 8], 1));\n}',
    testCode:
      'fn main() {\n    assert_eq!(at(&[5, 8], 1), Some(8));\n    assert_eq!(at(&[5], 2), None);\n    assert_eq!(at(&[], 0), None);\n}',
    outputDistractors: ['None', '8'],
  },
  {
    slug: 'vec-retain',
    title: 'Retain matching elements',
    rule: 'retain removes elements for which its predicate is false while preserving order.',
    decision:
      'Pass a named predicate accepting &i32 to retain, and keep an element when its dereferenced value is nonnegative.',
    badRule: [
      'retain sorts every surviving element.',
      'retain keeps values whose predicate is false.',
    ],
    badDecision: [
      'Mutate vector length inside the retain predicate.',
      'Use a negative predicate when retaining nonnegative values.',
    ],
    signature: 'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32>',
    body: 'fn is_nonnegative(n: &i32) -> bool { *n >= 0 } values.retain(is_nonnegative); values',
    assertions:
      'assert_eq!(keep_nonnegative(vec![-1, 0, 3, -4]), vec![0, 3]); assert!(keep_nonnegative(vec![-1]).is_empty()); assert_eq!(keep_nonnegative(vec![3, 1, 0]), vec![3, 1, 0]); assert!(keep_nonnegative(vec![]).is_empty());',
    call: 'keep_nonnegative(vec![-1, 0, 3, -4])',
    output: '[0, 3]',
    topic: 'vectors',
    stage: 3,
    solution:
      'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32> {\n    fn is_nonnegative(n: &i32) -> bool {\n        *n >= 0\n    }\n    values.retain(is_nonnegative);\n    values\n}',
    exampleCode:
      'fn keep_nonnegative(mut values: Vec<i32>) -> Vec<i32> {\n    fn is_nonnegative(n: &i32) -> bool {\n        *n >= 0\n    }\n    values.retain(is_nonnegative);\n    values\n}\n\nfn main() {\n    println!("{:?}", keep_nonnegative(vec![-1, 0, 3, -4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(keep_nonnegative(vec![-1, 0, 3, -4]), vec![0, 3]);\n    assert!(keep_nonnegative(vec![-1]).is_empty());\n    assert_eq!(keep_nonnegative(vec![3, 1, 0]), vec![3, 1, 0]);\n    assert!(keep_nonnegative(vec![]).is_empty());\n}',
    outputDistractors: ['[]', '[1, 3]'],
  },
  {
    slug: 'vec-extend',
    title: 'Extend from an iterator',
    rule: 'extend appends items obtained from an iterator in iterator order.',
    decision:
      'Use copied() to turn an iterator of references into copied scalar elements.',
    badRule: [
      'extend replaces all existing elements.',
      'extend requires every source to be a Vec.',
    ],
    badDecision: [
      'Append references into a Vec<i32>.',
      'Expect extending from an empty slice to erase existing elements.',
    ],
    signature: 'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32>',
    body: 'left.extend(right.iter().copied()); left',
    assertions:
      'assert_eq!(joined(vec![1], &[2, 3]), vec![1, 2, 3]); assert_eq!(joined(vec![1], &[]), vec![1]);',
    call: 'joined(vec![1], &[2, 3])',
    output: '[1, 2, 3]',
    topic: 'vectors',
    stage: 4,
    solution:
      'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32> {\n    left.extend(right.iter().copied());\n    left\n}',
    exampleCode:
      'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32> {\n    left.extend(right.iter().copied());\n    left\n}\n\nfn main() {\n    println!("{:?}", joined(vec![1], &[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(joined(vec![1], &[2, 3]), vec![1, 2, 3]);\n    assert_eq!(joined(vec![1], &[]), vec![1]);\n}',
    outputDistractors: ['[]', '[2, 2, 3]'],
  },
  {
    slug: 'map-entry',
    title: 'Hash map entry updates',
    rule: 'entry accesses an existing value or inserts a value for an absent key.',
    decision: 'Increment the mutable value returned by or_insert.',
    badRule: [
      'entry always overwrites an existing value.',
      'HashMap guarantees sorted iteration order.',
    ],
    badDecision: [
      'Use a missing-key index before inserting the key.',
      'Rebuild the entire map for every count increment.',
    ],
    signature:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize>',
    body: 'let mut counts = std::collections::HashMap::new(); for &n in values { *counts.entry(n).or_insert(0) += 1; } counts',
    assertions:
      'let m = frequencies(&[2, 2, 3]); assert_eq!(m.get(&2), Some(&2)); assert_eq!(m.get(&3), Some(&1)); assert!(frequencies(&[]).is_empty());',
    call: 'frequencies(&[2, 2, 3]).get(&2).copied()',
    output: 'Some(2)',
    topic: 'maps-sets',
    stage: 1,
    solution:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize> {\n    let mut counts = std::collections::HashMap::new();\n    for &n in values {\n        *counts.entry(n).or_insert(0) += 1;\n    }\n    counts\n}',
    exampleCode:
      'fn frequencies(values: &[i32]) -> std::collections::HashMap<i32, usize> {\n    let mut counts = std::collections::HashMap::new();\n    for &n in values {\n        *counts.entry(n).or_insert(0) += 1;\n    }\n    counts\n}\n\nfn main() {\n    println!("{:?}", frequencies(&[2, 2, 3]).get(&2).copied());\n}',
    testCode:
      'fn main() {\n    let m = frequencies(&[2, 2, 3]);\n    assert_eq!(m.get(&2), Some(&2));\n    assert_eq!(m.get(&3), Some(&1));\n    assert!(frequencies(&[]).is_empty());\n}',
    outputDistractors: ['None', '2'],
  },
  {
    slug: 'map-lookup',
    title: 'Borrowed map lookup',
    rule: 'A map lookup returns an optional reference to a value associated with its key.',
    decision: 'Keep absent keys distinct from keys whose stored value is zero.',
    badRule: [
      'get inserts an absent key with zero.',
      'Map lookup consumes every queried key and map.',
    ],
    badDecision: [
      'Return zero unconditionally for both missing and present keys.',
      'Unwrap a lookup without handling the absent case.',
    ],
    signature:
      'fn find_score(entries: &[(String, u32)], name: &str) -> Option<u32>',
    body: 'let map: std::collections::HashMap<&str, u32> = entries.iter().map(|(k, v)| (k.as_str(), *v)).collect(); map.get(name).copied()',
    assertions:
      'let entries = vec![("a".into(), 0), ("b".into(), 8)]; assert_eq!(find_score(&entries, "a"), Some(0)); assert_eq!(find_score(&entries, "x"), None);',
    call: 'find_score(&[("b".into(), 8)], "b")',
    output: 'Some(8)',
    topic: 'maps-sets',
    stage: 2,
    solution:
      'fn find_score(entries: &[(String, u32)], name: &str) -> Option<u32> {\n    let map: std::collections::HashMap<&str, u32> =\n        entries.iter().map(|(k, v)| (k.as_str(), *v)).collect();\n    map.get(name).copied()\n}',
    exampleCode:
      'fn find_score(entries: &[(String, u32)], name: &str) -> Option<u32> {\n    let map: std::collections::HashMap<&str, u32> =\n        entries.iter().map(|(k, v)| (k.as_str(), *v)).collect();\n    map.get(name).copied()\n}\n\nfn main() {\n    println!("{:?}", find_score(&[("b".into(), 8)], "b"));\n}',
    testCode:
      'fn main() {\n    let entries = vec![("a".into(), 0), ("b".into(), 8)];\n    assert_eq!(find_score(&entries, "a"), Some(0));\n    assert_eq!(find_score(&entries, "x"), None);\n}',
    outputDistractors: ['None', '8'],
  },
  {
    slug: 'hash-set',
    title: 'Deduplicate with a set',
    rule: 'HashSet stores at most one element equal to each distinct value.',
    decision:
      'Use the set length to count unique values without depending on iteration order.',
    badRule: [
      'HashSet stores every duplicate separately.',
      'HashSet sorts its elements before counting.',
    ],
    badDecision: [
      'Assume hash set iteration order is stable across runs.',
      'Count inserted items rather than distinct stored items.',
    ],
    signature: 'fn unique_count(values: &[i32]) -> usize',
    body: 'values.iter().copied().collect::<std::collections::HashSet<_>>().len()',
    assertions:
      'assert_eq!(unique_count(&[3, 3, 1, 3]), 2); assert_eq!(unique_count(&[]), 0);',
    call: 'unique_count(&[3, 3, 1, 3])',
    output: '2',
    topic: 'maps-sets',
    stage: 3,
    solution:
      'fn unique_count(values: &[i32]) -> usize {\n    values\n        .iter()\n        .copied()\n        .collect::<std::collections::HashSet<_>>()\n        .len()\n}',
    exampleCode:
      'fn unique_count(values: &[i32]) -> usize {\n    values\n        .iter()\n        .copied()\n        .collect::<std::collections::HashSet<_>>()\n        .len()\n}\n\nfn main() {\n    println!("{:?}", unique_count(&[3, 3, 1, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(unique_count(&[3, 3, 1, 3]), 2);\n    assert_eq!(unique_count(&[]), 0);\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'btree-range',
    title: 'Ordered map ranges',
    rule: 'BTreeMap keeps keys ordered and can visit only keys within a specified range.',
    decision:
      'Use an inclusive range when both boundary keys should participate.',
    badRule: [
      'BTreeMap exposes keys in random hash order.',
      'Range lookup requires converting the map to a vector.',
    ],
    badDecision: [
      'Use .. when the upper boundary must be included.',
      'Sum all keys while ignoring the requested bounds.',
    ],
    signature:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32',
    body: 'let map: std::collections::BTreeMap<_, _> = entries.iter().copied().collect(); if low > high { return 0; } map.range(low..=high).map(|(_, v)| *v).sum()',
    assertions:
      'assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2), 8); assert_eq!(range_total(&[(1, 3)], 4, 2), 0);',
    call: 'range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2)',
    output: '8',
    topic: 'maps-sets',
    stage: 4,
    solution:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32 {\n    let map: std::collections::BTreeMap<_, _> = entries.iter().copied().collect();\n    if low > high {\n        return 0;\n    }\n    map.range(low..=high).map(|(_, v)| *v).sum()\n}',
    exampleCode:
      'fn range_total(entries: &[(i32, i32)], low: i32, high: i32) -> i32 {\n    let map: std::collections::BTreeMap<_, _> = entries.iter().copied().collect();\n    if low > high {\n        return 0;\n    }\n    map.range(low..=high).map(|(_, v)| *v).sum()\n}\n\nfn main() {\n    println!("{:?}", range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(range_total(&[(1, 3), (2, 5), (4, 7)], 1, 2), 8);\n    assert_eq!(range_total(&[(1, 3)], 4, 2), 0);\n}',
    outputDistractors: ['9', '7'],
  },
  {
    slug: 'generic-functions',
    title: 'Generic function parameters',
    rule: 'A type parameter lets one function work with several concrete types.',
    decision:
      'Return the input without assuming operations unavailable on an unconstrained type.',
    badRule: [
      'A generic function is called only with one concrete type for its entire program.',
      'Unconstrained T automatically supports addition.',
    ],
    badDecision: [
      'Add one to every arbitrary T without a trait bound.',
      'Convert any T into i32 by an unchecked cast.',
    ],
    signature: 'fn identity<T>(value: T) -> T',
    body: 'value',
    assertions:
      'assert_eq!(identity(7), 7); assert_eq!(identity(String::from("rust")), "rust");',
    call: 'identity(7)',
    output: '7',
    topic: 'generics',
    stage: 1,
    solution: 'fn identity<T>(value: T) -> T {\n    value\n}',
    exampleCode:
      'fn identity<T>(value: T) -> T {\n    value\n}\n\nfn main() {\n    println!("{:?}", identity(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(identity(7), 7);\n    assert_eq!(identity(String::from("rust")), "rust");\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'generic-structs',
    title: 'Generic record fields',
    rule: 'A generic struct stores fields parameterized by its declared type argument.',
    decision:
      'Use the same type parameter consistently in the field and impl definitions.',
    badRule: [
      'A struct type parameter must be an integer.',
      'Generic structs cannot have methods.',
    ],
    badDecision: [
      'Hard-code an i32 field while claiming arbitrary T storage.',
      'Refer to an undeclared type parameter in an impl.',
    ],
    signature: 'fn unwrap_holder<T>(value: T) -> T',
    body: 'struct Holder<T> { value: T } let holder = Holder { value }; holder.value',
    assertions:
      'assert_eq!(unwrap_holder(3), 3); assert_eq!(unwrap_holder("hi"), "hi");',
    call: 'unwrap_holder("hi")',
    output: '"hi"',
    topic: 'generics',
    stage: 2,
    solution:
      'fn unwrap_holder<T>(value: T) -> T {\n    struct Holder<T> {\n        value: T,\n    }\n    let holder = Holder { value };\n    holder.value\n}',
    exampleCode:
      'fn unwrap_holder<T>(value: T) -> T {\n    struct Holder<T> {\n        value: T,\n    }\n    let holder = Holder { value };\n    holder.value\n}\n\nfn main() {\n    println!("{:?}", unwrap_holder("hi"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(unwrap_holder(3), 3);\n    assert_eq!(unwrap_holder("hi"), "hi");\n}',
    outputDistractors: ['hi', '""'],
  },
  {
    slug: 'trait-bounds',
    title: 'Constrain operations with bounds',
    rule: 'A trait bound states the operations a generic type must support.',
    decision:
      'Require Ord before using an ordering comparison in a generic function.',
    badRule: [
      'Every generic type supports greater-than by default.',
      'Trait bounds select values randomly at runtime.',
    ],
    badDecision: [
      'Compare two unconstrained T values.',
      'Use a Clone bound alone as proof of an ordering operation.',
    ],
    signature: 'fn larger<T: Ord>(a: T, b: T) -> T',
    body: 'if a >= b { a } else { b }',
    assertions:
      'assert_eq!(larger(3, 9), 9); assert_eq!(larger("z", "a"), "z"); assert_eq!(larger(4, 4), 4);',
    call: 'larger(3, 9)',
    output: '9',
    topic: 'generics',
    stage: 3,
    solution:
      'fn larger<T: Ord>(a: T, b: T) -> T {\n    if a >= b {\n        a\n    } else {\n        b\n    }\n}',
    exampleCode:
      'fn larger<T: Ord>(a: T, b: T) -> T {\n    if a >= b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{:?}", larger(3, 9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(larger(3, 9), 9);\n    assert_eq!(larger("z", "a"), "z");\n    assert_eq!(larger(4, 4), 4);\n}',
    outputDistractors: ['10', '8'],
  },
  {
    slug: 'where',
    title: 'Readable where clauses',
    rule: 'A where clause places generic constraints after the parameter and return declarations.',
    decision:
      'Require Clone when returning an independent copy of a borrowed generic value.',
    badRule: [
      'where clauses change runtime branching behavior.',
      'where cannot express bounds used inside functions.',
    ],
    badDecision: [
      'Return the borrowed value as owned T without cloning or moving it.',
      'Require Copy when only Clone is necessary.',
    ],
    signature: 'fn owned_copy<T>(value: &T) -> T where T: Clone',
    body: 'value.clone()',
    assertions:
      'assert_eq!(owned_copy(&String::from("hi")), "hi"); assert_eq!(owned_copy(&8), 8);',
    call: 'owned_copy(&String::from("hi"))',
    output: '"hi"',
    topic: 'generics',
    stage: 4,
    solution:
      'fn owned_copy<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}',
    exampleCode:
      'fn owned_copy<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}\n\nfn main() {\n    println!("{:?}", owned_copy(&String::from("hi")));\n}',
    testCode:
      'fn main() {\n    assert_eq!(owned_copy(&String::from("hi")), "hi");\n    assert_eq!(owned_copy(&8), 8);\n}',
    outputDistractors: ['hi', '""'],
  },
  {
    slug: 'trait-impl',
    title: 'Implement a trait',
    rule: 'An impl of a trait supplies the required behavior for a concrete type.',
    decision:
      'Keep the implementation method signature compatible with the trait definition.',
    badRule: [
      'Declaring a trait automatically implements it for every struct.',
      'An impl may omit required methods without a default.',
    ],
    badDecision: [
      'Implement a required &self method with an unrelated signature.',
      'Call a trait method on a type lacking its implementation.',
    ],
    signature: 'fn measured(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } Count(n).size()',
    assertions: 'assert_eq!(measured(5), 5); assert_eq!(measured(0), 0);',
    call: 'measured(5)',
    output: '5',
    topic: 'traits',
    stage: 1,
    solution:
      'fn measured(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).size()\n}',
    exampleCode:
      'fn measured(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).size()\n}\n\nfn main() {\n    println!("{:?}", measured(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(measured(5), 5);\n    assert_eq!(measured(0), 0);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'default-method',
    title: 'Default trait methods',
    rule: 'A trait may provide a default method that uses its required methods.',
    decision:
      'Implement the required primitive and reuse the default derived behavior.',
    badRule: [
      'Default methods prohibit overrides.',
      'A default method cannot call another trait method.',
    ],
    badDecision: [
      'Omit the required method and expect its default caller to invent it.',
      'Treat a default trait method as stored instance data.',
    ],
    signature: 'fn doubled_measure(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; fn doubled(&self) -> u32 { self.size() * 2 } } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } Count(n).doubled()',
    assertions:
      'assert_eq!(doubled_measure(5), 10); assert_eq!(doubled_measure(0), 0);',
    call: 'doubled_measure(5)',
    output: '10',
    topic: 'traits',
    stage: 2,
    solution:
      'fn doubled_measure(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n        fn doubled(&self) -> u32 {\n            self.size() * 2\n        }\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).doubled()\n}',
    exampleCode:
      'fn doubled_measure(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n        fn doubled(&self) -> u32 {\n            self.size() * 2\n        }\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    Count(n).doubled()\n}\n\nfn main() {\n    println!("{:?}", doubled_measure(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(doubled_measure(5), 10);\n    assert_eq!(doubled_measure(0), 0);\n}',
    outputDistractors: ['11', '9'],
  },
  {
    slug: 'associated-types',
    title: 'Associated trait types',
    rule: 'An associated type names an output type chosen by each trait implementation.',
    decision:
      'Specify the associated type in the impl and use Self::Item in the method.',
    badRule: [
      'Associated types are runtime values stored in each instance.',
      'Every trait implementation can omit a required associated type.',
    ],
    badDecision: [
      'Return an unrelated type from a Self::Item method.',
      'Define the type outside the impl without assigning the associated type.',
    ],
    signature: 'fn associated_value(n: i32) -> i32',
    body: 'trait Source { type Item; fn get(&self) -> Self::Item; } struct Number(i32); impl Source for Number { type Item = i32; fn get(&self) -> Self::Item { self.0 } } Number(n).get()',
    assertions:
      'assert_eq!(associated_value(-2), -2); assert_eq!(associated_value(0), 0);',
    call: 'associated_value(-2)',
    output: '-2',
    topic: 'traits',
    stage: 3,
    solution:
      'fn associated_value(n: i32) -> i32 {\n    trait Source {\n        type Item;\n        fn get(&self) -> Self::Item;\n    }\n    struct Number(i32);\n    impl Source for Number {\n        type Item = i32;\n        fn get(&self) -> Self::Item {\n            self.0\n        }\n    }\n    Number(n).get()\n}',
    exampleCode:
      'fn associated_value(n: i32) -> i32 {\n    trait Source {\n        type Item;\n        fn get(&self) -> Self::Item;\n    }\n    struct Number(i32);\n    impl Source for Number {\n        type Item = i32;\n        fn get(&self) -> Self::Item {\n            self.0\n        }\n    }\n    Number(n).get()\n}\n\nfn main() {\n    println!("{:?}", associated_value(-2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(associated_value(-2), -2);\n    assert_eq!(associated_value(0), 0);\n}',
    outputDistractors: ['-1', '-3'],
  },
  {
    slug: 'trait-objects',
    title: 'Dynamic trait dispatch',
    rule: 'A dyn trait reference can call object-safe behavior implemented by different concrete types.',
    decision:
      'Call the shared method through &dyn Trait without naming the concrete implementor.',
    badRule: [
      'dyn Trait stores all possible implementations at once.',
      'Dynamic dispatch requires a generic type parameter at each caller.',
    ],
    badDecision: [
      'Access a concrete-only field through dyn Trait.',
      'Expect every trait with generic methods to be dyn compatible.',
    ],
    signature: 'fn dynamic_size(n: u32) -> u32',
    body: 'trait Measure { fn size(&self) -> u32; } struct Count(u32); impl Measure for Count { fn size(&self) -> u32 { self.0 } } fn observe(value: &dyn Measure) -> u32 { value.size() } observe(&Count(n))',
    assertions:
      'assert_eq!(dynamic_size(8), 8); assert_eq!(dynamic_size(0), 0);',
    call: 'dynamic_size(8)',
    output: '8',
    topic: 'traits',
    stage: 4,
    solution:
      'fn dynamic_size(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    fn observe(value: &dyn Measure) -> u32 {\n        value.size()\n    }\n    observe(&Count(n))\n}',
    exampleCode:
      'fn dynamic_size(n: u32) -> u32 {\n    trait Measure {\n        fn size(&self) -> u32;\n    }\n    struct Count(u32);\n    impl Measure for Count {\n        fn size(&self) -> u32 {\n            self.0\n        }\n    }\n    fn observe(value: &dyn Measure) -> u32 {\n        value.size()\n    }\n    observe(&Count(n))\n}\n\nfn main() {\n    println!("{:?}", dynamic_size(8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(dynamic_size(8), 8);\n    assert_eq!(dynamic_size(0), 0);\n}',
    outputDistractors: ['9', '7'],
  },
  {
    slug: 'lifetime-elision',
    title: 'Elided input lifetime',
    rule: 'With one input reference lifetime, elision assigns that lifetime to an output reference.',
    decision:
      'Return a slice borrowed from the supplied string rather than local storage.',
    badRule: [
      'Elision turns a borrowed result into an owned String.',
      'An elided reference always lives for the entire program.',
    ],
    badDecision: [
      'Return a reference into a newly allocated local String.',
      'Assume an output borrow outlives its only input owner.',
    ],
    signature: 'fn trimmed(text: &str) -> &str',
    body: 'text.trim()',
    assertions:
      'assert_eq!(trimmed("  hi  "), "hi"); assert_eq!(trimmed("   "), "");',
    call: 'trimmed("  hi  ")',
    output: '"hi"',
    topic: 'lifetimes',
    stage: 1,
    solution: 'fn trimmed(text: &str) -> &str {\n    text.trim()\n}',
    exampleCode:
      'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    println!("{:?}", trimmed("  hi  "));\n}',
    testCode:
      'fn main() {\n    assert_eq!(trimmed("  hi  "), "hi");\n    assert_eq!(trimmed("   "), "");\n}',
    outputDistractors: ['hi', '""'],
  },
  {
    slug: 'lifetime-explicit',
    title: 'Explicit lifetime relations',
    rule: 'A shared lifetime parameter relates output validity to the referenced inputs.',
    decision:
      'Tie a returned choice between two borrows to a lifetime supported by both inputs.',
    badRule: [
      'A lifetime annotation extends either allocation lifetime.',
      'Two input references are always automatically assigned to one output lifetime.',
    ],
    badDecision: [
      'Return a local string by adding a lifetime annotation.',
      'Promise a static output from arbitrary borrowed inputs.',
    ],
    signature: "fn longer<'a>(a: &'a str, b: &'a str) -> &'a str",
    body: 'if a.len() >= b.len() { a } else { b }',
    assertions:
      'assert_eq!(longer("a", "rust"), "rust"); assert_eq!(longer("ab", "cd"), "ab");',
    call: 'longer("a", "rust")',
    output: '"rust"',
    topic: 'lifetimes',
    stage: 2,
    solution:
      "fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}",
    exampleCode:
      'fn longer<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{:?}", longer("a", "rust"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(longer("a", "rust"), "rust");\n    assert_eq!(longer("ab", "cd"), "ab");\n}',
    outputDistractors: ['rust', '""'],
  },
  {
    slug: 'borrowed-struct',
    title: 'Structs holding borrows',
    rule: 'A struct containing a reference must track the reference lifetime.',
    decision:
      'Keep the referenced owner alive while its borrowed view is used.',
    badRule: [
      'A reference field gives its struct ownership of the allocation.',
      'Adding a lifetime field causes heap allocation.',
    ],
    badDecision: [
      'Construct a view into a temporary owner that immediately drops.',
      'Omit the lifetime parameter of a stored nonstatic reference.',
    ],
    signature: 'fn view_length(text: &str) -> usize',
    body: "struct View<'a> { text: &'a str } impl View<'_> { fn len(&self) -> usize { self.text.len() } } View { text }.len()",
    assertions:
      'assert_eq!(view_length("rust"), 4); assert_eq!(view_length(""), 0);',
    call: 'view_length("rust")',
    output: '4',
    topic: 'lifetimes',
    stage: 3,
    solution:
      "fn view_length(text: &str) -> usize {\n    struct View<'a> {\n        text: &'a str,\n    }\n    impl View<'_> {\n        fn len(&self) -> usize {\n            self.text.len()\n        }\n    }\n    View { text }.len()\n}",
    exampleCode:
      'fn view_length(text: &str) -> usize {\n    struct View<\'a> {\n        text: &\'a str,\n    }\n    impl View<\'_> {\n        fn len(&self) -> usize {\n            self.text.len()\n        }\n    }\n    View { text }.len()\n}\n\nfn main() {\n    println!("{:?}", view_length("rust"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(view_length("rust"), 4);\n    assert_eq!(view_length(""), 0);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'static',
    title: 'Static references and bounds',
    rule: 'A string literal can provide a static reference because its bytes live for the program.',
    decision:
      'Return a literal when the contract promises a static string reference.',
    badRule: [
      'Every owned String automatically has a static reference.',
      'A static trait bound means a value must never be dropped.',
    ],
    badDecision: [
      'Return a reference to a local String as static.',
      'Treat a T: static bound as a command to leak every T.',
    ],
    signature: "fn status_label(ok: bool) -> &'static str",
    body: 'if ok { "ready" } else { "waiting" }',
    assertions:
      'assert_eq!(status_label(true), "ready"); assert_eq!(status_label(false), "waiting");',
    call: 'status_label(true)',
    output: '"ready"',
    topic: 'lifetimes',
    stage: 4,
    solution:
      'fn status_label(ok: bool) -> &\'static str {\n    if ok {\n        "ready"\n    } else {\n        "waiting"\n    }\n}',
    exampleCode:
      'fn status_label(ok: bool) -> &\'static str {\n    if ok {\n        "ready"\n    } else {\n        "waiting"\n    }\n}\n\nfn main() {\n    println!("{:?}", status_label(true));\n}',
    testCode:
      'fn main() {\n    assert_eq!(status_label(true), "ready");\n    assert_eq!(status_label(false), "waiting");\n}',
    outputDistractors: ['ready', '""'],
  },
  {
    slug: 'closure-capture',
    title: 'Capture the environment',
    rule: 'A closure may borrow values from the scope where it is created.',
    decision: 'Use a captured immutable offset when transforming an input.',
    badRule: [
      'A closure cannot refer to surrounding local values.',
      'Capturing an integer always allocates a heap object.',
    ],
    badDecision: [
      'Pass a captured offset as a missing function argument.',
      'Assume every closure has the same concrete type.',
    ],
    signature: 'fn offset_value(n: i32, offset: i32) -> i32',
    body: 'let shifted = |value| value + offset; shifted(n)',
    assertions:
      'assert_eq!(offset_value(3, 4), 7); assert_eq!(offset_value(-2, 0), -2);',
    call: 'offset_value(3, 4)',
    output: '7',
    topic: 'closures',
    stage: 1,
    solution:
      'fn offset_value(n: i32, offset: i32) -> i32 {\n    let shifted = |value| value + offset;\n    shifted(n)\n}',
    exampleCode:
      'fn offset_value(n: i32, offset: i32) -> i32 {\n    let shifted = |value| value + offset;\n    shifted(n)\n}\n\nfn main() {\n    println!("{:?}", offset_value(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(offset_value(3, 4), 7);\n    assert_eq!(offset_value(-2, 0), -2);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'fn-bound',
    title: 'Read-only callable bounds',
    rule: 'The Fn trait supports calls through a shared borrow of the callable.',
    decision:
      'Accept Fn when the callable need not mutate its captured environment.',
    badRule: [
      'Fn callables must consume themselves on every call.',
      'A function parameter cannot accept a closure.',
    ],
    badDecision: [
      'Require a concrete closure type that callers cannot name.',
      'Assume an Fn bound allows mutating captured state without interior mutability.',
    ],
    signature: 'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32',
    body: 'f(f(value))',
    assertions:
      'assert_eq!(twice(3, |n| n + 2), 7); assert_eq!(twice(2, |n| n * 3), 18);',
    call: 'twice(3, |n| n + 2)',
    output: '7',
    topic: 'closures',
    stage: 2,
    solution:
      'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32 {\n    f(f(value))\n}',
    exampleCode:
      'fn twice<F: Fn(i32) -> i32>(value: i32, f: F) -> i32 {\n    f(f(value))\n}\n\nfn main() {\n    println!("{:?}", twice(3, |n| n + 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(twice(3, |n| n + 2), 7);\n    assert_eq!(twice(2, |n| n * 3), 18);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'fn-mut',
    title: 'Mutable closure captures',
    rule: 'FnMut permits a callable to mutate state captured by mutable borrow.',
    decision:
      'Declare the closure binding mutable when repeatedly invoking its mutable capture.',
    badRule: [
      'FnMut requires consuming captured values on every call.',
      'A mutation-capable closure is always a plain function pointer.',
    ],
    badDecision: [
      'Call a mutable-capturing closure through an immutable binding.',
      'Create overlapping mutable captures and use both simultaneously.',
    ],
    signature: 'fn running_sum(values: &[i32]) -> i32',
    body: 'let mut total = 0; let mut add = |value| { total += value; }; for &value in values { add(value); } total',
    assertions:
      'assert_eq!(running_sum(&[2, -1, 4]), 5); assert_eq!(running_sum(&[]), 0);',
    call: 'running_sum(&[2, -1, 4])',
    output: '5',
    topic: 'closures',
    stage: 3,
    solution:
      'fn running_sum(values: &[i32]) -> i32 {\n    let mut total = 0;\n    let mut add = |value| {\n        total += value;\n    };\n    for &value in values {\n        add(value);\n    }\n    total\n}',
    exampleCode:
      'fn running_sum(values: &[i32]) -> i32 {\n    let mut total = 0;\n    let mut add = |value| {\n        total += value;\n    };\n    for &value in values {\n        add(value);\n    }\n    total\n}\n\nfn main() {\n    println!("{:?}", running_sum(&[2, -1, 4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(running_sum(&[2, -1, 4]), 5);\n    assert_eq!(running_sum(&[]), 0);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'fn-once',
    title: 'Consuming closure captures',
    rule: 'FnOnce supports a call that can move captured ownership out of the closure.',
    decision: 'Call a closure that returns its captured String only once.',
    badRule: [
      'FnOnce guarantees that a closure must be called exactly once.',
      'move means every captured value becomes Copy.',
    ],
    badDecision: [
      'Call a closure again after its non-Copy capture was returned.',
      'Borrow a local capture when returning it requires owned transfer.',
    ],
    signature: 'fn consume_text(text: String) -> String',
    body: 'let take = move || text; take()',
    assertions:
      'assert_eq!(consume_text("owned".into()), "owned"); assert_eq!(consume_text(String::new()), "");',
    call: 'consume_text("owned".into())',
    output: '"owned"',
    topic: 'closures',
    stage: 4,
    solution:
      'fn consume_text(text: String) -> String {\n    let take = move || text;\n    take()\n}',
    exampleCode:
      'fn consume_text(text: String) -> String {\n    let take = move || text;\n    take()\n}\n\nfn main() {\n    println!("{:?}", consume_text("owned".into()));\n}',
    testCode:
      'fn main() {\n    assert_eq!(consume_text("owned".into()), "owned");\n    assert_eq!(consume_text(String::new()), "");\n}',
    outputDistractors: ['owned', '""'],
  },
  {
    slug: 'iterator-lazy',
    title: 'Lazy iterator adapters',
    rule: 'Iterator adapters describe work that runs when the iterator is consumed.',
    decision: 'Use a consuming method such as sum to evaluate the pipeline.',
    badRule: [
      'map immediately visits every element before consumption.',
      'An iterator can never be consumed after map.',
    ],
    badDecision: [
      'Expect an unconsumed map to perform every side effect.',
      'Forget to consume the iterator while returning its computed total.',
    ],
    signature: 'fn squares_total(values: &[i32]) -> i32',
    body: 'values.iter().map(|n| n * n).sum()',
    assertions:
      'assert_eq!(squares_total(&[2, 3]), 13); assert_eq!(squares_total(&[]), 0);',
    call: 'squares_total(&[2, 3])',
    output: '13',
    topic: 'iterators',
    stage: 1,
    solution:
      'fn squares_total(values: &[i32]) -> i32 {\n    values.iter().map(|n| n * n).sum()\n}',
    exampleCode:
      'fn squares_total(values: &[i32]) -> i32 {\n    values.iter().map(|n| n * n).sum()\n}\n\nfn main() {\n    println!("{:?}", squares_total(&[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(squares_total(&[2, 3]), 13);\n    assert_eq!(squares_total(&[]), 0);\n}',
    outputDistractors: ['14', '12'],
  },
  {
    slug: 'map-filter',
    title: 'Map and filter in order',
    rule: 'filter selects elements while map transforms each surviving element.',
    decision:
      'Filter before mapping when the predicate applies to the original value.',
    badRule: [
      'filter changes an element into its predicate bool.',
      'Pipeline ordering never changes semantics.',
    ],
    badDecision: [
      'Map first and use a predicate intended for original values without adjusting it.',
      'Use map to remove unwanted elements without an optional flattening step.',
    ],
    signature: 'fn positive_doubles(values: &[i32]) -> Vec<i32>',
    body: 'values.iter().copied().filter(|n| *n > 0).map(|n| n * 2).collect()',
    assertions:
      'assert_eq!(positive_doubles(&[-1, 0, 2, 3]), vec![4, 6]); assert!(positive_doubles(&[]).is_empty());',
    call: 'positive_doubles(&[-1, 0, 2, 3])',
    output: '[4, 6]',
    topic: 'iterators',
    stage: 2,
    solution:
      'fn positive_doubles(values: &[i32]) -> Vec<i32> {\n    values\n        .iter()\n        .copied()\n        .filter(|n| *n > 0)\n        .map(|n| n * 2)\n        .collect()\n}',
    exampleCode:
      'fn positive_doubles(values: &[i32]) -> Vec<i32> {\n    values\n        .iter()\n        .copied()\n        .filter(|n| *n > 0)\n        .map(|n| n * 2)\n        .collect()\n}\n\nfn main() {\n    println!("{:?}", positive_doubles(&[-1, 0, 2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(positive_doubles(&[-1, 0, 2, 3]), vec![4, 6]);\n    assert!(positive_doubles(&[]).is_empty());\n}',
    outputDistractors: ['[]', '[5, 6]'],
  },
  {
    slug: 'fold',
    title: 'Fold an accumulator',
    rule: 'fold applies one update per element starting from an explicit initial accumulator.',
    decision:
      'Choose an initial value that also represents the empty sequence correctly.',
    badRule: [
      'fold skips the first element when an initial value is supplied.',
      'Every fold must accumulate into the element type.',
    ],
    badDecision: [
      'Start a product at zero and expect a nonzero result.',
      'Unwrap the first element to handle an empty input product.',
    ],
    signature: 'fn product(values: &[i32]) -> i32',
    body: 'values.iter().fold(1, |acc, n| acc * n)',
    assertions:
      'assert_eq!(product(&[2, 3, 4]), 24); assert_eq!(product(&[]), 1);',
    call: 'product(&[2, 3, 4])',
    output: '24',
    topic: 'iterators',
    stage: 3,
    solution:
      'fn product(values: &[i32]) -> i32 {\n    values.iter().fold(1, |acc, n| acc * n)\n}',
    exampleCode:
      'fn product(values: &[i32]) -> i32 {\n    values.iter().fold(1, |acc, n| acc * n)\n}\n\nfn main() {\n    println!("{:?}", product(&[2, 3, 4]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(product(&[2, 3, 4]), 24);\n    assert_eq!(product(&[]), 1);\n}',
    outputDistractors: ['25', '23'],
  },
  {
    slug: 'collect',
    title: 'Collect fallible iterators',
    rule: 'Collecting Result items into Result<Vec<T>,E> propagates an encountered error.',
    decision:
      'Declare the target collection type so Rust knows the desired aggregation.',
    badRule: [
      'collect discards every error automatically.',
      'collect can only create Vec and never Result.',
    ],
    badDecision: [
      'Filter out parse errors when the contract requires reporting them.',
      'Collect into Vec<Result<...>> when a single fallible result is required.',
    ],
    signature:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError>',
    body: 'values.iter().map(|s| s.parse::<i32>()).collect()',
    assertions:
      'assert_eq!(parse_all(&["2", "3"]).unwrap(), vec![2, 3]); assert!(parse_all(&["2", "bad"]).is_err()); assert_eq!(parse_all(&[]).unwrap(), Vec::<i32>::new());',
    call: 'parse_all(&["2", "3"])',
    output: 'Ok([2, 3])',
    topic: 'iterators',
    stage: 4,
    solution:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError> {\n    values.iter().map(|s| s.parse::<i32>()).collect()\n}',
    exampleCode:
      'fn parse_all(values: &[&str]) -> Result<Vec<i32>, std::num::ParseIntError> {\n    values.iter().map(|s| s.parse::<i32>()).collect()\n}\n\nfn main() {\n    println!("{:?}", parse_all(&["2", "3"]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parse_all(&["2", "3"]).unwrap(), vec![2, 3]);\n    assert!(parse_all(&["2", "bad"]).is_err());\n    assert_eq!(parse_all(&[]).unwrap(), Vec::<i32>::new());\n}',
    outputDistractors: ['Err("invalid")', '[2, 3]'],
  },
  {
    slug: 'module-privacy',
    title: 'Module visibility',
    rule: 'Items are private unless their visibility permits access from the caller.',
    decision: 'Expose a function with pub when its parent module must call it.',
    badRule: [
      'Every nested module item is public by default.',
      'A module name automatically exposes every field.',
    ],
    badDecision: [
      'Call a private sibling module function from outside its module.',
      'Make a struct public and assume all its fields become public.',
    ],
    signature: 'fn module_answer() -> u32',
    body: 'mod worker { pub fn answer() -> u32 { 42 } } worker::answer()',
    assertions: 'assert_eq!(module_answer(), 42);',
    call: 'module_answer()',
    output: '42',
    topic: 'modules',
    stage: 1,
    solution:
      'fn module_answer() -> u32 {\n    mod worker {\n        pub fn answer() -> u32 {\n            42\n        }\n    }\n    worker::answer()\n}',
    exampleCode:
      'fn module_answer() -> u32 {\n    mod worker {\n        pub fn answer() -> u32 {\n            42\n        }\n    }\n    worker::answer()\n}\n\nfn main() {\n    println!("{:?}", module_answer());\n}',
    testCode: 'fn main() {\n    assert_eq!(module_answer(), 42);\n}',
    outputDistractors: ['43', '41'],
  },
  {
    slug: 'use',
    title: 'Import paths with use',
    rule: 'use introduces a path under a local name without copying the underlying item.',
    decision:
      'Alias an imported item when a concise name helps avoid collisions.',
    badRule: [
      'use executes the imported function.',
      'use duplicates a type into a new incompatible type.',
    ],
    badDecision: [
      'Expect importing a private item to override its visibility.',
      'Use an alias without defining or importing it.',
    ],
    signature: 'fn imported_length(values: &[i32]) -> usize',
    body: 'use std::collections::VecDeque as Queue; let q: Queue<_> = values.iter().copied().collect(); q.len()',
    assertions:
      'assert_eq!(imported_length(&[1, 2]), 2); assert_eq!(imported_length(&[]), 0);',
    call: 'imported_length(&[1, 2])',
    output: '2',
    topic: 'modules',
    stage: 2,
    solution:
      'fn imported_length(values: &[i32]) -> usize {\n    use std::collections::VecDeque as Queue;\n    let q: Queue<_> = values.iter().copied().collect();\n    q.len()\n}',
    exampleCode:
      'fn imported_length(values: &[i32]) -> usize {\n    use std::collections::VecDeque as Queue;\n    let q: Queue<_> = values.iter().copied().collect();\n    q.len()\n}\n\nfn main() {\n    println!("{:?}", imported_length(&[1, 2]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(imported_length(&[1, 2]), 2);\n    assert_eq!(imported_length(&[]), 0);\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'reexport',
    title: 'Re-export a public API',
    rule: 'pub use exposes an accessible item through a new public path.',
    decision:
      'Keep implementation details inside a private module and export the supported function.',
    badRule: [
      'A re-export executes code during module loading.',
      'pub use makes every neighboring private item public.',
    ],
    badDecision: [
      'Re-export an item whose original visibility forbids it.',
      'Expose internal fields merely because one function is re-exported.',
    ],
    signature: 'fn facade_value() -> i32',
    body: 'mod api { mod detail { pub fn value() -> i32 { 7 } } pub use self::detail::value; } api::value()',
    assertions: 'assert_eq!(facade_value(), 7);',
    call: 'facade_value()',
    output: '7',
    topic: 'modules',
    stage: 3,
    solution:
      'fn facade_value() -> i32 {\n    mod api {\n        mod detail {\n            pub fn value() -> i32 {\n                7\n            }\n        }\n        pub use self::detail::value;\n    }\n    api::value()\n}',
    exampleCode:
      'fn facade_value() -> i32 {\n    mod api {\n        mod detail {\n            pub fn value() -> i32 {\n                7\n            }\n        }\n        pub use self::detail::value;\n    }\n    api::value()\n}\n\nfn main() {\n    println!("{:?}", facade_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(facade_value(), 7);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'module-paths',
    title: 'Relative module paths',
    rule: 'super refers to the parent module and self refers to the current module.',
    decision: 'Use super to read an accessible item in the parent module.',
    badRule: [
      'super refers to the first external dependency.',
      'self in a path always means the method receiver.',
    ],
    badDecision: [
      'Use a sibling path as though it were a child path.',
      'Assume a module can read every private descendant item.',
    ],
    signature: 'fn parent_value() -> i32',
    body: 'mod outer { const BASE: i32 = 6; pub mod inner { pub fn value() -> i32 { super::BASE + 1 } } } outer::inner::value()',
    assertions: 'assert_eq!(parent_value(), 7);',
    call: 'parent_value()',
    output: '7',
    topic: 'modules',
    stage: 4,
    solution:
      'fn parent_value() -> i32 {\n    mod outer {\n        const BASE: i32 = 6;\n        pub mod inner {\n            pub fn value() -> i32 {\n                super::BASE + 1\n            }\n        }\n    }\n    outer::inner::value()\n}',
    exampleCode:
      'fn parent_value() -> i32 {\n    mod outer {\n        const BASE: i32 = 6;\n        pub mod inner {\n            pub fn value() -> i32 {\n                super::BASE + 1\n            }\n        }\n    }\n    outer::inner::value()\n}\n\nfn main() {\n    println!("{:?}", parent_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(parent_value(), 7);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'package-name',
    title: 'Package names and crates',
    rule: 'Cargo package metadata identifies a package while its Rust crate path uses an identifier-compatible name.',
    decision:
      'Normalize a package dash to an underscore when deriving its default crate identifier.',
    badRule: [
      'Cargo packages can never contain dashes.',
      'A package name automatically becomes a runtime global variable.',
    ],
    badDecision: [
      'Treat a dashed package name as a Rust path with subtraction.',
      'Assume package and module names are always byte-for-byte identical.',
    ],
    signature: 'fn crate_identifier(package: &str) -> String',
    body: 'package.replace(\'-\', "_")',
    assertions:
      'assert_eq!(crate_identifier("my-tool"), "my_tool"); assert_eq!(crate_identifier("core"), "core");',
    call: 'crate_identifier("my-tool")',
    output: '"my_tool"',
    topic: 'cargo',
    stage: 1,
    solution:
      'fn crate_identifier(package: &str) -> String {\n    package.replace(\'-\', "_")\n}',
    exampleCode:
      'fn crate_identifier(package: &str) -> String {\n    package.replace(\'-\', "_")\n}\n\nfn main() {\n    println!("{:?}", crate_identifier("my-tool"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(crate_identifier("my-tool"), "my_tool");\n    assert_eq!(crate_identifier("core"), "core");\n}',
    outputDistractors: ['my_tool', '""'],
  },
  {
    slug: 'semver',
    title: 'Semantic version components',
    rule: 'A basic semantic version contains major, minor, and patch integer components.',
    decision:
      'Reject malformed component counts rather than silently truncating them.',
    badRule: [
      'Version components are compared only as text strings.',
      'Every version with a larger patch changes its major component.',
    ],
    badDecision: [
      'Accept two components as a complete three-component version.',
      'Ignore an unparsable numeric component and return zero.',
    ],
    signature: 'fn version_parts(text: &str) -> Option<(u32, u32, u32)>',
    body: "let mut parts = text.split('.'); let major = parts.next()?.parse().ok()?; let minor = parts.next()?.parse().ok()?; let patch = parts.next()?.parse().ok()?; if parts.next().is_some() { return None; } Some((major, minor, patch))",
    assertions:
      'assert_eq!(version_parts("1.2.3"), Some((1, 2, 3))); assert_eq!(version_parts("1.2"), None); assert_eq!(version_parts("a.2.3"), None); assert_eq!(version_parts("1.2.3.4"), None);',
    call: 'version_parts("1.2.3")',
    output: 'Some((1, 2, 3))',
    topic: 'cargo',
    stage: 2,
    solution:
      "fn version_parts(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split('.');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}",
    exampleCode:
      'fn version_parts(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split(\'.\');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}\n\nfn main() {\n    println!("{:?}", version_parts("1.2.3"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(version_parts("1.2.3"), Some((1, 2, 3)));\n    assert_eq!(version_parts("1.2"), None);\n    assert_eq!(version_parts("a.2.3"), None);\n    assert_eq!(version_parts("1.2.3.4"), None);\n}',
    outputDistractors: ['None', '(1, 2, 3)'],
  },
  {
    slug: 'cfg',
    title: 'Conditional compilation',
    rule: 'cfg attributes decide whether an item is compiled rather than choosing a runtime branch.',
    decision:
      'Make mutually exclusive definitions available under complementary cfg predicates.',
    badRule: [
      'cfg dynamically switches a compiled function during execution.',
      'Excluded cfg items still execute before main.',
    ],
    badDecision: [
      'Call an excluded item without supplying an included alternative.',
      'Expect changing a runtime variable to alter a cfg attribute.',
    ],
    signature: 'fn build_value() -> u32',
    body: '#[cfg(all())] fn selected() -> u32 { 7 } #[cfg(any())] fn selected() -> u32 { 99 } selected()',
    assertions: 'assert_eq!(build_value(), 7);',
    call: 'build_value()',
    output: '7',
    topic: 'cargo',
    stage: 3,
    solution:
      'fn build_value() -> u32 {\n    #[cfg(all())]\n    fn selected() -> u32 {\n        7\n    }\n    #[cfg(any())]\n    fn selected() -> u32 {\n        99\n    }\n    selected()\n}',
    exampleCode:
      'fn build_value() -> u32 {\n    #[cfg(all())]\n    fn selected() -> u32 {\n        7\n    }\n    #[cfg(any())]\n    fn selected() -> u32 {\n        99\n    }\n    selected()\n}\n\nfn main() {\n    println!("{:?}", build_value());\n}',
    testCode: 'fn main() {\n    assert_eq!(build_value(), 7);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'test-contract',
    title: 'Testable library behavior',
    rule: 'Cargo test discovers tests while a reusable function can be checked independently of an executable entry point.',
    decision:
      'Separate calculation from output so assertions can compare a returned value.',
    badRule: [
      'A function must print its result to be testable.',
      'Tests require modifying production arguments globally.',
    ],
    badDecision: [
      'Hide all logic inside main and return no inspectable value.',
      'Treat a successful compilation as proof of every input result.',
    ],
    signature: 'fn checked_total(values: &[u32]) -> Option<u32>',
    body: 'values.iter().try_fold(0u32, |total, value| total.checked_add(*value))',
    assertions:
      'assert_eq!(checked_total(&[2, 3]), Some(5)); assert_eq!(checked_total(&[]), Some(0)); assert_eq!(checked_total(&[u32::MAX, 1]), None);',
    call: 'checked_total(&[2, 3])',
    output: 'Some(5)',
    topic: 'cargo',
    stage: 4,
    solution:
      'fn checked_total(values: &[u32]) -> Option<u32> {\n    values\n        .iter()\n        .try_fold(0u32, |total, value| total.checked_add(*value))\n}',
    exampleCode:
      'fn checked_total(values: &[u32]) -> Option<u32> {\n    values\n        .iter()\n        .try_fold(0u32, |total, value| total.checked_add(*value))\n}\n\nfn main() {\n    println!("{:?}", checked_total(&[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(checked_total(&[2, 3]), Some(5));\n    assert_eq!(checked_total(&[]), Some(0));\n    assert_eq!(checked_total(&[u32::MAX, 1]), None);\n}',
    outputDistractors: ['None', '5'],
  },
  {
    slug: 'boundary-tests',
    title: 'Boundary-oriented contracts',
    rule: 'Boundary tests exercise values at and just outside a contract limit.',
    decision:
      'Check equality with the capacity limit separately from an oversized request.',
    badRule: [
      'A typical input proves every boundary condition.',
      'Boundary cases only matter for floating point code.',
    ],
    badDecision: [
      'Use a strict less-than check for an inclusive capacity.',
      'Add capacity and request before comparing and risk overflow.',
    ],
    signature: 'fn fits(used: usize, extra: usize, capacity: usize) -> bool',
    body: 'used.checked_add(extra).is_some_and(|total| total <= capacity)',
    assertions:
      'assert!(fits(3, 2, 5)); assert!(!fits(3, 3, 5)); assert!(!fits(usize::MAX, 1, usize::MAX)); assert!(fits(0, 0, 0));',
    call: 'fits(3, 2, 5)',
    output: 'true',
    topic: 'testing',
    stage: 1,
    solution:
      'fn fits(used: usize, extra: usize, capacity: usize) -> bool {\n    used.checked_add(extra)\n        .is_some_and(|total| total <= capacity)\n}',
    exampleCode:
      'fn fits(used: usize, extra: usize, capacity: usize) -> bool {\n    used.checked_add(extra)\n        .is_some_and(|total| total <= capacity)\n}\n\nfn main() {\n    println!("{:?}", fits(3, 2, 5));\n}',
    testCode:
      'fn main() {\n    assert!(fits(3, 2, 5));\n    assert!(!fits(3, 3, 5));\n    assert!(!fits(usize::MAX, 1, usize::MAX));\n    assert!(fits(0, 0, 0));\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'table-tests',
    title: 'Table-driven examples',
    rule: 'A table-driven test checks several input-output cases with the same assertion logic.',
    decision:
      'Define behavior for zero and negative inputs rather than testing only positives.',
    badRule: [
      'Each table entry changes the tested implementation.',
      'Only the first table entry is evaluated.',
    ],
    badDecision: [
      'Skip a failing case because another case passed.',
      'Mutate expected results to match the implementation output.',
    ],
    signature: 'fn clamp_small(n: i32) -> i32',
    body: 'n.clamp(-2, 2)',
    assertions:
      'for (input, expected) in [(-9, -2), (-2, -2), (0, 0), (2, 2), (9, 2)] { assert_eq!(clamp_small(input), expected); }',
    call: 'clamp_small(9)',
    output: '2',
    topic: 'testing',
    stage: 2,
    solution: 'fn clamp_small(n: i32) -> i32 {\n    n.clamp(-2, 2)\n}',
    exampleCode:
      'fn clamp_small(n: i32) -> i32 {\n    n.clamp(-2, 2)\n}\n\nfn main() {\n    println!("{:?}", clamp_small(9));\n}',
    testCode:
      'fn main() {\n    for (input, expected) in [(-9, -2), (-2, -2), (0, 0), (2, 2), (9, 2)] {\n        assert_eq!(clamp_small(input), expected);\n    }\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'invariants',
    title: 'Test algebraic invariants',
    rule: 'An invariant states a relationship that should hold for a family of inputs.',
    decision:
      'Check round-trip behavior as well as concrete representative cases.',
    badRule: [
      'An invariant is a single hard-coded output example.',
      'Passing a few random cases proves all possible inputs.',
    ],
    badDecision: [
      'Claim exhaustive proof from a finite sample alone.',
      'Check only the transformed length while ignoring content.',
    ],
    signature: 'fn reverse_copy(values: &[i32]) -> Vec<i32>',
    body: 'values.iter().rev().copied().collect()',
    assertions:
      'assert_eq!(reverse_copy(&[1, 2, 3]), vec![3, 2, 1]); for n in 0..20 { let input: Vec<_> = (0..n).collect(); assert_eq!(reverse_copy(&reverse_copy(&input)), input); }',
    call: 'reverse_copy(&[1, 2, 3])',
    output: '[3, 2, 1]',
    topic: 'testing',
    stage: 3,
    solution:
      'fn reverse_copy(values: &[i32]) -> Vec<i32> {\n    values.iter().rev().copied().collect()\n}',
    exampleCode:
      'fn reverse_copy(values: &[i32]) -> Vec<i32> {\n    values.iter().rev().copied().collect()\n}\n\nfn main() {\n    println!("{:?}", reverse_copy(&[1, 2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(reverse_copy(&[1, 2, 3]), vec![3, 2, 1]);\n    for n in 0..20 {\n        let input: Vec<_> = (0..n).collect();\n        assert_eq!(reverse_copy(&reverse_copy(&input)), input);\n    }\n}',
    outputDistractors: ['[]', '[4, 2, 1]'],
  },
  {
    slug: 'panic-contracts',
    title: 'Avoid unexpected panics',
    rule: 'A checked API can report invalid input instead of panicking.',
    decision:
      'Validate a divisor with checked_div when zero and overflow are possible.',
    badRule: [
      'Every integer division input is safe.',
      'A caught panic always repairs mutated program state.',
    ],
    badDecision: [
      'Test only a nonzero divisor and assume zero is safe.',
      'Catch a panic as a substitute for a defined result contract.',
    ],
    signature: 'fn safe_quotient(a: i32, b: i32) -> Option<i32>',
    body: 'a.checked_div(b)',
    assertions:
      'assert_eq!(safe_quotient(8, 2), Some(4)); assert_eq!(safe_quotient(8, 0), None); assert_eq!(safe_quotient(i32::MIN, -1), None);',
    call: 'safe_quotient(8, 0)',
    output: 'None',
    topic: 'testing',
    stage: 4,
    solution:
      'fn safe_quotient(a: i32, b: i32) -> Option<i32> {\n    a.checked_div(b)\n}',
    exampleCode:
      'fn safe_quotient(a: i32, b: i32) -> Option<i32> {\n    a.checked_div(b)\n}\n\nfn main() {\n    println!("{:?}", safe_quotient(8, 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(safe_quotient(8, 2), Some(4));\n    assert_eq!(safe_quotient(8, 0), None);\n    assert_eq!(safe_quotient(i32::MIN, -1), None);\n}',
    outputDistractors: ['Some(0)', '0'],
  },
  {
    slug: 'box',
    title: 'Box heap ownership',
    rule: 'Box owns a heap allocation with one owning pointer.',
    decision: 'Dereference a Box to access its stored value.',
    badRule: [
      'Box automatically shares ownership among all pointers.',
      'Dropping Box never drops its stored value.',
    ],
    badDecision: [
      'Use Rc behavior such as strong_count on a Box.',
      'Keep a reference to boxed storage after its last owner drops.',
    ],
    signature: 'fn boxed_increment(n: i32) -> i32',
    body: 'let mut owned = Box::new(n); *owned += 1; *owned',
    assertions:
      'assert_eq!(boxed_increment(4), 5); assert_eq!(boxed_increment(-1), 0);',
    call: 'boxed_increment(4)',
    output: '5',
    topic: 'smart-pointers',
    stage: 1,
    solution:
      'fn boxed_increment(n: i32) -> i32 {\n    let mut owned = Box::new(n);\n    *owned += 1;\n    *owned\n}',
    exampleCode:
      'fn boxed_increment(n: i32) -> i32 {\n    let mut owned = Box::new(n);\n    *owned += 1;\n    *owned\n}\n\nfn main() {\n    println!("{:?}", boxed_increment(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(boxed_increment(4), 5);\n    assert_eq!(boxed_increment(-1), 0);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'rc',
    title: 'Reference-counted ownership',
    rule: 'Rc shares ownership within one thread using a reference count.',
    decision:
      'Clone the Rc pointer to add an owner without cloning its payload.',
    badRule: [
      'Rc clone always deep-copies its payload.',
      'Rc is the standard thread-safe shared pointer.',
    ],
    badDecision: [
      'Use Rc for unrestricted cross-thread transfer.',
      'Interpret strong_count as the number of payload elements.',
    ],
    signature: 'fn rc_owners() -> usize',
    body: 'let first = std::rc::Rc::new(String::from("data")); let second = std::rc::Rc::clone(&first); let count = std::rc::Rc::strong_count(&second); count',
    assertions: 'assert_eq!(rc_owners(), 2);',
    call: 'rc_owners()',
    output: '2',
    topic: 'smart-pointers',
    stage: 2,
    solution:
      'fn rc_owners() -> usize {\n    let first = std::rc::Rc::new(String::from("data"));\n    let second = std::rc::Rc::clone(&first);\n    let count = std::rc::Rc::strong_count(&second);\n    count\n}',
    exampleCode:
      'fn rc_owners() -> usize {\n    let first = std::rc::Rc::new(String::from("data"));\n    let second = std::rc::Rc::clone(&first);\n    let count = std::rc::Rc::strong_count(&second);\n    count\n}\n\nfn main() {\n    println!("{:?}", rc_owners());\n}',
    testCode: 'fn main() {\n    assert_eq!(rc_owners(), 2);\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'arc',
    title: 'Atomic reference counts',
    rule: 'Arc uses an atomic ownership count suitable for sharing ownership across threads.',
    decision:
      'Remember that Arc alone does not grant mutable access to an ordinary shared payload.',
    badRule: [
      'Arc makes every payload internally mutable.',
      'Arc cannot be cloned within one thread.',
    ],
    badDecision: [
      'Write through Arc<i32> without a synchronization or interior-mutability mechanism.',
      'Assume Arc makes a non-Sync payload Sync automatically.',
    ],
    signature: 'fn arc_owners() -> usize',
    body: 'let first = std::sync::Arc::new(7); let second = std::sync::Arc::clone(&first); std::sync::Arc::strong_count(&second)',
    assertions: 'assert_eq!(arc_owners(), 2);',
    call: 'arc_owners()',
    output: '2',
    topic: 'smart-pointers',
    stage: 3,
    solution:
      'fn arc_owners() -> usize {\n    let first = std::sync::Arc::new(7);\n    let second = std::sync::Arc::clone(&first);\n    std::sync::Arc::strong_count(&second)\n}',
    exampleCode:
      'fn arc_owners() -> usize {\n    let first = std::sync::Arc::new(7);\n    let second = std::sync::Arc::clone(&first);\n    std::sync::Arc::strong_count(&second)\n}\n\nfn main() {\n    println!("{:?}", arc_owners());\n}',
    testCode: 'fn main() {\n    assert_eq!(arc_owners(), 2);\n}',
    outputDistractors: ['3', '1'],
  },
  {
    slug: 'weak',
    title: 'Weak references',
    rule: 'A Weak pointer does not keep its payload alive and upgrade can fail after strong owners disappear.',
    decision: 'Check upgrade before accessing a weakly referenced payload.',
    badRule: [
      'Weak contributes to the strong owner count.',
      'Weak keeps the payload alive indefinitely.',
    ],
    badDecision: [
      'Unwrap upgrade after all strong owners have dropped.',
      'Create an Rc cycle of strong pointers when a nonowning back-reference is sufficient.',
    ],
    signature: 'fn weak_expires() -> bool',
    body: 'let strong = std::rc::Rc::new(7); let weak = std::rc::Rc::downgrade(&strong); assert!(weak.upgrade().is_some()); drop(strong); weak.upgrade().is_none()',
    assertions: 'assert!(weak_expires());',
    call: 'weak_expires()',
    output: 'true',
    topic: 'smart-pointers',
    stage: 4,
    solution:
      'fn weak_expires() -> bool {\n    let strong = std::rc::Rc::new(7);\n    let weak = std::rc::Rc::downgrade(&strong);\n    assert!(weak.upgrade().is_some());\n    drop(strong);\n    weak.upgrade().is_none()\n}',
    exampleCode:
      'fn weak_expires() -> bool {\n    let strong = std::rc::Rc::new(7);\n    let weak = std::rc::Rc::downgrade(&strong);\n    assert!(weak.upgrade().is_some());\n    drop(strong);\n    weak.upgrade().is_none()\n}\n\nfn main() {\n    println!("{:?}", weak_expires());\n}',
    testCode: 'fn main() {\n    assert!(weak_expires());\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'cell',
    title: 'Cell replacement',
    rule: 'Cell permits interior mutation by moving or copying values rather than exposing borrowed references.',
    decision:
      'Use get and set for a Copy payload behind a shared Cell reference.',
    badRule: [
      'Cell grants long-lived shared references to its mutable contents.',
      'Cell is a cross-thread atomic primitive.',
    ],
    badDecision: [
      'Assume Cell<i32> is Sync for shared cross-thread use.',
      'Expect modifying a copied get result to update the Cell automatically.',
    ],
    signature: 'fn cell_add(n: i32) -> i32',
    body: 'let value = std::cell::Cell::new(n); let shared = &value; shared.set(shared.get() + 1); shared.get()',
    assertions: 'assert_eq!(cell_add(3), 4); assert_eq!(cell_add(-1), 0);',
    call: 'cell_add(3)',
    output: '4',
    topic: 'interior-mutability',
    stage: 1,
    solution:
      'fn cell_add(n: i32) -> i32 {\n    let value = std::cell::Cell::new(n);\n    let shared = &value;\n    shared.set(shared.get() + 1);\n    shared.get()\n}',
    exampleCode:
      'fn cell_add(n: i32) -> i32 {\n    let value = std::cell::Cell::new(n);\n    let shared = &value;\n    shared.set(shared.get() + 1);\n    shared.get()\n}\n\nfn main() {\n    println!("{:?}", cell_add(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(cell_add(3), 4);\n    assert_eq!(cell_add(-1), 0);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'refcell',
    title: 'Runtime checked borrowing',
    rule: 'RefCell checks shared and exclusive borrow rules at runtime.',
    decision:
      'Drop the mutable borrow guard before requesting another overlapping borrow.',
    badRule: [
      'RefCell removes all borrowing rules.',
      'RefCell borrow conflicts are always compile-time errors.',
    ],
    badDecision: [
      'Hold a borrow_mut guard while borrowing the same cell again.',
      'Return a reference after its RefCell guard has dropped.',
    ],
    signature: 'fn refcell_append() -> Vec<i32>',
    body: 'let cell = std::cell::RefCell::new(vec![1]); { cell.borrow_mut().push(2); } let result = cell.borrow().clone(); result',
    assertions: 'assert_eq!(refcell_append(), vec![1, 2]);',
    call: 'refcell_append()',
    output: '[1, 2]',
    topic: 'interior-mutability',
    stage: 2,
    solution:
      'fn refcell_append() -> Vec<i32> {\n    let cell = std::cell::RefCell::new(vec![1]);\n    {\n        cell.borrow_mut().push(2);\n    }\n    let result = cell.borrow().clone();\n    result\n}',
    exampleCode:
      'fn refcell_append() -> Vec<i32> {\n    let cell = std::cell::RefCell::new(vec![1]);\n    {\n        cell.borrow_mut().push(2);\n    }\n    let result = cell.borrow().clone();\n    result\n}\n\nfn main() {\n    println!("{:?}", refcell_append());\n}',
    testCode: 'fn main() {\n    assert_eq!(refcell_append(), vec![1, 2]);\n}',
    outputDistractors: ['[]', '[2, 2]'],
  },
  {
    slug: 'try-borrow',
    title: 'Fallible borrow attempts',
    rule: 'try_borrow returns an error when an active exclusive borrow prevents shared access.',
    decision:
      'Use a fallible borrow when a conflict belongs in normal control flow.',
    badRule: [
      'try_borrow always panics on a conflict.',
      'A failed borrow destroys the RefCell contents.',
    ],
    badDecision: [
      'Call borrow and expect Result instead of a possible panic.',
      'Assume a failed try_borrow grants partial access to the value.',
    ],
    signature: 'fn borrow_conflict() -> bool',
    body: 'let cell = std::cell::RefCell::new(1); let guard = cell.borrow_mut(); let blocked = cell.try_borrow().is_err(); drop(guard); blocked && cell.try_borrow().is_ok()',
    assertions: 'assert!(borrow_conflict());',
    call: 'borrow_conflict()',
    output: 'true',
    topic: 'interior-mutability',
    stage: 3,
    solution:
      'fn borrow_conflict() -> bool {\n    let cell = std::cell::RefCell::new(1);\n    let guard = cell.borrow_mut();\n    let blocked = cell.try_borrow().is_err();\n    drop(guard);\n    blocked && cell.try_borrow().is_ok()\n}',
    exampleCode:
      'fn borrow_conflict() -> bool {\n    let cell = std::cell::RefCell::new(1);\n    let guard = cell.borrow_mut();\n    let blocked = cell.try_borrow().is_err();\n    drop(guard);\n    blocked && cell.try_borrow().is_ok()\n}\n\nfn main() {\n    println!("{:?}", borrow_conflict());\n}',
    testCode: 'fn main() {\n    assert!(borrow_conflict());\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'cow',
    title: 'Clone only on mutation',
    rule: 'Cow can hold either borrowed data or owned data and to_mut creates ownership when needed.',
    decision: 'Retain a borrowed value when no content change is needed.',
    badRule: [
      'Cow always clones its input during construction.',
      'Cow permits mutating the original borrowed str.',
    ],
    badDecision: [
      'Allocate unconditionally even on the unchanged fast path.',
      'Return a mutable str reference to immutable borrowed bytes.',
    ],
    signature: "fn clean_spaces(text: &str) -> std::borrow::Cow<'_, str>",
    body: "if text.contains(' ') { std::borrow::Cow::Owned(text.replace(' ', \"_\")) } else { std::borrow::Cow::Borrowed(text) }",
    assertions:
      'assert!(matches!(clean_spaces("rust"), std::borrow::Cow::Borrowed(_))); assert_eq!(clean_spaces("a b"), "a_b");',
    call: 'clean_spaces("a b")',
    output: '"a_b"',
    topic: 'interior-mutability',
    stage: 4,
    solution:
      "fn clean_spaces(text: &str) -> std::borrow::Cow<'_, str> {\n    if text.contains(' ') {\n        std::borrow::Cow::Owned(text.replace(' ', \"_\"))\n    } else {\n        std::borrow::Cow::Borrowed(text)\n    }\n}",
    exampleCode:
      'fn clean_spaces(text: &str) -> std::borrow::Cow<\'_, str> {\n    if text.contains(\' \') {\n        std::borrow::Cow::Owned(text.replace(\' \', "_"))\n    } else {\n        std::borrow::Cow::Borrowed(text)\n    }\n}\n\nfn main() {\n    println!("{:?}", clean_spaces("a b"));\n}',
    testCode:
      'fn main() {\n    assert!(matches!(\n        clean_spaces("rust"),\n        std::borrow::Cow::Borrowed(_)\n    ));\n    assert_eq!(clean_spaces("a b"), "a_b");\n}',
    outputDistractors: ['a_b', '""'],
  },
  {
    slug: 'thread-move',
    title: 'Move ownership into a thread',
    rule: 'A move closure can transfer owned input into a spawned thread.',
    decision: 'Join the thread to obtain its result and wait for completion.',
    badRule: [
      'spawn automatically borrows any local value for as long as needed.',
      'Dropping a JoinHandle always waits for completion.',
    ],
    badDecision: [
      'Borrow local nonstatic storage into an unscoped spawned thread.',
      'Read a moved String from the parent after transferring it.',
    ],
    signature: 'fn thread_length(text: String) -> usize',
    body: 'std::thread::spawn(move || text.len()).join().unwrap()',
    assertions:
      'assert_eq!(thread_length("rust".into()), 4); assert_eq!(thread_length(String::new()), 0);',
    call: 'thread_length("rust".into())',
    output: '4',
    topic: 'concurrency',
    stage: 1,
    solution:
      'fn thread_length(text: String) -> usize {\n    std::thread::spawn(move || text.len()).join().unwrap()\n}',
    exampleCode:
      'fn thread_length(text: String) -> usize {\n    std::thread::spawn(move || text.len()).join().unwrap()\n}\n\nfn main() {\n    println!("{:?}", thread_length("rust".into()));\n}',
    testCode:
      'fn main() {\n    assert_eq!(thread_length("rust".into()), 4);\n    assert_eq!(thread_length(String::new()), 0);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'scoped-threads',
    title: 'Scoped thread borrows',
    rule: 'Scoped threads may borrow local data because the scope waits for them to finish.',
    decision:
      'Join a scoped handle before combining its borrowed-input result.',
    badRule: [
      'Scoped threads can outlive the enclosing scope.',
      'A scope converts every borrow into static.',
    ],
    badDecision: [
      'Return a running scoped handle beyond the scope lifetime.',
      'Mutate borrowed data concurrently with a shared scoped read.',
    ],
    signature: 'fn scoped_sum(values: &[i32]) -> i32',
    body: 'std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())',
    assertions:
      'assert_eq!(scoped_sum(&[2, 3]), 5); assert_eq!(scoped_sum(&[]), 0);',
    call: 'scoped_sum(&[2, 3])',
    output: '5',
    topic: 'concurrency',
    stage: 2,
    solution:
      'fn scoped_sum(values: &[i32]) -> i32 {\n    std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())\n}',
    exampleCode:
      'fn scoped_sum(values: &[i32]) -> i32 {\n    std::thread::scope(|scope| scope.spawn(|| values.iter().sum()).join().unwrap())\n}\n\nfn main() {\n    println!("{:?}", scoped_sum(&[2, 3]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(scoped_sum(&[2, 3]), 5);\n    assert_eq!(scoped_sum(&[]), 0);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'mutex',
    title: 'Mutex-protected state',
    rule: 'A mutex grants exclusive access through a lock guard.',
    decision:
      'Release the guard before waiting for another thread that needs the same lock.',
    badRule: [
      'Mutex protects data without acquiring a lock.',
      'Mutex makes a lock guard permanently valid after unlocking.',
    ],
    badDecision: [
      'Hold the mutex while joining a worker that must acquire it.',
      'Read the protected payload by dereferencing Arc directly.',
    ],
    signature: 'fn worker_increment(n: i32) -> i32',
    body: 'let shared = std::sync::Arc::new(std::sync::Mutex::new(n)); let other = std::sync::Arc::clone(&shared); std::thread::spawn(move || { *other.lock().unwrap() += 1; }).join().unwrap(); let result = *shared.lock().unwrap(); result',
    assertions:
      'assert_eq!(worker_increment(3), 4); assert_eq!(worker_increment(-1), 0);',
    call: 'worker_increment(3)',
    output: '4',
    topic: 'concurrency',
    stage: 3,
    solution:
      'fn worker_increment(n: i32) -> i32 {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(n));\n    let other = std::sync::Arc::clone(&shared);\n    std::thread::spawn(move || {\n        *other.lock().unwrap() += 1;\n    })\n    .join()\n    .unwrap();\n    let result = *shared.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn worker_increment(n: i32) -> i32 {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(n));\n    let other = std::sync::Arc::clone(&shared);\n    std::thread::spawn(move || {\n        *other.lock().unwrap() += 1;\n    })\n    .join()\n    .unwrap();\n    let result = *shared.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", worker_increment(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(worker_increment(3), 4);\n    assert_eq!(worker_increment(-1), 0);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'channels',
    title: 'Transfer messages through channels',
    rule: 'An mpsc channel transfers owned messages from senders to one receiver.',
    decision:
      'Receive the sent message and join the producer without relying on thread timing.',
    badRule: [
      'Receiving a message borrows it from the sender stack.',
      'A receiver always gets a default value if no message was sent.',
    ],
    badDecision: [
      'Join a blocked producer while refusing to consume a full synchronous channel.',
      'Depend on sleeps to prove a message arrived.',
    ],
    signature: 'fn channel_value(n: i32) -> i32',
    body: 'let (sender, receiver) = std::sync::mpsc::channel(); let handle = std::thread::spawn(move || sender.send(n).unwrap()); let value = receiver.recv().unwrap(); handle.join().unwrap(); value',
    assertions:
      'assert_eq!(channel_value(7), 7); assert_eq!(channel_value(-2), -2);',
    call: 'channel_value(7)',
    output: '7',
    topic: 'concurrency',
    stage: 4,
    solution:
      'fn channel_value(n: i32) -> i32 {\n    let (sender, receiver) = std::sync::mpsc::channel();\n    let handle = std::thread::spawn(move || sender.send(n).unwrap());\n    let value = receiver.recv().unwrap();\n    handle.join().unwrap();\n    value\n}',
    exampleCode:
      'fn channel_value(n: i32) -> i32 {\n    let (sender, receiver) = std::sync::mpsc::channel();\n    let handle = std::thread::spawn(move || sender.send(n).unwrap());\n    let value = receiver.recv().unwrap();\n    handle.join().unwrap();\n    value\n}\n\nfn main() {\n    println!("{:?}", channel_value(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(channel_value(7), 7);\n    assert_eq!(channel_value(-2), -2);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'atomic-load-store',
    title: 'Atomic loads and stores',
    rule: 'Atomic integer loads and stores access one value without a data race.',
    decision:
      'Use Relaxed only when this counter does not publish access to other memory.',
    badRule: [
      'Relaxed means non-atomic access.',
      'Any atomic store automatically orders all unrelated memory.',
    ],
    badDecision: [
      'Use an ordinary shared mutable integer without synchronization.',
      'Pass Release as a load ordering.',
    ],
    signature: 'fn atomic_replaced(n: u32) -> u32',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(0); value.store(n, Ordering::Relaxed); value.load(Ordering::Relaxed)',
    assertions:
      'assert_eq!(atomic_replaced(7), 7); assert_eq!(atomic_replaced(0), 0);',
    call: 'atomic_replaced(7)',
    output: '7',
    topic: 'atomics',
    stage: 1,
    solution:
      'fn atomic_replaced(n: u32) -> u32 {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(0);\n    value.store(n, Ordering::Relaxed);\n    value.load(Ordering::Relaxed)\n}',
    exampleCode:
      'fn atomic_replaced(n: u32) -> u32 {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(0);\n    value.store(n, Ordering::Relaxed);\n    value.load(Ordering::Relaxed)\n}\n\nfn main() {\n    println!("{:?}", atomic_replaced(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(atomic_replaced(7), 7);\n    assert_eq!(atomic_replaced(0), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'atomic-fetch',
    title: 'Atomic read-modify-write',
    rule: 'fetch_add performs one atomic update and returns the previous value.',
    decision: 'Distinguish the returned old value from the stored new value.',
    badRule: [
      'fetch_add always returns the new value.',
      'fetch_add is a separate unsynchronized load followed by store.',
    ],
    badDecision: [
      'Add again to the old value and claim it was the pre-update count.',
      'Assume a load-plus-store sequence is equivalent to an atomic increment under contention.',
    ],
    signature: 'fn atomic_increment(n: u32) -> (u32, u32)',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(n); let previous = value.fetch_add(1, Ordering::Relaxed); (previous, value.load(Ordering::Relaxed))',
    assertions:
      'assert_eq!(atomic_increment(4), (4, 5)); assert_eq!(atomic_increment(0), (0, 1));',
    call: 'atomic_increment(4)',
    output: '(4, 5)',
    topic: 'atomics',
    stage: 2,
    solution:
      'fn atomic_increment(n: u32) -> (u32, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(n);\n    let previous = value.fetch_add(1, Ordering::Relaxed);\n    (previous, value.load(Ordering::Relaxed))\n}',
    exampleCode:
      'fn atomic_increment(n: u32) -> (u32, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(n);\n    let previous = value.fetch_add(1, Ordering::Relaxed);\n    (previous, value.load(Ordering::Relaxed))\n}\n\nfn main() {\n    println!("{:?}", atomic_increment(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(atomic_increment(4), (4, 5));\n    assert_eq!(atomic_increment(0), (0, 1));\n}',
    outputDistractors: ['4, 5', '()'],
  },
  {
    slug: 'compare-exchange',
    title: 'Compare and exchange',
    rule: 'compare_exchange updates the atomic only if its current value equals the expected value.',
    decision: 'Handle the failure result without assuming the update happened.',
    badRule: [
      'compare_exchange stores the new value regardless of the expected value.',
      'A failed compare_exchange resets the value to zero.',
    ],
    badDecision: [
      'Interpret an Err result as a successful swap.',
      'Use Release for the failure ordering, which is a load.',
    ],
    signature:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32)',
    body: 'use std::sync::atomic::{AtomicU32, Ordering}; let value = AtomicU32::new(current); let changed = value.compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst).is_ok(); (changed, value.load(Ordering::SeqCst))',
    assertions:
      'assert_eq!(conditional_swap(3, 3, 8), (true, 8)); assert_eq!(conditional_swap(4, 3, 8), (false, 4));',
    call: 'conditional_swap(3, 3, 8)',
    output: '(true, 8)',
    topic: 'atomics',
    stage: 3,
    solution:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(current);\n    let changed = value\n        .compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst)\n        .is_ok();\n    (changed, value.load(Ordering::SeqCst))\n}',
    exampleCode:
      'fn conditional_swap(current: u32, expected: u32, new: u32) -> (bool, u32) {\n    use std::sync::atomic::{AtomicU32, Ordering};\n    let value = AtomicU32::new(current);\n    let changed = value\n        .compare_exchange(expected, new, Ordering::SeqCst, Ordering::SeqCst)\n        .is_ok();\n    (changed, value.load(Ordering::SeqCst))\n}\n\nfn main() {\n    println!("{:?}", conditional_swap(3, 3, 8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(conditional_swap(3, 3, 8), (true, 8));\n    assert_eq!(conditional_swap(4, 3, 8), (false, 4));\n}',
    outputDistractors: ['true, 8', '()'],
  },
  {
    slug: 'acquire-release',
    title: 'Acquire and release publication',
    rule: 'A release store and an acquire load that observes it establish a synchronization relationship.',
    decision:
      'Use a release store to publish readiness and an acquire load to observe it.',
    badRule: [
      'Acquire loads synchronize with every store regardless of which value they observe.',
      'Relaxed publication proves all surrounding writes are visible.',
    ],
    badDecision: [
      'Use an Acquire store, which is an invalid store ordering.',
      'Treat a standalone memory fence as a substitute for a specified publication protocol.',
    ],
    signature: 'fn readiness_round_trip() -> bool',
    body: 'use std::sync::atomic::{AtomicBool, Ordering}; let ready = AtomicBool::new(false); ready.store(true, Ordering::Release); ready.load(Ordering::Acquire)',
    assertions: 'assert!(readiness_round_trip());',
    call: 'readiness_round_trip()',
    output: 'true',
    topic: 'atomics',
    stage: 4,
    solution:
      'fn readiness_round_trip() -> bool {\n    use std::sync::atomic::{AtomicBool, Ordering};\n    let ready = AtomicBool::new(false);\n    ready.store(true, Ordering::Release);\n    ready.load(Ordering::Acquire)\n}',
    exampleCode:
      'fn readiness_round_trip() -> bool {\n    use std::sync::atomic::{AtomicBool, Ordering};\n    let ready = AtomicBool::new(false);\n    ready.store(true, Ordering::Release);\n    ready.load(Ordering::Acquire)\n}\n\nfn main() {\n    println!("{:?}", readiness_round_trip());\n}',
    testCode: 'fn main() {\n    assert!(readiness_round_trip());\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'send',
    title: 'Transfer across thread boundaries',
    rule: 'Send means ownership of a value may be transferred safely between threads.',
    decision:
      'Require Send on generic owned input that is moved into a spawned thread.',
    badRule: [
      'Send means a value supports simultaneous unsynchronized mutation.',
      'Every Rc value is Send.',
    ],
    badDecision: [
      'Omit Send from a generic value moved into thread::spawn.',
      'Treat a shared reference as thread-safe without considering its target type.',
    ],
    signature: "fn send_identity<T: Send + 'static>(value: T) -> T",
    body: 'std::thread::spawn(move || value).join().unwrap()',
    assertions:
      'assert_eq!(send_identity(7), 7); assert_eq!(send_identity(String::from("ok")), "ok");',
    call: 'send_identity(7)',
    output: '7',
    topic: 'send-sync',
    stage: 1,
    solution:
      "fn send_identity<T: Send + 'static>(value: T) -> T {\n    std::thread::spawn(move || value).join().unwrap()\n}",
    exampleCode:
      'fn send_identity<T: Send + \'static>(value: T) -> T {\n    std::thread::spawn(move || value).join().unwrap()\n}\n\nfn main() {\n    println!("{:?}", send_identity(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(send_identity(7), 7);\n    assert_eq!(send_identity(String::from("ok")), "ok");\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'sync',
    title: 'Share references across threads',
    rule: 'Sync means shared references to a type can be sent safely between threads.',
    decision:
      'Require Sync for the borrowed target and Send for an owned worker result.',
    badRule: [
      'Sync grants mutable access through every shared reference.',
      'Cell<i32> is Sync because i32 is Copy.',
    ],
    badDecision: [
      'Share RefCell across threads without an appropriate synchronization primitive.',
      'Add unsafe impl Sync to suppress errors without proving the safety invariant.',
    ],
    signature: 'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T',
    body: 'std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())',
    assertions:
      'assert_eq!(synced_copy(&9), 9); assert_eq!(synced_copy(&true), true);',
    call: 'synced_copy(&9)',
    output: '9',
    topic: 'send-sync',
    stage: 2,
    solution:
      'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T {\n    std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())\n}',
    exampleCode:
      'fn synced_copy<T: Sync + Copy + Send>(value: &T) -> T {\n    std::thread::scope(|scope| scope.spawn(|| *value).join().unwrap())\n}\n\nfn main() {\n    println!("{:?}", synced_copy(&9));\n}',
    testCode:
      'fn main() {\n    assert_eq!(synced_copy(&9), 9);\n    assert_eq!(synced_copy(&true), true);\n}',
    outputDistractors: ['10', '8'],
  },
  {
    slug: 'arc-mutex',
    title: 'Combine ownership and synchronization',
    rule: 'Arc shares ownership while Mutex controls exclusive access to the shared payload.',
    decision: 'Clone Arc for workers and lock only while updating the counter.',
    badRule: [
      'Arc<Mutex<T>> permits ignoring the lock because Arc is atomic.',
      'Mutex clone duplicates protected storage automatically.',
    ],
    badDecision: [
      'Join every worker while holding the protected lock.',
      'Assume Arc::clone clones the inner counter into independent storage.',
    ],
    signature: 'fn parallel_count(workers: usize) -> usize',
    body: 'let count = std::sync::Arc::new(std::sync::Mutex::new(0)); let mut handles = Vec::new(); for _ in 0..workers { let count = std::sync::Arc::clone(&count); handles.push(std::thread::spawn(move || { *count.lock().unwrap() += 1; })); } for handle in handles { handle.join().unwrap(); } let result = *count.lock().unwrap(); result',
    assertions:
      'assert_eq!(parallel_count(4), 4); assert_eq!(parallel_count(0), 0);',
    call: 'parallel_count(4)',
    output: '4',
    topic: 'send-sync',
    stage: 3,
    solution:
      'fn parallel_count(workers: usize) -> usize {\n    let count = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for _ in 0..workers {\n        let count = std::sync::Arc::clone(&count);\n        handles.push(std::thread::spawn(move || {\n            *count.lock().unwrap() += 1;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    let result = *count.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn parallel_count(workers: usize) -> usize {\n    let count = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for _ in 0..workers {\n        let count = std::sync::Arc::clone(&count);\n        handles.push(std::thread::spawn(move || {\n            *count.lock().unwrap() += 1;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    let result = *count.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", parallel_count(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(parallel_count(4), 4);\n    assert_eq!(parallel_count(0), 0);\n}',
    outputDistractors: ['5', '3'],
  },
  {
    slug: 'deadlock-scope',
    title: 'Keep lock scopes short',
    rule: 'A lock guard releases the mutex when the guard is dropped.',
    decision:
      'End a guard scope before taking the same non-reentrant mutex again.',
    badRule: [
      'A std mutex permits recursively acquiring the same lock freely.',
      'Moving a lock guard into a local binding unlocks immediately.',
    ],
    badDecision: [
      'Hold one guard while calling lock again on the same mutex.',
      'Forget the guard permanently and expect later lock acquisition to progress.',
    ],
    signature: 'fn two_updates(n: i32) -> i32',
    body: 'let value = std::sync::Mutex::new(n); { *value.lock().unwrap() += 1; } { *value.lock().unwrap() += 2; } let result = *value.lock().unwrap(); result',
    assertions:
      'assert_eq!(two_updates(4), 7); assert_eq!(two_updates(-3), 0);',
    call: 'two_updates(4)',
    output: '7',
    topic: 'send-sync',
    stage: 4,
    solution:
      'fn two_updates(n: i32) -> i32 {\n    let value = std::sync::Mutex::new(n);\n    {\n        *value.lock().unwrap() += 1;\n    }\n    {\n        *value.lock().unwrap() += 2;\n    }\n    let result = *value.lock().unwrap();\n    result\n}',
    exampleCode:
      'fn two_updates(n: i32) -> i32 {\n    let value = std::sync::Mutex::new(n);\n    {\n        *value.lock().unwrap() += 1;\n    }\n    {\n        *value.lock().unwrap() += 2;\n    }\n    let result = *value.lock().unwrap();\n    result\n}\n\nfn main() {\n    println!("{:?}", two_updates(4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(two_updates(4), 7);\n    assert_eq!(two_updates(-3), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'future-ready',
    title: 'Poll a ready future',
    rule: 'A Future exposes progress through Poll::Pending or Poll::Ready(output).',
    decision:
      'Poll with a Context and inspect Ready without expecting construction to run the future.',
    badRule: [
      'Creating a future always runs it to completion.',
      'Pending contains a completed output.',
    ],
    badDecision: [
      'Extract a completed result from Pending.',
      'Use blocking sleep as the definition of asynchronous progress.',
    ],
    signature: 'fn ready_value(n: i32) -> i32',
    body: 'use std::future::Future; let mut future = std::pin::pin!(std::future::ready(n)); let mut context = std::task::Context::from_waker(std::task::Waker::noop()); match future.as_mut().poll(&mut context) { std::task::Poll::Ready(value) => value, std::task::Poll::Pending => unreachable!() }',
    assertions:
      'assert_eq!(ready_value(7), 7); assert_eq!(ready_value(-2), -2);',
    call: 'ready_value(7)',
    output: '7',
    topic: 'async',
    stage: 1,
    solution:
      'fn ready_value(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = std::pin::pin!(std::future::ready(n));\n    let mut context = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut context) {\n        std::task::Poll::Ready(value) => value,\n        std::task::Poll::Pending => unreachable!(),\n    }\n}',
    exampleCode:
      'fn ready_value(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = std::pin::pin!(std::future::ready(n));\n    let mut context = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut context) {\n        std::task::Poll::Ready(value) => value,\n        std::task::Poll::Pending => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", ready_value(7));\n}',
    testCode:
      'fn main() {\n    assert_eq!(ready_value(7), 7);\n    assert_eq!(ready_value(-2), -2);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'future-pending',
    title: 'Pending and wakeups',
    rule: 'A future returning Pending must arrange for a wakeup when progress may become possible.',
    decision:
      'Record a state transition and wake the task before returning Pending in this finite demonstration.',
    badRule: [
      'Pending automatically schedules unlimited repeated polling.',
      'A wakeup directly returns the future output.',
    ],
    badDecision: [
      'Busy-poll forever as a general executor strategy.',
      'Return Pending without arranging a wakeup for an operation that can later progress.',
    ],
    signature: 'fn two_poll_result(n: i32) -> i32',
    body: "use std::future::Future; struct Later { value: i32, waiting: bool } impl Future for Later { type Output = i32; fn poll(mut self: std::pin::Pin<&mut Self>, cx: &mut std::task::Context<'_>) -> std::task::Poll<i32> { if self.waiting { self.waiting = false; cx.waker().wake_by_ref(); std::task::Poll::Pending } else { std::task::Poll::Ready(self.value) } } } let mut future = std::pin::pin!(Later { value: n, waiting: true }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); assert!(future.as_mut().poll(&mut cx).is_pending()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }",
    assertions:
      'assert_eq!(two_poll_result(8), 8); assert_eq!(two_poll_result(0), 0);',
    call: 'two_poll_result(8)',
    output: '8',
    topic: 'async',
    stage: 2,
    solution:
      "fn two_poll_result(n: i32) -> i32 {\n    use std::future::Future;\n    struct Later {\n        value: i32,\n        waiting: bool,\n    }\n    impl Future for Later {\n        type Output = i32;\n        fn poll(\n            mut self: std::pin::Pin<&mut Self>,\n            cx: &mut std::task::Context<'_>,\n        ) -> std::task::Poll<i32> {\n            if self.waiting {\n                self.waiting = false;\n                cx.waker().wake_by_ref();\n                std::task::Poll::Pending\n            } else {\n                std::task::Poll::Ready(self.value)\n            }\n        }\n    }\n    let mut future = std::pin::pin!(Later {\n        value: n,\n        waiting: true\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    assert!(future.as_mut().poll(&mut cx).is_pending());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}",
    exampleCode:
      'fn two_poll_result(n: i32) -> i32 {\n    use std::future::Future;\n    struct Later {\n        value: i32,\n        waiting: bool,\n    }\n    impl Future for Later {\n        type Output = i32;\n        fn poll(\n            mut self: std::pin::Pin<&mut Self>,\n            cx: &mut std::task::Context<\'_>,\n        ) -> std::task::Poll<i32> {\n            if self.waiting {\n                self.waiting = false;\n                cx.waker().wake_by_ref();\n                std::task::Poll::Pending\n            } else {\n                std::task::Poll::Ready(self.value)\n            }\n        }\n    }\n    let mut future = std::pin::pin!(Later {\n        value: n,\n        waiting: true\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    assert!(future.as_mut().poll(&mut cx).is_pending());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", two_poll_result(8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(two_poll_result(8), 8);\n    assert_eq!(two_poll_result(0), 0);\n}',
    outputDistractors: ['9', '7'],
  },
  {
    slug: 'future-pin',
    title: 'Pin a future before polling',
    rule: 'Pin constrains moving a pinned non-Unpin value through the pinned pointer.',
    decision:
      'Use Box::pin to place an async future behind an owning pinned pointer.',
    badRule: [
      'Pin freezes every field value against mutation.',
      'Pin automatically starts an executor thread.',
    ],
    badDecision: [
      'Move a non-Unpin future out of its pin after polling.',
      'Confuse pinning the pointer with freezing the pointer variable itself.',
    ],
    signature: 'fn pinned_double(n: i32) -> i32',
    body: 'use std::future::Future; let mut future = Box::pin(async move { n * 2 }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }',
    assertions:
      'assert_eq!(pinned_double(3), 6); assert_eq!(pinned_double(-2), -4);',
    call: 'pinned_double(3)',
    output: '6',
    topic: 'async',
    stage: 3,
    solution:
      'fn pinned_double(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move { n * 2 });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}',
    exampleCode:
      'fn pinned_double(n: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move { n * 2 });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", pinned_double(3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(pinned_double(3), 6);\n    assert_eq!(pinned_double(-2), -4);\n}',
    outputDistractors: ['7', '5'],
  },
  {
    slug: 'await',
    title: 'Compose with await',
    rule: 'await waits for a future result while allowing the surrounding task to suspend.',
    decision:
      'Await the ready inner future inside an async block before using its output.',
    badRule: [
      'await is allowed directly in every synchronous function.',
      'await always creates a new operating-system thread.',
    ],
    badDecision: [
      'Apply arithmetic to a Future instead of its awaited output.',
      'Claim a std-only ready-future demonstration implements a production I/O executor.',
    ],
    signature: 'fn await_sum(a: i32, b: i32) -> i32',
    body: 'use std::future::Future; let mut future = Box::pin(async move { let left = std::future::ready(a).await; left + b }); let mut cx = std::task::Context::from_waker(std::task::Waker::noop()); match future.as_mut().poll(&mut cx) { std::task::Poll::Ready(n) => n, _ => unreachable!() }',
    assertions:
      'assert_eq!(await_sum(3, 4), 7); assert_eq!(await_sum(-2, 2), 0);',
    call: 'await_sum(3, 4)',
    output: '7',
    topic: 'async',
    stage: 4,
    solution:
      'fn await_sum(a: i32, b: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move {\n        let left = std::future::ready(a).await;\n        left + b\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}',
    exampleCode:
      'fn await_sum(a: i32, b: i32) -> i32 {\n    use std::future::Future;\n    let mut future = Box::pin(async move {\n        let left = std::future::ready(a).await;\n        left + b\n    });\n    let mut cx = std::task::Context::from_waker(std::task::Waker::noop());\n    match future.as_mut().poll(&mut cx) {\n        std::task::Poll::Ready(n) => n,\n        _ => unreachable!(),\n    }\n}\n\nfn main() {\n    println!("{:?}", await_sum(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(await_sum(3, 4), 7);\n    assert_eq!(await_sum(-2, 2), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'raw-pointers',
    title: 'Create and compare raw pointers',
    rule: 'Creating a raw pointer from a valid reference is safe; dereferencing a raw pointer requires additional guarantees.',
    decision:
      'Compare pointer locations separately from comparing pointed-to values.',
    badRule: [
      'Creating a raw pointer requires an unsafe block in all cases.',
      'Two equal values always occupy the same address.',
    ],
    badDecision: [
      'Compare integer contents when the contract asks about storage identity.',
      'Dereference an arbitrary raw pointer merely because it is non-null.',
    ],
    signature: 'fn same_location(a: &i32, b: &i32) -> bool',
    body: 'std::ptr::eq(a, b)',
    assertions:
      'let a = 3; let b = 3; assert!(same_location(&a, &a)); assert!(!same_location(&a, &b));',
    call: '{ let a = 3; same_location(&a, &a) }',
    output: 'true',
    topic: 'unsafe',
    stage: 1,
    solution:
      'fn same_location(a: &i32, b: &i32) -> bool {\n    std::ptr::eq(a, b)\n}',
    exampleCode:
      'fn same_location(a: &i32, b: &i32) -> bool {\n    std::ptr::eq(a, b)\n}\n\nfn main() {\n    println!("{:?}", {\n        let a = 3;\n        same_location(&a, &a)\n    });\n}',
    testCode:
      'fn main() {\n    let a = 3;\n    let b = 3;\n    assert!(same_location(&a, &a));\n    assert!(!same_location(&a, &b));\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'raw-dereference',
    title: 'Prove a raw dereference',
    rule: 'A raw dereference needs valid alignment, initialized memory, a live allocation, and compatible aliasing.',
    decision:
      'Derive the pointer from a nonempty borrowed slice that remains alive during the read.',
    badRule: [
      'A non-null pointer alone proves memory validity.',
      'unsafe disables type and borrow checking for the entire program.',
    ],
    badDecision: [
      'Dereference as_ptr for an empty slice.',
      'Read through a pointer after its backing allocation is freed.',
    ],
    signature: 'fn raw_first(values: &[i32]) -> Option<i32>',
    body: 'if values.is_empty() { return None; } let pointer = values.as_ptr(); Some(unsafe { *pointer })',
    assertions:
      'assert_eq!(raw_first(&[7, 8]), Some(7)); assert_eq!(raw_first(&[]), None);',
    call: 'raw_first(&[7, 8])',
    output: 'Some(7)',
    topic: 'unsafe',
    stage: 2,
    solution:
      'fn raw_first(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        return None;\n    }\n    let pointer = values.as_ptr();\n    Some(unsafe { *pointer })\n}',
    exampleCode:
      'fn raw_first(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        return None;\n    }\n    let pointer = values.as_ptr();\n    Some(unsafe { *pointer })\n}\n\nfn main() {\n    println!("{:?}", raw_first(&[7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(raw_first(&[7, 8]), Some(7));\n    assert_eq!(raw_first(&[]), None);\n}',
    outputDistractors: ['None', '7'],
  },
  {
    slug: 'raw-slices',
    title: 'Build a slice from raw parts',
    rule: 'from_raw_parts requires a valid single-allocation region with a correct length and lifetime.',
    decision:
      'Keep the new slice length within the original borrowed allocation.',
    badRule: [
      'from_raw_parts checks allocation boundaries at runtime.',
      'A raw slice may safely span unrelated allocations.',
    ],
    badDecision: [
      'Choose a requested length larger than the backing slice.',
      'Promise static lifetime for a slice borrowed from an arbitrary caller.',
    ],
    signature: 'fn raw_prefix_total(values: &[i32], count: usize) -> i32',
    body: 'let count = count.min(values.len()); let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) }; view.iter().sum()',
    assertions:
      'assert_eq!(raw_prefix_total(&[2, 3, 7], 2), 5); assert_eq!(raw_prefix_total(&[2], 9), 2); assert_eq!(raw_prefix_total(&[], 3), 0);',
    call: 'raw_prefix_total(&[2, 3, 7], 2)',
    output: '5',
    topic: 'unsafe',
    stage: 3,
    solution:
      'fn raw_prefix_total(values: &[i32], count: usize) -> i32 {\n    let count = count.min(values.len());\n    let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) };\n    view.iter().sum()\n}',
    exampleCode:
      'fn raw_prefix_total(values: &[i32], count: usize) -> i32 {\n    let count = count.min(values.len());\n    let view = unsafe { std::slice::from_raw_parts(values.as_ptr(), count) };\n    view.iter().sum()\n}\n\nfn main() {\n    println!("{:?}", raw_prefix_total(&[2, 3, 7], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(raw_prefix_total(&[2, 3, 7], 2), 5);\n    assert_eq!(raw_prefix_total(&[2], 9), 2);\n    assert_eq!(raw_prefix_total(&[], 3), 0);\n}',
    outputDistractors: ['6', '4'],
  },
  {
    slug: 'unsafe-wrapper',
    title: 'Encapsulate disjoint mutable regions',
    rule: 'A safe wrapper can use unsafe internally when it proves disjoint valid mutable slices.',
    decision:
      'Check the split point before constructing two nonoverlapping mutable views.',
    badRule: [
      'Two overlapping mutable slices are safe if their lengths differ.',
      'Putting code in a safe function removes its internal safety obligations.',
    ],
    badDecision: [
      'Create both slices from the same starting pointer with overlapping lengths.',
      'Compute an out-of-bounds pointer before validating the split index.',
    ],
    signature: 'fn increment_halves(values: &mut [i32], mid: usize)',
    body: 'let mid = mid.min(values.len()); let len = values.len(); let pointer = values.as_mut_ptr(); let (left, right) = unsafe { (std::slice::from_raw_parts_mut(pointer, mid), std::slice::from_raw_parts_mut(pointer.add(mid), len - mid)) }; for n in left { *n += 1; } for n in right { *n += 2; }',
    assertions:
      'let mut v = [1, 1, 1]; increment_halves(&mut v, 1); assert_eq!(v, [2, 3, 3]); let mut empty = []; increment_halves(&mut empty, 9); let mut v = [1]; increment_halves(&mut v, 9); assert_eq!(v, [2]);',
    call: '{ let mut v = [1, 1, 1]; increment_halves(&mut v, 1); v }',
    output: '[2, 3, 3]',
    topic: 'unsafe',
    stage: 4,
    solution:
      'fn increment_halves(values: &mut [i32], mid: usize) {\n    let mid = mid.min(values.len());\n    let len = values.len();\n    let pointer = values.as_mut_ptr();\n    let (left, right) = unsafe {\n        (\n            std::slice::from_raw_parts_mut(pointer, mid),\n            std::slice::from_raw_parts_mut(pointer.add(mid), len - mid),\n        )\n    };\n    for n in left {\n        *n += 1;\n    }\n    for n in right {\n        *n += 2;\n    }\n}',
    exampleCode:
      'fn increment_halves(values: &mut [i32], mid: usize) {\n    let mid = mid.min(values.len());\n    let len = values.len();\n    let pointer = values.as_mut_ptr();\n    let (left, right) = unsafe {\n        (\n            std::slice::from_raw_parts_mut(pointer, mid),\n            std::slice::from_raw_parts_mut(pointer.add(mid), len - mid),\n        )\n    };\n    for n in left {\n        *n += 1;\n    }\n    for n in right {\n        *n += 2;\n    }\n}\n\nfn main() {\n    println!("{:?}", {\n        let mut v = [1, 1, 1];\n        increment_halves(&mut v, 1);\n        v\n    });\n}',
    testCode:
      'fn main() {\n    let mut v = [1, 1, 1];\n    increment_halves(&mut v, 1);\n    assert_eq!(v, [2, 3, 3]);\n    let mut empty = [];\n    increment_halves(&mut empty, 9);\n    let mut v = [1];\n    increment_halves(&mut v, 9);\n    assert_eq!(v, [2]);\n}',
    outputDistractors: ['[]', '[3, 3, 3]'],
  },
  {
    slug: 'repr-c',
    title: 'C-compatible field layout',
    rule: 'repr(C) gives a struct a C-compatible field layout for an appropriate target ABI.',
    decision:
      'Use fixed-width fields and verify the layout expected by the receiving interface.',
    badRule: [
      'The default Rust struct layout is always a stable C ABI.',
      'repr(C) makes a Rust String field into a C string pointer.',
    ],
    badDecision: [
      'Send Vec internals to C as a portable wire format.',
      'Assume repr(C) removes target alignment differences.',
    ],
    signature: 'fn point_size() -> usize',
    body: '#[repr(C)] struct Point { x: i32, y: i32 } std::mem::size_of::<Point>()',
    assertions: 'assert_eq!(point_size(), 8);',
    call: 'point_size()',
    output: '8',
    topic: 'interop',
    stage: 1,
    solution:
      'fn point_size() -> usize {\n    #[repr(C)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    std::mem::size_of::<Point>()\n}',
    exampleCode:
      'fn point_size() -> usize {\n    #[repr(C)]\n    struct Point {\n        x: i32,\n        y: i32,\n    }\n    std::mem::size_of::<Point>()\n}\n\nfn main() {\n    println!("{:?}", point_size());\n}',
    testCode: 'fn main() {\n    assert_eq!(point_size(), 8);\n}',
    outputDistractors: ['9', '7'],
  },
  {
    slug: 'extern-abi',
    title: 'Extern function ABI',
    rule: 'extern "C" selects the C calling convention for a function boundary.',
    decision:
      'Use ABI-compatible scalar types in this local boundary demonstration.',
    badRule: [
      'extern C translates every Rust type automatically for C.',
      'extern C always loads an external library.',
    ],
    badDecision: [
      'Return a Rust Vec directly as a portable C ABI value.',
      'Assume a calling convention proves the pointed-to memory is valid.',
    ],
    signature: 'fn c_boundary_add(a: i32, b: i32) -> i32',
    body: 'extern "C" fn add(a: i32, b: i32) -> i32 { a + b } add(a, b)',
    assertions:
      'assert_eq!(c_boundary_add(3, 4), 7); assert_eq!(c_boundary_add(-2, 2), 0);',
    call: 'c_boundary_add(3, 4)',
    output: '7',
    topic: 'interop',
    stage: 2,
    solution:
      'fn c_boundary_add(a: i32, b: i32) -> i32 {\n    extern "C" fn add(a: i32, b: i32) -> i32 {\n        a + b\n    }\n    add(a, b)\n}',
    exampleCode:
      'fn c_boundary_add(a: i32, b: i32) -> i32 {\n    extern "C" fn add(a: i32, b: i32) -> i32 {\n        a + b\n    }\n    add(a, b)\n}\n\nfn main() {\n    println!("{:?}", c_boundary_add(3, 4));\n}',
    testCode:
      'fn main() {\n    assert_eq!(c_boundary_add(3, 4), 7);\n    assert_eq!(c_boundary_add(-2, 2), 0);\n}',
    outputDistractors: ['8', '6'],
  },
  {
    slug: 'c-strings',
    title: 'Nul-terminated strings',
    rule: 'A C string ends in a nul byte and cannot contain an interior nul in its content.',
    decision: 'Validate the byte slice before constructing a borrowed CStr.',
    badRule: [
      'Every Rust str is already nul-terminated.',
      'An interior nul is ordinary content in CStr validation.',
    ],
    badDecision: [
      'Use from_bytes_with_nul_unchecked on arbitrary unvalidated bytes.',
      'Count the terminating nul as part of the text content length.',
    ],
    signature: 'fn c_string_length(bytes: &[u8]) -> Option<usize>',
    body: 'std::ffi::CStr::from_bytes_with_nul(bytes).ok().map(|s| s.to_bytes().len())',
    assertions:
      'assert_eq!(c_string_length(b"hi\u0000"), Some(2)); assert_eq!(c_string_length(b"hi"), None); assert_eq!(c_string_length(b"h\u0000i\u0000"), None);',
    call: 'c_string_length(b"hi\u0000")',
    output: 'Some(2)',
    topic: 'interop',
    stage: 3,
    solution:
      'fn c_string_length(bytes: &[u8]) -> Option<usize> {\n    std::ffi::CStr::from_bytes_with_nul(bytes)\n        .ok()\n        .map(|s| s.to_bytes().len())\n}',
    exampleCode:
      'fn c_string_length(bytes: &[u8]) -> Option<usize> {\n    std::ffi::CStr::from_bytes_with_nul(bytes)\n        .ok()\n        .map(|s| s.to_bytes().len())\n}\n\nfn main() {\n    println!("{:?}", c_string_length(b"hi\u0000"));\n}',
    testCode:
      'fn main() {\n    assert_eq!(c_string_length(b"hi\u0000"), Some(2));\n    assert_eq!(c_string_length(b"hi"), None);\n    assert_eq!(c_string_length(b"h\u0000i\u0000"), None);\n}',
    outputDistractors: ['None', '2'],
  },
  {
    slug: 'byte-order',
    title: 'Explicit byte order',
    rule: 'A binary protocol must specify byte order instead of inheriting the host memory representation.',
    decision:
      'Decode a fixed array with from_be_bytes when the protocol uses big-endian bytes.',
    badRule: [
      'Every host uses the same native byte order.',
      'Casting a byte pointer to an integer reference is always aligned and portable.',
    ],
    badDecision: [
      'Use from_ne_bytes for a specified network-order format.',
      'Read four bytes without checking the input length.',
    ],
    signature: 'fn big_endian_u32(bytes: &[u8]) -> Option<u32>',
    body: 'let array: [u8; 4] = bytes.try_into().ok()?; Some(u32::from_be_bytes(array))',
    assertions:
      'assert_eq!(big_endian_u32(&[0, 0, 1, 0]), Some(256)); assert_eq!(big_endian_u32(&[1, 2]), None);',
    call: 'big_endian_u32(&[0, 0, 1, 0])',
    output: 'Some(256)',
    topic: 'interop',
    stage: 4,
    solution:
      'fn big_endian_u32(bytes: &[u8]) -> Option<u32> {\n    let array: [u8; 4] = bytes.try_into().ok()?;\n    Some(u32::from_be_bytes(array))\n}',
    exampleCode:
      'fn big_endian_u32(bytes: &[u8]) -> Option<u32> {\n    let array: [u8; 4] = bytes.try_into().ok()?;\n    Some(u32::from_be_bytes(array))\n}\n\nfn main() {\n    println!("{:?}", big_endian_u32(&[0, 0, 1, 0]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(big_endian_u32(&[0, 0, 1, 0]), Some(256));\n    assert_eq!(big_endian_u32(&[1, 2]), None);\n}',
    outputDistractors: ['None', '256'],
  },
  {
    slug: 'capacity',
    title: 'Length versus capacity',
    rule: 'Vec length counts initialized elements while capacity counts space reserved for elements.',
    decision:
      'Reserve capacity before repeated pushes without treating spare capacity as initialized values.',
    badRule: [
      'with_capacity creates that many initialized elements.',
      'Vector capacity always equals vector length.',
    ],
    badDecision: [
      'Index into spare capacity beyond len.',
      'Assume the allocator returns exactly the requested capacity on every platform.',
    ],
    signature: 'fn reserved_fill(n: usize) -> (usize, bool)',
    body: 'let mut values = Vec::with_capacity(n); for value in 0..n { values.push(value); } (values.len(), values.capacity() >= n)',
    assertions:
      'assert_eq!(reserved_fill(5), (5, true)); assert_eq!(reserved_fill(0), (0, true));',
    call: 'reserved_fill(5)',
    output: '(5, true)',
    topic: 'performance',
    stage: 1,
    solution:
      'fn reserved_fill(n: usize) -> (usize, bool) {\n    let mut values = Vec::with_capacity(n);\n    for value in 0..n {\n        values.push(value);\n    }\n    (values.len(), values.capacity() >= n)\n}',
    exampleCode:
      'fn reserved_fill(n: usize) -> (usize, bool) {\n    let mut values = Vec::with_capacity(n);\n    for value in 0..n {\n        values.push(value);\n    }\n    (values.len(), values.capacity() >= n)\n}\n\nfn main() {\n    println!("{:?}", reserved_fill(5));\n}',
    testCode:
      'fn main() {\n    assert_eq!(reserved_fill(5), (5, true));\n    assert_eq!(reserved_fill(0), (0, true));\n}',
    outputDistractors: ['5, true', '()'],
  },
  {
    slug: 'layout',
    title: 'Size and alignment',
    rule: 'size_of measures the storage size of a type while align_of describes its alignment requirement.',
    decision: 'Account for struct padding when comparing storage costs.',
    badRule: [
      'Struct size is always exactly the sum of field sizes.',
      'Alignment is the number of stored elements.',
    ],
    badDecision: [
      'Pack fields into unaligned references and dereference them normally.',
      'Assume the size of a reference equals the size of the pointed-to allocation.',
    ],
    signature: 'fn padded_layout() -> (usize, usize)',
    body: '#[repr(C)] struct Record { tag: u8, value: u32 } (std::mem::size_of::<Record>(), std::mem::align_of::<Record>())',
    assertions: 'assert_eq!(padded_layout(), (8, 4));',
    call: 'padded_layout()',
    output: '(8, 4)',
    topic: 'performance',
    stage: 2,
    solution:
      'fn padded_layout() -> (usize, usize) {\n    #[repr(C)]\n    struct Record {\n        tag: u8,\n        value: u32,\n    }\n    (\n        std::mem::size_of::<Record>(),\n        std::mem::align_of::<Record>(),\n    )\n}',
    exampleCode:
      'fn padded_layout() -> (usize, usize) {\n    #[repr(C)]\n    struct Record {\n        tag: u8,\n        value: u32,\n    }\n    (\n        std::mem::size_of::<Record>(),\n        std::mem::align_of::<Record>(),\n    )\n}\n\nfn main() {\n    println!("{:?}", padded_layout());\n}',
    testCode: 'fn main() {\n    assert_eq!(padded_layout(), (8, 4));\n}',
    outputDistractors: ['8, 4', '()'],
  },
  {
    slug: 'checked-arithmetic',
    title: 'Checked size arithmetic',
    rule: 'checked_mul reports overflow rather than silently inventing a wrapped allocation size.',
    decision:
      'Use checked arithmetic before accepting a size derived from untrusted counts.',
    badRule: [
      'Release overflow behavior is a valid substitute for input validation.',
      'checked_mul panics on overflow.',
    ],
    badDecision: [
      'Allocate with a wrapped item-count product.',
      'Cast a large usize to a narrower integer before checking its range.',
    ],
    signature: 'fn byte_budget(items: usize, width: usize) -> Option<usize>',
    body: 'items.checked_mul(width)',
    assertions:
      'assert_eq!(byte_budget(4, 8), Some(32)); assert_eq!(byte_budget(usize::MAX, 2), None); assert_eq!(byte_budget(99, 0), Some(0));',
    call: 'byte_budget(4, 8)',
    output: 'Some(32)',
    topic: 'performance',
    stage: 3,
    solution:
      'fn byte_budget(items: usize, width: usize) -> Option<usize> {\n    items.checked_mul(width)\n}',
    exampleCode:
      'fn byte_budget(items: usize, width: usize) -> Option<usize> {\n    items.checked_mul(width)\n}\n\nfn main() {\n    println!("{:?}", byte_budget(4, 8));\n}',
    testCode:
      'fn main() {\n    assert_eq!(byte_budget(4, 8), Some(32));\n    assert_eq!(byte_budget(usize::MAX, 2), None);\n    assert_eq!(byte_budget(99, 0), Some(0));\n}',
    outputDistractors: ['None', '32'],
  },
  {
    slug: 'sort-dedup',
    title: 'Sort then deduplicate',
    rule: 'Vec::dedup removes adjacent duplicates, so sorting first groups equal values.',
    decision:
      'Sort before dedup when duplicates may occur in separated positions.',
    badRule: [
      'dedup removes all duplicate values regardless of positions.',
      'sort_unstable keeps equal-element original order by contract.',
    ],
    badDecision: [
      'Call dedup alone on unsorted repeated values.',
      'Assume stable ordering matters when returning only distinct integers in sorted order.',
    ],
    signature: 'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32>',
    body: 'values.sort_unstable(); values.dedup(); values',
    assertions:
      'assert_eq!(sorted_unique(vec![3, 1, 3, 2, 1]), vec![1, 2, 3]); assert!(sorted_unique(vec![]).is_empty());',
    call: 'sorted_unique(vec![3, 1, 3, 2, 1])',
    output: '[1, 2, 3]',
    topic: 'performance',
    stage: 4,
    solution:
      'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32> {\n    values.sort_unstable();\n    values.dedup();\n    values\n}',
    exampleCode:
      'fn sorted_unique(mut values: Vec<i32>) -> Vec<i32> {\n    values.sort_unstable();\n    values.dedup();\n    values\n}\n\nfn main() {\n    println!("{:?}", sorted_unique(vec![3, 1, 3, 2, 1]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(sorted_unique(vec![3, 1, 3, 2, 1]), vec![1, 2, 3]);\n    assert!(sorted_unique(vec![]).is_empty());\n}',
    outputDistractors: ['[]', '[2, 2, 3]'],
  },
  {
    slug: 'binary-search',
    title: 'Lower-bound binary search',
    rule: 'A lower bound finds the first sorted position whose value is at least the target.',
    decision:
      'Maintain a half-open search interval and return its converged boundary.',
    badRule: [
      'Binary search works identically on arbitrary unsorted input.',
      'Lower bound always points to an equal element.',
    ],
    badDecision: [
      'Set high to len - 1 before handling an empty slice.',
      'Return an arbitrary duplicate position when the contract requires the first position.',
    ],
    signature: 'fn lower_bound(values: &[i32], target: i32) -> usize',
    body: 'let (mut low, mut high) = (0, values.len()); while low < high { let mid = low + (high - low) / 2; if values[mid] < target { low = mid + 1; } else { high = mid; } } low',
    assertions:
      'assert_eq!(lower_bound(&[1, 3, 3, 7], 3), 1); assert_eq!(lower_bound(&[1, 3], 9), 2); assert_eq!(lower_bound(&[], 4), 0);',
    call: 'lower_bound(&[1, 3, 3, 7], 3)',
    output: '1',
    topic: 'algorithms',
    stage: 1,
    solution:
      'fn lower_bound(values: &[i32], target: i32) -> usize {\n    let (mut low, mut high) = (0, values.len());\n    while low < high {\n        let mid = low + (high - low) / 2;\n        if values[mid] < target {\n            low = mid + 1;\n        } else {\n            high = mid;\n        }\n    }\n    low\n}',
    exampleCode:
      'fn lower_bound(values: &[i32], target: i32) -> usize {\n    let (mut low, mut high) = (0, values.len());\n    while low < high {\n        let mid = low + (high - low) / 2;\n        if values[mid] < target {\n            low = mid + 1;\n        } else {\n            high = mid;\n        }\n    }\n    low\n}\n\nfn main() {\n    println!("{:?}", lower_bound(&[1, 3, 3, 7], 3));\n}',
    testCode:
      'fn main() {\n    assert_eq!(lower_bound(&[1, 3, 3, 7], 3), 1);\n    assert_eq!(lower_bound(&[1, 3], 9), 2);\n    assert_eq!(lower_bound(&[], 4), 0);\n}',
    outputDistractors: ['2', '0'],
  },
  {
    slug: 'two-pointers',
    title: 'Two-pointer pair search',
    rule: 'On sorted input, a too-small pair sum can be increased by advancing its left pointer.',
    decision:
      'Use distinct indices and compare the sum in a wider integer type.',
    badRule: [
      'A too-small sum requires decrementing the right pointer.',
      'Two-pointer ordering rules hold on every unsorted input.',
    ],
    badDecision: [
      'Use the same element twice when a pair needs distinct indices.',
      'Add i32 values without accounting for overflow at the input limits.',
    ],
    signature: 'fn has_pair(values: &[i32], target: i64) -> bool',
    body: 'if values.len() < 2 { return false; } let (mut left, mut right) = (0, values.len() - 1); while left < right { let sum = values[left] as i64 + values[right] as i64; if sum == target { return true; } if sum < target { left += 1; } else { right -= 1; } } false',
    assertions:
      'assert!(has_pair(&[1, 3, 5], 8)); assert!(!has_pair(&[4], 8)); assert!(!has_pair(&[], 0)); assert!(has_pair(&[i32::MAX, i32::MAX], 4294967294));',
    call: 'has_pair(&[1, 3, 5], 8)',
    output: 'true',
    topic: 'algorithms',
    stage: 2,
    solution:
      'fn has_pair(values: &[i32], target: i64) -> bool {\n    if values.len() < 2 {\n        return false;\n    }\n    let (mut left, mut right) = (0, values.len() - 1);\n    while left < right {\n        let sum = values[left] as i64 + values[right] as i64;\n        if sum == target {\n            return true;\n        }\n        if sum < target {\n            left += 1;\n        } else {\n            right -= 1;\n        }\n    }\n    false\n}',
    exampleCode:
      'fn has_pair(values: &[i32], target: i64) -> bool {\n    if values.len() < 2 {\n        return false;\n    }\n    let (mut left, mut right) = (0, values.len() - 1);\n    while left < right {\n        let sum = values[left] as i64 + values[right] as i64;\n        if sum == target {\n            return true;\n        }\n        if sum < target {\n            left += 1;\n        } else {\n            right -= 1;\n        }\n    }\n    false\n}\n\nfn main() {\n    println!("{:?}", has_pair(&[1, 3, 5], 8));\n}',
    testCode:
      'fn main() {\n    assert!(has_pair(&[1, 3, 5], 8));\n    assert!(!has_pair(&[4], 8));\n    assert!(!has_pair(&[], 0));\n    assert!(has_pair(&[i32::MAX, i32::MAX], 4294967294));\n}',
    outputDistractors: ['false', '1'],
  },
  {
    slug: 'bfs',
    title: 'Queue-based graph traversal',
    rule: 'Breadth-first search discovers shortest hop counts in an unweighted graph.',
    decision:
      'Mark a vertex when enqueuing it so cycles do not produce repeated work.',
    badRule: [
      'BFS requires a stack to maintain level order.',
      'Unweighted BFS directly minimizes arbitrary edge weights.',
    ],
    badDecision: [
      'Mark vertices only after repeatedly enqueuing neighbors.',
      'Assume every requested start vertex lies within the adjacency list.',
    ],
    signature:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>>',
    body: 'let mut dist = vec![None; graph.len()]; if start >= graph.len() { return dist; } let mut queue = std::collections::VecDeque::new(); dist[start] = Some(0); queue.push_back(start); while let Some(node) = queue.pop_front() { for &next in &graph[node] { if next < graph.len() && dist[next].is_none() { dist[next] = Some(dist[node].unwrap() + 1); queue.push_back(next); } } } dist',
    assertions:
      'assert_eq!(hop_distances(&[vec![1], vec![2], vec![], vec![]], 0), vec![Some(0), Some(1), Some(2), None]); assert!(hop_distances(&[], 0).is_empty());',
    call: 'hop_distances(&[vec![1], vec![2], vec![]], 0)',
    output: '[Some(0), Some(1), Some(2)]',
    topic: 'algorithms',
    stage: 3,
    solution:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>> {\n    let mut dist = vec![None; graph.len()];\n    if start >= graph.len() {\n        return dist;\n    }\n    let mut queue = std::collections::VecDeque::new();\n    dist[start] = Some(0);\n    queue.push_back(start);\n    while let Some(node) = queue.pop_front() {\n        for &next in &graph[node] {\n            if next < graph.len() && dist[next].is_none() {\n                dist[next] = Some(dist[node].unwrap() + 1);\n                queue.push_back(next);\n            }\n        }\n    }\n    dist\n}',
    exampleCode:
      'fn hop_distances(graph: &[Vec<usize>], start: usize) -> Vec<Option<usize>> {\n    let mut dist = vec![None; graph.len()];\n    if start >= graph.len() {\n        return dist;\n    }\n    let mut queue = std::collections::VecDeque::new();\n    dist[start] = Some(0);\n    queue.push_back(start);\n    while let Some(node) = queue.pop_front() {\n        for &next in &graph[node] {\n            if next < graph.len() && dist[next].is_none() {\n                dist[next] = Some(dist[node].unwrap() + 1);\n                queue.push_back(next);\n            }\n        }\n    }\n    dist\n}\n\nfn main() {\n    println!("{:?}", hop_distances(&[vec![1], vec![2], vec![]], 0));\n}',
    testCode:
      'fn main() {\n    assert_eq!(\n        hop_distances(&[vec![1], vec![2], vec![], vec![]], 0),\n        vec![Some(0), Some(1), Some(2), None]\n    );\n    assert!(hop_distances(&[], 0).is_empty());\n}',
    outputDistractors: ['[]', '[Some(1), Some(1), Some(2)]'],
  },
  {
    slug: 'heap-selection',
    title: 'Heap-based top-k selection',
    rule: 'BinaryHeap exposes its greatest stored element at the top.',
    decision: 'Use Reverse to maintain a min-heap of the k largest values.',
    badRule: [
      'BinaryHeap always exposes the smallest element.',
      'A heap iterator always produces sorted values.',
    ],
    badDecision: [
      'Keep the k smallest values while claiming top-k largest output.',
      'Assume popping a max-heap yields increasing order.',
    ],
    signature: 'fn top_k(values: &[i32], k: usize) -> Vec<i32>',
    body: 'let mut heap = std::collections::BinaryHeap::new(); for &n in values { heap.push(std::cmp::Reverse(n)); if heap.len() > k { heap.pop(); } } let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect(); result.sort_unstable_by(|a, b| b.cmp(a)); result',
    assertions:
      'assert_eq!(top_k(&[2, 8, 3, 7], 2), vec![8, 7]); assert!(top_k(&[2], 0).is_empty()); assert_eq!(top_k(&[2], 9), vec![2]);',
    call: 'top_k(&[2, 8, 3, 7], 2)',
    output: '[8, 7]',
    topic: 'algorithms',
    stage: 4,
    solution:
      'fn top_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut heap = std::collections::BinaryHeap::new();\n    for &n in values {\n        heap.push(std::cmp::Reverse(n));\n        if heap.len() > k {\n            heap.pop();\n        }\n    }\n    let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect();\n    result.sort_unstable_by(|a, b| b.cmp(a));\n    result\n}',
    exampleCode:
      'fn top_k(values: &[i32], k: usize) -> Vec<i32> {\n    let mut heap = std::collections::BinaryHeap::new();\n    for &n in values {\n        heap.push(std::cmp::Reverse(n));\n        if heap.len() > k {\n            heap.pop();\n        }\n    }\n    let mut result: Vec<_> = heap.into_iter().map(|n| n.0).collect();\n    result.sort_unstable_by(|a, b| b.cmp(a));\n    result\n}\n\nfn main() {\n    println!("{:?}", top_k(&[2, 8, 3, 7], 2));\n}',
    testCode:
      'fn main() {\n    assert_eq!(top_k(&[2, 8, 3, 7], 2), vec![8, 7]);\n    assert!(top_k(&[2], 0).is_empty());\n    assert_eq!(top_k(&[2], 9), vec![2]);\n}',
    outputDistractors: ['[]', '[9, 7]'],
  },
  {
    slug: 'frame-header',
    title: 'Validate a frame header',
    rule: 'A length-prefixed frame parser must validate its fixed header before reading the payload.',
    decision:
      'Decode only the two-byte big-endian length after confirming both bytes exist.',
    badRule: [
      'A one-byte input always contains a complete two-byte header.',
      'The header length is the same as the total input length.',
    ],
    badDecision: [
      'Index header bytes before checking the slice length.',
      'Decode a big-endian header using a native-endian pointer cast.',
    ],
    signature: 'fn declared_length(bytes: &[u8]) -> Option<usize>',
    body: 'let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?; Some(u16::from_be_bytes(header) as usize)',
    assertions:
      'assert_eq!(declared_length(&[0, 3, 9]), Some(3)); assert_eq!(declared_length(&[1]), None); assert_eq!(declared_length(&[1, 0]), Some(256));',
    call: 'declared_length(&[0, 3, 9])',
    output: 'Some(3)',
    topic: 'systems-project',
    stage: 1,
    solution:
      'fn declared_length(bytes: &[u8]) -> Option<usize> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    Some(u16::from_be_bytes(header) as usize)\n}',
    exampleCode:
      'fn declared_length(bytes: &[u8]) -> Option<usize> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    Some(u16::from_be_bytes(header) as usize)\n}\n\nfn main() {\n    println!("{:?}", declared_length(&[0, 3, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(declared_length(&[0, 3, 9]), Some(3));\n    assert_eq!(declared_length(&[1]), None);\n    assert_eq!(declared_length(&[1, 0]), Some(256));\n}',
    outputDistractors: ['None', '3'],
  },
  {
    slug: 'frame-payload',
    title: 'Borrow a validated payload',
    rule: 'A parser can return a slice into the caller buffer after validating the declared payload boundaries.',
    decision: 'Use checked arithmetic and get to reject an incomplete frame.',
    badRule: [
      'A borrowed payload needs a separate heap allocation.',
      'A declared payload is valid even if the buffer ends early.',
    ],
    badDecision: [
      'Read bytes past the input because the header promised they exist.',
      'Return a reference to a temporary copied buffer.',
    ],
    signature: 'fn frame_payload(bytes: &[u8]) -> Option<&[u8]>',
    body: 'let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?; let length = u16::from_be_bytes(header) as usize; bytes.get(2..2usize.checked_add(length)?)',
    assertions:
      'assert_eq!(frame_payload(&[0, 2, 7, 8]), Some(&[7, 8][..])); assert_eq!(frame_payload(&[0, 3, 7]), None); assert_eq!(frame_payload(&[0, 0]), Some(&[][..]));',
    call: 'frame_payload(&[0, 2, 7, 8])',
    output: 'Some([7, 8])',
    topic: 'systems-project',
    stage: 2,
    solution:
      'fn frame_payload(bytes: &[u8]) -> Option<&[u8]> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    let length = u16::from_be_bytes(header) as usize;\n    bytes.get(2..2usize.checked_add(length)?)\n}',
    exampleCode:
      'fn frame_payload(bytes: &[u8]) -> Option<&[u8]> {\n    let header: [u8; 2] = bytes.get(..2)?.try_into().ok()?;\n    let length = u16::from_be_bytes(header) as usize;\n    bytes.get(2..2usize.checked_add(length)?)\n}\n\nfn main() {\n    println!("{:?}", frame_payload(&[0, 2, 7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(frame_payload(&[0, 2, 7, 8]), Some(&[7, 8][..]));\n    assert_eq!(frame_payload(&[0, 3, 7]), None);\n    assert_eq!(frame_payload(&[0, 0]), Some(&[][..]));\n}',
    outputDistractors: ['None', '[7, 8]'],
  },
  {
    slug: 'frame-encode',
    title: 'Encode a bounded frame',
    rule: 'An encoder must reject a payload length that cannot fit its declared header type.',
    decision:
      'Convert the length with try_from before appending header and payload bytes.',
    badRule: [
      'Casting usize to u16 always reports overflow.',
      'Encoding a frame can omit the declared byte order.',
    ],
    badDecision: [
      'Truncate an oversized length with an as cast.',
      'Write only the payload and call it a length-prefixed frame.',
    ],
    signature: 'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>>',
    body: 'let length = u16::try_from(payload.len()).ok()?; let mut output = Vec::with_capacity(2 + payload.len()); output.extend_from_slice(&length.to_be_bytes()); output.extend_from_slice(payload); Some(output)',
    assertions:
      'assert_eq!(encode_frame(&[7, 8]), Some(vec![0, 2, 7, 8])); assert_eq!(encode_frame(&[]), Some(vec![0, 0])); assert_eq!(encode_frame(&vec![0; 65536]), None);',
    call: 'encode_frame(&[7, 8])',
    output: 'Some([0, 2, 7, 8])',
    topic: 'systems-project',
    stage: 3,
    solution:
      'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>> {\n    let length = u16::try_from(payload.len()).ok()?;\n    let mut output = Vec::with_capacity(2 + payload.len());\n    output.extend_from_slice(&length.to_be_bytes());\n    output.extend_from_slice(payload);\n    Some(output)\n}',
    exampleCode:
      'fn encode_frame(payload: &[u8]) -> Option<Vec<u8>> {\n    let length = u16::try_from(payload.len()).ok()?;\n    let mut output = Vec::with_capacity(2 + payload.len());\n    output.extend_from_slice(&length.to_be_bytes());\n    output.extend_from_slice(payload);\n    Some(output)\n}\n\nfn main() {\n    println!("{:?}", encode_frame(&[7, 8]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(encode_frame(&[7, 8]), Some(vec![0, 2, 7, 8]));\n    assert_eq!(encode_frame(&[]), Some(vec![0, 0]));\n    assert_eq!(encode_frame(&vec![0; 65536]), None);\n}',
    outputDistractors: ['None', '[0, 2, 7, 8]'],
  },
  {
    slug: 'frame-stream',
    title: 'Parse successive complete frames',
    rule: 'A stream decoder advances only after validating each complete length-prefixed frame.',
    decision:
      'Return an error for a trailing incomplete frame instead of silently dropping bytes.',
    badRule: [
      'A partial final header may be discarded as successful parsing.',
      'The next frame always starts one byte after the current frame.',
    ],
    badDecision: [
      'Advance by the payload length without counting its header.',
      'Accept an incomplete payload merely because earlier frames were valid.',
    ],
    signature: 'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>>',
    body: 'let mut offset = 0usize; let mut frames = Vec::new(); while offset < bytes.len() { let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?; let start = offset.checked_add(2)?; let end = start.checked_add(u16::from_be_bytes(header) as usize)?; frames.push(bytes.get(start..end)?.to_vec()); offset = end; } Some(frames)',
    assertions:
      'assert_eq!(decode_frames(&[0, 1, 7, 0, 2, 8, 9]), Some(vec![vec![7], vec![8, 9]])); assert_eq!(decode_frames(&[0]), None); assert_eq!(decode_frames(&[0, 2, 7]), None); assert_eq!(decode_frames(&[]), Some(vec![]));',
    call: 'decode_frames(&[0, 1, 7, 0, 2, 8, 9])',
    output: 'Some([[7], [8, 9]])',
    topic: 'systems-project',
    stage: 4,
    solution:
      'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>> {\n    let mut offset = 0usize;\n    let mut frames = Vec::new();\n    while offset < bytes.len() {\n        let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?;\n        let start = offset.checked_add(2)?;\n        let end = start.checked_add(u16::from_be_bytes(header) as usize)?;\n        frames.push(bytes.get(start..end)?.to_vec());\n        offset = end;\n    }\n    Some(frames)\n}',
    exampleCode:
      'fn decode_frames(bytes: &[u8]) -> Option<Vec<Vec<u8>>> {\n    let mut offset = 0usize;\n    let mut frames = Vec::new();\n    while offset < bytes.len() {\n        let header: [u8; 2] = bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?;\n        let start = offset.checked_add(2)?;\n        let end = start.checked_add(u16::from_be_bytes(header) as usize)?;\n        frames.push(bytes.get(start..end)?.to_vec());\n        offset = end;\n    }\n    Some(frames)\n}\n\nfn main() {\n    println!("{:?}", decode_frames(&[0, 1, 7, 0, 2, 8, 9]));\n}',
    testCode:
      'fn main() {\n    assert_eq!(\n        decode_frames(&[0, 1, 7, 0, 2, 8, 9]),\n        Some(vec![vec![7], vec![8, 9]])\n    );\n    assert_eq!(decode_frames(&[0]), None);\n    assert_eq!(decode_frames(&[0, 2, 7]), None);\n    assert_eq!(decode_frames(&[]), Some(vec![]));\n}',
    outputDistractors: ['None', '[[7], [8, 9]]'],
  },
];
