import { choose, predictOutput, type KnowledgePointModule } from '.';

export const knowledgePoints: KnowledgePointModule = {
  'rust-generic-functions': [
    {
      title: 'Declare a type parameter and let each call choose it',
      explanation: [
        'Writing fn keep<T>(value: T) -> T declares a type parameter T in angle brackets. T stands for whatever concrete type a call supplies: keep(5) uses i32 and keep("hi") uses &str.',
        'The compiler fills in T separately at every call, from the argument types, and checks each call on its own. One generic function therefore replaces several copies that differ only in their types.',
      ],
      example: {
        language: 'rust',
        code: 'fn keep<T>(value: T) -> T {\n    value\n}\n\nfn main() {\n    let n = keep(41) + 1;\n    let word = keep("ready");\n    println!("{} {}", n, word);\n}',
        output: '42 ready',
        explanation:
          'The first call makes T an integer, so its result can be added to. The second call makes T a &str. Both calls use the same function.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn pick_last<T>(a: T, b: T) -> T {\n    b\n}\n\nfn main() {\n    println!("{}", pick_last(4, 9));\n    println!("{}", pick_last("left", "right"));\n}',
          ['4\nleft', '4\nright', '9\nleft', '9\nright'],
          3,
          'pick_last returns its second argument whatever T is: 9 for the integers and right for the strings.',
        ),
        choose(
          'Given fn same<T>(a: T, b: T) -> T, which call does the compiler reject?',
          [
            'same(3, 8)',
            'same("x", "y")',
            'same(String::from("a"), String::from("b"))',
            'same(3, "y")',
          ],
          3,
          'Both parameters use the same T, so one call cannot make T an integer and a &str at once.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn echo<T>(value: T) -> T {\n    value\n}\n\nfn main() {\n    let total = echo(10) + echo(5);\n    let name = echo(String::from("crab"));\n    println!("{} {}", total, name);\n}',
          ['15 crab', '105 crab', '10 crab', '15 "crab"'],
          0,
          'Each echo call returns its argument unchanged, so the integers add to 15 and the String prints as crab.',
        ),
        choose(
          'When is T decided for the call keep(String::from("x"))?',
          [
            'At compile time, from the argument type String',
            'At run time, by inspecting the value passed in',
            'Once for the whole program, by the first call',
            'When main finishes and all calls are known',
          ],
          0,
          'Type parameters are resolved during compilation from each call’s argument types; nothing is inspected at run time.',
        ),
      ],
    },
    {
      title: 'Use only what every type allows',
      explanation: [
        'Inside the body, T could be any type at all, so the compiler only allows what works for every type: binding, moving, returning, or passing the value to another generic function. Adding, comparing, or printing a T is rejected, because some types cannot do those things.',
        'Ownership works as usual. Passing a String into a generic function moves it, so the caller must use the returned value instead of the original binding.',
      ],
      example: {
        language: 'rust',
        code: 'fn hand_over<T>(value: T) -> T {\n    let held = value;\n    held\n}\n\nfn main() {\n    let title = String::from("draft");\n    let returned = hand_over(title);\n    println!("{}", returned);\n}',
        output: 'draft',
        explanation:
          'hand_over only moves its argument and returns it, which is valid for every T. title is moved into the call, so the program prints through returned.',
      },
      questions: [
        choose(
          'Which body does the compiler accept for fn combine<T>(a: T, b: T) -> T, with no other requirements on T?',
          [
            'Add a and b and return the sum',
            'Return whichever of a and b is larger',
            'Print a with {} and then return it',
            'Return b and let a be dropped',
          ],
          3,
          'Moving and returning a value works for every type. Addition, comparison, and {} formatting need operations that T might not have.',
        ),
        predictOutput(
          'What does this program print?',
          'fn first<T>(a: T, b: T) -> T {\n    a\n}\n\nfn last<T>(a: T, b: T) -> T {\n    b\n}\n\nfn main() {\n    println!("{}", first(last(1, 2), last(3, 4)));\n}',
          ['1', '3', '4', '2'],
          3,
          'The inner calls give 2 and 4, and first returns the first of those, 2.',
        ),
        choose(
          'Why is fn show<T>(item: T) { println!("{}", item); } rejected?',
          [
            'Generic functions may not call macros such as println!',
            'A generic parameter must be passed by reference',
            'Nothing promises that every T can be formatted with {}',
            'Functions without a return type cannot be generic',
          ],
          2,
          'The body may only use what all types support, and many types cannot be printed with {}.',
        ),
        choose(
          'After let b = relay(a); where a is a String and relay is fn relay<T>(value: T) -> T, what can main still use?',
          [
            'Both a and b, as two separate Strings',
            'Only a; b is a borrowed view of it',
            'Neither; relay dropped the String',
            'Only b; a was moved into the call',
          ],
          3,
          'Passing a String by value moves it, even into a generic function. relay returns it, so b now owns it.',
        ),
      ],
    },
  ],
  'rust-generic-structs': [
    {
      title: 'Declare a struct with a type parameter',
      explanation: [
        'struct Boxed<T> { inner: T } declares a type parameter on the struct. Each field typed T takes whatever type a value supplies, so Boxed { inner: 5 } is a Boxed<i32> and Boxed { inner: "hi" } is a Boxed<&str>.',
        'Each type argument produces a distinct type, and every field that names T must use that same type in one value. A struct can declare several parameters, such as Entry<K, V>, when fields need different types.',
      ],
      example: {
        language: 'rust',
        code: 'struct Boxed<T> {\n    inner: T,\n}\n\nfn main() {\n    let number = Boxed { inner: 12 };\n    let word = Boxed { inner: "twelve" };\n    println!("{} {}", number.inner + 1, word.inner);\n}',
        output: '13 twelve',
        explanation:
          'number is a Boxed<i32>, so its field supports + 1. word is a Boxed<&str>. The same declaration serves both.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Pair<T> {\n    left: T,\n    right: T,\n}\n\nfn main() {\n    let p = Pair { left: 3, right: 8 };\n    println!("{}", p.right - p.left);\n}',
          ['5', '-5', '11', '3'],
          0,
          'Both fields are i32 here, and right - left is 8 - 3.',
        ),
        choose(
          'With struct Pair<T> { left: T, right: T }, which value is rejected?',
          [
            'Pair { left: 1, right: 2 }',
            'Pair { left: "a", right: "b" }',
            'Pair { left: 0, right: 0 }',
            'Pair { left: 1, right: "b" }',
          ],
          3,
          'Both fields are declared as the same T, so one Pair cannot hold an integer and a &str.',
        ),
        predictOutput(
          'What is the output of this program?',
          'struct Entry<K, V> {\n    key: K,\n    value: V,\n}\n\nfn main() {\n    let e = Entry { key: "port", value: 8080 };\n    println!("{}={}", e.key, e.value + 1);\n}',
          ['port=8080', '8081=port', 'port=80801', 'port=8081'],
          3,
          'K is &str and V is an integer, so key prints as port and value + 1 is 8081.',
        ),
        choose(
          'Are Boxed<i32> and Boxed<&str> the same type?',
          [
            'Yes; Boxed is one type whatever T is',
            'Only if both values have the same size',
            'No; each type argument makes a distinct type',
            'Yes, but only after a value is stored',
          ],
          2,
          'A generic struct is a family of types. Boxed<i32> and Boxed<&str> are different types that share a definition.',
        ),
      ],
    },
    {
      title: 'Build and open generic structs in generic functions',
      explanation: [
        'A generic function can reuse its own type parameter in a struct type: fn fill<T>(item: T) -> Slot<T> wraps any value, and fn empty_out<T>(slot: Slot<T>) -> T unwraps it again.',
        'The function must declare T in its own angle brackets before using it, and Slot must be written with its type argument. A function that takes the struct by value owns it, so it may move a field out.',
      ],
      example: {
        language: 'rust',
        code: 'struct Slot<T> {\n    item: T,\n}\n\nfn fill<T>(item: T) -> Slot<T> {\n    Slot { item }\n}\n\nfn empty_out<T>(slot: Slot<T>) -> T {\n    slot.item\n}\n\nfn main() {\n    let slot = fill(String::from("key"));\n    let item = empty_out(slot);\n    println!("{}", item);\n}',
        output: 'key',
        explanation:
          'fill builds a Slot<String>, and empty_out takes ownership of it and moves the field out, so main ends up owning the String again.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Pair<T> {\n    first: T,\n    second: T,\n}\n\nfn make<T>(a: T, b: T) -> Pair<T> {\n    Pair { first: b, second: a }\n}\n\nfn main() {\n    let p = make(2, 7);\n    println!("{} {}", p.first, p.second);\n}',
          ['2 7', '7 7', '2 2', '7 2'],
          3,
          'make stores b in first and a in second, so the order is swapped.',
        ),
        choose(
          'Which function correctly returns the field of a Wrapper<T> { inner: T }?',
          [
            'fn unwrap(w: Wrapper<T>) -> T',
            'fn unwrap<T>(w: Wrapper<T>) -> T',
            'fn unwrap<T>(w: Wrapper) -> T',
            'fn unwrap<T>(w: T) -> Wrapper<T>',
          ],
          1,
          'T must be declared on the function, and Wrapper needs its type argument; the result is the field type T.',
        ),
        predictOutput(
          'What is the output of this program?',
          'struct Holder<T> {\n    value: T,\n}\n\nfn main() {\n    let outer = Holder { value: Holder { value: 5 } };\n    println!("{}", outer.value.value * 3);\n}',
          ['15', '5', '8', '45'],
          0,
          'outer is a Holder<Holder<i32>>. outer.value.value reaches the inner 5, and 5 * 3 is 15.',
        ),
        choose(
          'With fn fill<T>(item: T) -> Slot<T>, what type does fill(7) produce?',
          ['Slot<i32>', 'Slot<T>', 'i32', 'Slot<Slot<i32>>'],
          0,
          'The argument fixes T as i32 for this call, so the return type Slot<T> becomes Slot<i32>.',
        ),
      ],
    },
  ],
  'rust-trait-impl': [
    {
      title: 'Declare a trait and implement it for a type',
      explanation: [
        'A trait lists method signatures that types can promise to provide: trait Wheels { fn wheels(&self) -> u32; }. An impl Wheels for Bike block supplies the body of every listed method for Bike.',
        'After the impl, the method is called like any other: bike.wheels(). Each type that implements the trait writes its own body, and every body must match the signature declared in the trait.',
      ],
      example: {
        language: 'rust',
        code: 'trait Describe {\n    fn describe(&self) -> String;\n}\n\nstruct Dog {\n    name: String,\n}\n\nimpl Describe for Dog {\n    fn describe(&self) -> String {\n        format!("dog named {}", self.name)\n    }\n}\n\nfn main() {\n    let rex = Dog { name: String::from("Rex") };\n    println!("{}", rex.describe());\n}',
        output: 'dog named Rex',
        explanation:
          'The impl gives Dog a describe body that reads its own field, so rex.describe() builds the text from Rex.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Wheels {\n    fn wheels(&self) -> u32;\n}\n\nstruct Bike {\n    riders: u32,\n}\n\nstruct Car {\n    doors: u32,\n}\n\nimpl Wheels for Bike {\n    fn wheels(&self) -> u32 {\n        2\n    }\n}\n\nimpl Wheels for Car {\n    fn wheels(&self) -> u32 {\n        4\n    }\n}\n\nfn main() {\n    let bike = Bike { riders: 1 };\n    let car = Car { doors: 4 };\n    println!("{}", bike.wheels() + car.wheels() * 2);\n}',
          ['12', '6', '8', '10'],
          3,
          'Each type runs its own body: 2 for the bike and 4 for the car. Multiplication happens first, so 2 + 8 is 10.',
        ),
        choose(
          'trait Score declares fn score(&self) -> u32;. What must impl Score for Player contain?',
          [
            'Only the line fn score(&self) -> u32;',
            'A body for score with that same signature',
            'A new field named score on Player',
            'A call to score from another Player method',
          ],
          1,
          'The trait only declares the method; the impl must supply a body whose signature matches the declaration.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Total {\n    fn total(&self) -> u32;\n}\n\nstruct Order {\n    price: u32,\n    count: u32,\n}\n\nimpl Total for Order {\n    fn total(&self) -> u32 {\n        self.price * self.count\n    }\n}\n\nfn main() {\n    let order = Order { price: 6, count: 3 };\n    println!("{}", order.total());\n}',
          ['18', '9', '63', '6'],
          0,
          'The impl multiplies the two fields of this Order: 6 * 3 is 18.',
        ),
        choose(
          'The trait declares fn total(&self) -> u32, but the impl writes fn total(&self) -> i64. What happens?',
          [
            'The impl is rejected for not matching the trait',
            'It compiles, and calls return an i64',
            'It compiles, and the result is cast to u32',
            'Only calls made through the trait are rejected',
          ],
          0,
          'An impl must keep each method signature compatible with the trait declaration, so the mismatched return type is an error.',
        ),
      ],
    },
    {
      title: 'Implement your trait for existing types',
      explanation: [
        'An impl can target a type you did not define, such as u32 or String, as long as the trait is your own. After impl Shout for i32, every i32 value has a shout method.',
        'Each type needs its own impl. Implementing a trait for u8 says nothing about u64, even though both are integers.',
      ],
      example: {
        language: 'rust',
        code: 'trait Shout {\n    fn shout(&self) -> String;\n}\n\nimpl Shout for i32 {\n    fn shout(&self) -> String {\n        format!("{}!", self)\n    }\n}\n\nfn main() {\n    let n: i32 = 7;\n    println!("{}", n.shout());\n}',
        output: '7!',
        explanation:
          'The impl adds shout to i32, and inside it self is the i32 value, so the method formats 7 with an exclamation mark.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Triple {\n    fn triple(&self) -> u32;\n}\n\nimpl Triple for u32 {\n    fn triple(&self) -> u32 {\n        self * 3\n    }\n}\n\nfn main() {\n    let a: u32 = 4;\n    let b: u32 = 5;\n    println!("{}", a.triple() + b);\n}',
          ['17', '27', '12', '15'],
          0,
          'a.triple() is 12, and b is added unchanged, giving 17.',
        ),
        choose(
          'A program contains impl Shout for i32 and no other impl of Shout. Which call compiles?',
          [
            'let n: i32 = 3; n.shout()',
            'let n: u8 = 3; n.shout()',
            'let n: i64 = 3; n.shout()',
            'let n = "3"; n.shout()',
          ],
          0,
          'Only i32 has an impl. Other integer types and &str would each need their own impl block.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Label {\n    fn label(&self) -> String;\n}\n\nimpl Label for u8 {\n    fn label(&self) -> String {\n        format!("small {}", self)\n    }\n}\n\nimpl Label for u64 {\n    fn label(&self) -> String {\n        format!("large {}", self)\n    }\n}\n\nfn main() {\n    let a: u8 = 3;\n    let b: u64 = 3;\n    println!("{} / {}", b.label(), a.label());\n}',
          [
            'small 3 / large 3',
            'large 3 / large 3',
            'small 3 / small 3',
            'large 3 / small 3',
          ],
          3,
          'The value 3 is the same, but b is a u64 and a is a u8, so each call uses the impl for its own type.',
        ),
        choose(
          'What does impl Shout for i32 change?',
          [
            'i32 values gain a shout method',
            'Every i32 is converted to a String when used',
            'Only i32 values created after the impl gain shout',
            'i32 loses its built-in arithmetic operators',
          ],
          0,
          'The impl adds behavior to the existing type; it does not convert or remove anything.',
        ),
      ],
    },
  ],
  'rust-default-method': [
    {
      title: 'Use a default body built on required methods',
      explanation: [
        'A trait method can come with a body. Implementors that do not write that method get the default automatically, while methods without a body remain required.',
        'A default body cannot see any implementor’s fields, but it can call the trait’s other methods through self. Writing one required method can therefore unlock several derived ones.',
      ],
      example: {
        language: 'rust',
        code: 'trait Shape {\n    fn sides(&self) -> u32;\n    fn describe(&self) -> String {\n        format!("{} sides", self.sides())\n    }\n}\n\nstruct Triangle {\n    size: u32,\n}\n\nimpl Shape for Triangle {\n    fn sides(&self) -> u32 {\n        3\n    }\n}\n\nfn main() {\n    let t = Triangle { size: 5 };\n    println!("{}", t.describe());\n}',
        output: '3 sides',
        explanation:
          'Triangle writes only sides. describe comes from the default, which calls Triangle’s sides and gets 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Price {\n    fn base(&self) -> u32;\n    fn with_fee(&self) -> u32 {\n        self.base() + 5\n    }\n}\n\nstruct Ticket {\n    cost: u32,\n}\n\nimpl Price for Ticket {\n    fn base(&self) -> u32 {\n        self.cost * 2\n    }\n}\n\nfn main() {\n    let t = Ticket { cost: 10 };\n    println!("{}", t.with_fee());\n}',
          ['15', '20', '30', '25'],
          3,
          'with_fee is the default: it calls Ticket’s base, which is 20, and adds 5.',
        ),
        choose(
          'trait Report has a required fn title(&self) -> String and a default fn header(&self) -> String. What must an impl provide?',
          [
            'Both title and header',
            'Only title; header uses the default',
            'Only header, which then defines title',
            'Neither, because one method has a body',
          ],
          1,
          'Methods without a body are required. A method with a default body may be omitted.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Counted {\n    fn count(&self) -> u32;\n    fn doubled(&self) -> u32 {\n        self.count() * 2\n    }\n}\n\nstruct Pair {\n    left: u32,\n    right: u32,\n}\n\nstruct Single {\n    value: u32,\n}\n\nimpl Counted for Pair {\n    fn count(&self) -> u32 {\n        2\n    }\n}\n\nimpl Counted for Single {\n    fn count(&self) -> u32 {\n        1\n    }\n}\n\nfn main() {\n    let p = Pair { left: 7, right: 9 };\n    let s = Single { value: 5 };\n    println!("{} {}", p.doubled(), s.doubled());\n}',
          ['4 2', '32 10', '2 1', '4 4'],
          0,
          'The same default runs for both types, but each call uses that type’s count: 2 * 2 and 1 * 2.',
        ),
        choose(
          'Which statement about a default method body is true?',
          [
            'It may read fields of whichever struct implements the trait',
            'It runs once, when the impl block is compiled',
            'It may call the trait’s required methods through self',
            'It is used only if the impl repeats its signature',
          ],
          2,
          'The trait does not know implementors’ fields, but it does know its own methods, so the default reaches data through them.',
        ),
      ],
    },
    {
      title: 'Override a default for one type',
      explanation: [
        'An impl may still write a method that has a default. Its body replaces the default for that type only; other implementors keep the default.',
        'Calls inside default bodies go through self, so a default that calls an overridden method uses the override for that type.',
      ],
      example: {
        language: 'rust',
        code: 'trait Shape {\n    fn sides(&self) -> u32;\n    fn corners(&self) -> u32 {\n        self.sides()\n    }\n}\n\nstruct Square {\n    side: u32,\n}\n\nstruct Circle {\n    radius: u32,\n}\n\nimpl Shape for Square {\n    fn sides(&self) -> u32 {\n        4\n    }\n}\n\nimpl Shape for Circle {\n    fn sides(&self) -> u32 {\n        1\n    }\n    fn corners(&self) -> u32 {\n        0\n    }\n}\n\nfn main() {\n    let s = Square { side: 2 };\n    let c = Circle { radius: 3 };\n    println!("{} {}", s.corners(), c.corners());\n}',
        output: '4 0',
        explanation:
          'Square keeps the default corners, which returns its 4 sides. Circle overrides corners and returns 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Points {\n    fn base(&self) -> u32 {\n        10\n    }\n    fn bonus(&self) -> u32 {\n        self.base() * 2\n    }\n}\n\nstruct Rookie {\n    level: u32,\n}\n\nstruct Veteran {\n    level: u32,\n}\n\nimpl Points for Rookie {}\n\nimpl Points for Veteran {\n    fn base(&self) -> u32 {\n        25\n    }\n}\n\nfn main() {\n    let r = Rookie { level: 1 };\n    let v = Veteran { level: 9 };\n    println!("{} {}", r.bonus(), v.bonus());\n}',
          ['20 50', '10 25', '20 20', '50 50'],
          0,
          'Both use the default bonus, but self.base() runs Veteran’s override, so the results are 10 * 2 and 25 * 2.',
        ),
        choose(
          'Type A overrides a default method label; type B does not. Which body runs for b.label()?',
          [
            'A’s overriding body',
            'Both bodies, one after the other',
            'The trait’s default body',
            'None, so B fails to compile',
          ],
          2,
          'An override replaces the default only for the type that wrote it. B still uses the default.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Greeting {\n    fn greet(&self) -> String {\n        String::from("hello")\n    }\n}\n\nstruct Friend {\n    nickname: String,\n}\n\nstruct Stranger {\n    id: u32,\n}\n\nimpl Greeting for Friend {\n    fn greet(&self) -> String {\n        format!("hey {}", self.nickname)\n    }\n}\n\nimpl Greeting for Stranger {}\n\nfn main() {\n    let f = Friend { nickname: String::from("Jo") };\n    let s = Stranger { id: 4 };\n    println!("{}, {}", s.greet(), f.greet());\n}',
          ['hey Jo, hello', 'hello, hello', 'hey Jo, hey Jo', 'hello, hey Jo'],
          3,
          'Stranger uses the default and Friend uses its override. The format string prints Stranger’s greeting first.',
        ),
        choose(
          'Why can’t a default body in trait Greeting read self.nickname?',
          [
            'The trait cannot know implementors’ fields',
            'Default methods are not allowed to take &self',
            'Fields are private to every trait method',
            'Default bodies run before any struct value exists',
          ],
          0,
          'A trait is written for any implementor, so it can only rely on its own methods, not on one struct’s fields.',
        ),
      ],
    },
  ],
  'rust-associated-types': [
    {
      title: 'Each impl chooses the associated type',
      explanation: [
        'A trait can declare a placeholder type with type Unit;. Its methods refer to it as Self::Unit, and every impl fills it in with a line such as type Unit = u32;.',
        'Different implementors may choose different types, so the same method name can return a u32 for one type and a String for another. Every impl must make a choice.',
      ],
      example: {
        language: 'rust',
        code: 'trait Measure {\n    type Unit;\n    fn amount(&self) -> Self::Unit;\n}\n\nstruct Rope {\n    meters: u32,\n}\n\nstruct Label {\n    text: String,\n}\n\nimpl Measure for Rope {\n    type Unit = u32;\n    fn amount(&self) -> Self::Unit {\n        self.meters\n    }\n}\n\nimpl Measure for Label {\n    type Unit = String;\n    fn amount(&self) -> Self::Unit {\n        format!("{} chars", self.text.len())\n    }\n}\n\nfn main() {\n    let rope = Rope { meters: 12 };\n    let label = Label { text: String::from("box") };\n    println!("{} / {}", rope.amount() + 3, label.amount());\n}',
        output: '15 / 3 chars',
        explanation:
          'For Rope, Self::Unit is u32, so its amount supports + 3. For Label it is String, so its amount is text.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Source {\n    type Item;\n    fn next_item(&self) -> Self::Item;\n}\n\nstruct Counter {\n    start: u32,\n}\n\nimpl Source for Counter {\n    type Item = u32;\n    fn next_item(&self) -> Self::Item {\n        self.start + 1\n    }\n}\n\nfn main() {\n    let c = Counter { start: 41 };\n    let a = c.next_item();\n    let b = c.next_item();\n    println!("{} {}", a, b);\n}',
          ['42 42', '42 43', '41 42', '41 41'],
          0,
          'next_item takes &self and never changes start, so both calls compute 41 + 1.',
        ),
        choose(
          'Inside impl Source for Counter { type Item = u32; ... }, what does Self::Item mean?',
          [
            'Counter',
            'The trait Source itself',
            'Any type the caller picks',
            'u32',
          ],
          3,
          'Self::Item names the associated type as this impl chose it, which is u32.',
        ),
        choose(
          'An impl Source for Counter writes next_item but omits the type Item = ...; line. What happens?',
          [
            'Item defaults to u32 because the field is a u32',
            'Item is inferred later from the first call',
            'It is rejected: every impl must choose the associated type',
            'It compiles, but next_item can never be called',
          ],
          2,
          'An associated type without a default must be specified in each impl; the compiler does not guess it.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Split {\n    type Parts;\n    fn split(&self) -> Self::Parts;\n}\n\nstruct Span {\n    hours: u32,\n}\n\nimpl Split for Span {\n    type Parts = (u32, u32);\n    fn split(&self) -> Self::Parts {\n        (self.hours, self.hours * 60)\n    }\n}\n\nfn main() {\n    let s = Span { hours: 2 };\n    let parts = s.split();\n    println!("{} {}", parts.1, parts.0);\n}',
          ['120 2', '2 120', '120 120', '2 2'],
          0,
          'Parts is a tuple here. Field 1 holds the minutes (120) and field 0 the hours (2), printed in that order.',
        ),
      ],
    },
    {
      title: 'The chosen type applies everywhere it is named',
      explanation: [
        'Self::Item can appear in parameters as well as return types. Once an impl says type Item = u32, every method in that impl that mentions Self::Item takes or returns a u32.',
        'This is the difference from a plain fixed type: the trait describes the shape of the methods, and each implementor decides the concrete type that fills it, once.',
      ],
      example: {
        language: 'rust',
        code: 'trait Store {\n    type Item;\n    fn put(&self, item: Self::Item) -> String;\n}\n\nstruct Shelf {\n    name: String,\n}\n\nimpl Store for Shelf {\n    type Item = u32;\n    fn put(&self, item: Self::Item) -> String {\n        format!("{} holds {}", self.name, item + 1)\n    }\n}\n\nfn main() {\n    let shelf = Shelf { name: String::from("top") };\n    println!("{}", shelf.put(4));\n}',
        output: 'top holds 5',
        explanation:
          'For Shelf, Self::Item is u32, so put accepts the integer 4 and can add to it.',
      },
      questions: [
        choose(
          'For the Shelf impl, where type Item = u32, which call to put compiles?',
          [
            'shelf.put("5")',
            'shelf.put(String::from("5"))',
            'shelf.put((5, 5))',
            'shelf.put(5)',
          ],
          3,
          'The parameter is Self::Item, which this impl fixed as u32. Only an integer argument fits.',
        ),
        predictOutput(
          'What does this program print?',
          'trait Convert {\n    type Input;\n    type Output;\n    fn convert(&self, input: Self::Input) -> Self::Output;\n}\n\nstruct Doubler {\n    extra: u32,\n}\n\nimpl Convert for Doubler {\n    type Input = u32;\n    type Output = String;\n    fn convert(&self, input: Self::Input) -> Self::Output {\n        format!("{}+{}", input * 2, self.extra)\n    }\n}\n\nfn main() {\n    let d = Doubler { extra: 1 };\n    println!("{}", d.convert(6));\n}',
          ['12+1', '13', '6+1', '7+1'],
          0,
          'The input is a u32 that gets doubled, and the output is a String built from 12 and extra.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Reading {\n    type Value;\n    fn read(&self) -> Self::Value;\n}\n\nstruct Thermometer {\n    celsius: i32,\n}\n\nstruct Gps {\n    lat: i32,\n    lon: i32,\n}\n\nimpl Reading for Thermometer {\n    type Value = i32;\n    fn read(&self) -> Self::Value {\n        self.celsius - 3\n    }\n}\n\nimpl Reading for Gps {\n    type Value = (i32, i32);\n    fn read(&self) -> Self::Value {\n        (self.lon, self.lat)\n    }\n}\n\nfn main() {\n    let t = Thermometer { celsius: 20 };\n    let g = Gps { lat: 4, lon: 9 };\n    let pos = g.read();\n    println!("{} {} {}", t.read(), pos.0, pos.1);\n}',
          ['17 9 4', '17 4 9', '20 9 4', '23 9 4'],
          0,
          'The thermometer returns an i32, 20 - 3. The GPS returns a tuple with lon first, so field 0 is 9.',
        ),
        choose(
          'What does an associated type let a trait do that a fixed u32 return type cannot?',
          [
            'Implement the trait several times for one type',
            'Decide the Item type at run time',
            'Let each implementor choose its own Item type',
            'Force every implementor to return u32',
          ],
          2,
          'With an associated type, each impl picks the type once. A fixed return type would be the same for all implementors.',
        ),
      ],
    },
  ],
  'rust-trait-objects': [
    {
      title: 'Call a trait method through &dyn Trait',
      explanation: [
        '&dyn Speak is a reference to some value whose type implements Speak, without saying which type. A function with a parameter of type &dyn Speak accepts a reference to any implementor.',
        'Calling who.speak() runs the method of the value’s actual type. The choice is made at run time through a table of that type’s methods, which is why this is called dynamic dispatch.',
      ],
      example: {
        language: 'rust',
        code: 'trait Speak {\n    fn speak(&self) -> String;\n}\n\nstruct Cat {\n    name: String,\n}\n\nstruct Robot {\n    id: u32,\n}\n\nimpl Speak for Cat {\n    fn speak(&self) -> String {\n        format!("{} meows", self.name)\n    }\n}\n\nimpl Speak for Robot {\n    fn speak(&self) -> String {\n        format!("unit {} beeps", self.id)\n    }\n}\n\nfn announce(who: &dyn Speak) {\n    println!("{}", who.speak());\n}\n\nfn main() {\n    let cat = Cat { name: String::from("Tom") };\n    let robot = Robot { id: 7 };\n    announce(&robot);\n    announce(&cat);\n}',
        output: 'unit 7 beeps\nTom meows',
        explanation:
          'announce is written once, but each call runs the speak of the value passed in: first the robot’s, then the cat’s.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Area {\n    fn area(&self) -> u32;\n}\n\nstruct Square {\n    side: u32,\n}\n\nstruct Rect {\n    w: u32,\n    h: u32,\n}\n\nimpl Area for Square {\n    fn area(&self) -> u32 {\n        self.side * self.side\n    }\n}\n\nimpl Area for Rect {\n    fn area(&self) -> u32 {\n        self.w * self.h\n    }\n}\n\nfn double_area(shape: &dyn Area) -> u32 {\n    shape.area() * 2\n}\n\nfn main() {\n    let s = Square { side: 3 };\n    let r = Rect { w: 2, h: 5 };\n    println!("{} {}", double_area(&s), double_area(&r));\n}',
          ['9 10', '6 14', '20 18', '18 20'],
          3,
          'The square’s area is 9 and the rectangle’s is 10; double_area doubles whichever implementation it receives.',
        ),
        choose(
          'A function takes shape: &dyn Area. When is it decided which area body runs?',
          [
            'At compile time, always the first impl written',
            'At run time, from the concrete type behind the reference',
            'When the function is defined, from its parameter',
            'Never; a dyn call runs every implementation',
          ],
          1,
          'The reference carries a pointer to the actual type’s method table, which is consulted when the call happens.',
        ),
        choose(
          'Cat implements Speak and i32 does not. Which argument can be passed to fn show(item: &dyn Speak)?',
          ['cat, a Cat moved by value', '&7', '&cat', 'Speak, the trait name'],
          2,
          'The parameter is a reference to an implementor. A Cat value is not a reference, and i32 has no Speak impl.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Noise {\n    fn noise(&self) -> String;\n}\n\nstruct Duck {\n    volume: u32,\n}\n\nstruct Cow {\n    volume: u32,\n}\n\nimpl Noise for Duck {\n    fn noise(&self) -> String {\n        format!("quack{}", self.volume)\n    }\n}\n\nimpl Noise for Cow {\n    fn noise(&self) -> String {\n        format!("moo{}", self.volume)\n    }\n}\n\nfn describe(animal: &dyn Noise) -> String {\n    animal.noise()\n}\n\nfn main() {\n    let d = Duck { volume: 1 };\n    let c = Cow { volume: 2 };\n    println!("{} {}", describe(&c), describe(&d));\n}',
          ['quack1 moo2', 'moo2 moo2', 'quack1 quack1', 'moo2 quack1'],
          3,
          'describe(&c) runs Cow’s noise and describe(&d) runs Duck’s, in the order they appear in the format string.',
        ),
      ],
    },
    {
      title: 'Keep different implementors in one collection',
      explanation: [
        'An array needs one element type, so [&coffee, &bagel] is rejected when the two structs differ. Annotating the elements as &dyn Cost gives them a common type, and the array can hold both.',
        'Every element then answers the same trait methods, and each call still runs the implementation of the value stored at that position.',
      ],
      example: {
        language: 'rust',
        code: 'trait Cost {\n    fn cost(&self) -> u32;\n}\n\nstruct Coffee {\n    shots: u32,\n}\n\nstruct Bagel {\n    toasting_fee: u32,\n}\n\nimpl Cost for Coffee {\n    fn cost(&self) -> u32 {\n        2 + self.shots\n    }\n}\n\nimpl Cost for Bagel {\n    fn cost(&self) -> u32 {\n        3 + self.toasting_fee\n    }\n}\n\nfn main() {\n    let latte = Coffee { shots: 2 };\n    let bagel = Bagel { toasting_fee: 1 };\n    let order: [&dyn Cost; 2] = [&latte, &bagel];\n    println!("{}", order[0].cost() + order[1].cost());\n}',
        output: '8',
        explanation:
          'The annotation makes both elements &dyn Cost. The coffee costs 2 + 2 and the bagel 3 + 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Value {\n    fn value(&self) -> i32;\n}\n\nstruct Coin {\n    cents: i32,\n}\n\nstruct Debt {\n    owed: i32,\n}\n\nimpl Value for Coin {\n    fn value(&self) -> i32 {\n        self.cents\n    }\n}\n\nimpl Value for Debt {\n    fn value(&self) -> i32 {\n        -self.owed\n    }\n}\n\nfn main() {\n    let a = Coin { cents: 25 };\n    let b = Debt { owed: 10 };\n    let c = Coin { cents: 5 };\n    let wallet: [&dyn Value; 3] = [&a, &b, &c];\n    println!("{}", wallet[0].value() + wallet[1].value() + wallet[2].value());\n}',
          ['20', '40', '30', '-20'],
          0,
          'The coins count +25 and +5 and the debt counts -10, because each element uses its own type’s value.',
        ),
        choose(
          'Why is let items = [&coin, &debt]; rejected while let items: [&dyn Value; 2] = [&coin, &debt]; compiles?',
          [
            'Arrays cannot hold references unless they are mutable',
            'The dyn annotation copies both structs into the array',
            'The first version needs a third element to be valid',
            'Without the annotation the two elements have different types',
          ],
          3,
          '&Coin and &Debt are different types. Converting both to &dyn Value gives the array one element type.',
        ),
        choose(
          'order has type [&dyn Cost; 2]. Which implementation does order[1].cost() run?',
          [
            'The impl for the type of order[0]',
            'A default body from the trait',
            'Both impls, adding the results',
            'The impl for the type stored at index 1',
          ],
          3,
          'Each element remembers its concrete type, so the call dispatches to the value at that index.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Noise {\n    fn noise(&self) -> String;\n}\n\nstruct Duck {\n    volume: u32,\n}\n\nstruct Cow {\n    volume: u32,\n}\n\nimpl Noise for Duck {\n    fn noise(&self) -> String {\n        format!("quack{}", self.volume)\n    }\n}\n\nimpl Noise for Cow {\n    fn noise(&self) -> String {\n        format!("moo{}", self.volume)\n    }\n}\n\nfn main() {\n    let d = Duck { volume: 1 };\n    let c = Cow { volume: 2 };\n    let farm: [&dyn Noise; 3] = [&c, &d, &c];\n    println!("{} {} {}", farm[1].noise(), farm[2].noise(), farm[0].noise());\n}',
          [
            'quack1 moo2 moo2',
            'moo2 quack1 moo2',
            'quack1 quack1 moo2',
            'moo2 moo2 quack1',
          ],
          0,
          'Index 1 holds the duck and indexes 0 and 2 hold the cow; the format string prints 1, 2, then 0.',
        ),
      ],
    },
  ],
  'rust-trait-bounds': [
    {
      title: 'A bound lets generic code call trait methods',
      explanation: [
        'An unconstrained T supports almost nothing. Writing T: Weight in the angle brackets promises that every T implements Weight, so the body may call item.grams().',
        'The promise is checked at each call: arguments whose type has no Weight impl are rejected. The bound is what makes the trait’s methods available inside the generic function.',
      ],
      example: {
        language: 'rust',
        code: 'trait Weight {\n    fn grams(&self) -> u32;\n}\n\nstruct Apple {\n    size: u32,\n}\n\nimpl Weight for Apple {\n    fn grams(&self) -> u32 {\n        self.size * 50\n    }\n}\n\nfn heavier_by<T: Weight>(item: &T, extra: u32) -> u32 {\n    item.grams() + extra\n}\n\nfn main() {\n    let apple = Apple { size: 3 };\n    println!("{}", heavier_by(&apple, 20));\n}',
        output: '170',
        explanation:
          'The bound allows item.grams() inside heavier_by. For this apple it is 150, plus the extra 20.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'trait Score {\n    fn points(&self) -> u32;\n}\n\nstruct Goal {\n    scorer: u32,\n}\n\nstruct Try {\n    converted: bool,\n}\n\nimpl Score for Goal {\n    fn points(&self) -> u32 {\n        3\n    }\n}\n\nimpl Score for Try {\n    fn points(&self) -> u32 {\n        if self.converted { 7 } else { 5 }\n    }\n}\n\nfn twice<T: Score>(event: &T) -> u32 {\n    event.points() * 2\n}\n\nfn main() {\n    let g = Goal { scorer: 9 };\n    let t = Try { converted: false };\n    println!("{} {}", twice(&g), twice(&t));\n}',
          ['6 10', '6 14', '3 5', '18 10'],
          0,
          'twice works for any Score type. The goal is worth 3 and the unconverted try 5, each doubled.',
        ),
        choose(
          'fn report<T>(item: &T) -> u32 { item.points() } is rejected. What fixes it?',
          [
            'Change &T to T so the method can be found',
            'Add the bound T: Score so points is known to exist',
            'Return item instead of calling a method',
            'Wrap the call in an if that checks the type',
          ],
          1,
          'Without a bound the compiler cannot assume T has points. T: Score makes that method available.',
        ),
        choose(
          'Given fn twice<T: Score>(event: &T) -> u32, which call is rejected?',
          [
            'twice(&7), where i32 has no Score impl',
            'twice(&goal), where Goal implements Score',
            'twice(&attempt), where Try implements Score',
            'twice(&other), a second Goal value',
          ],
          0,
          'Every argument type must satisfy the bound, and i32 does not implement Score.',
        ),
        predictOutput(
          'What is the output of this program?',
          'trait Size {\n    fn size(&self) -> u32;\n}\n\nstruct Crate {\n    items: u32,\n}\n\nimpl Size for Crate {\n    fn size(&self) -> u32 {\n        self.items * 4\n    }\n}\n\nfn fits<T: Size>(thing: &T, limit: u32) -> bool {\n    thing.size() <= limit\n}\n\nfn main() {\n    let small = Crate { items: 2 };\n    let big = Crate { items: 5 };\n    println!("{} {}", fits(&small, 8), fits(&big, 8));\n}',
          ['true false', 'true true', 'false false', 'false true'],
          0,
          'The small crate has size 8, which is within the limit; the big crate has size 20.',
        ),
      ],
    },
    {
      title: 'Bound by standard traits to use operators',
      explanation: [
        'Operators are trait methods too. Comparing with < or >= needs an ordering trait such as Ord, and printing with {} needs std::fmt::Display. Writing fn smaller<T: Ord>(a: T, b: T) -> T allows the comparison inside.',
        'Integers and strings implement Ord, so one bounded function works for both, using each type’s own ordering. Strings compare alphabetically, character by character.',
      ],
      example: {
        language: 'rust',
        code: 'fn smaller<T: Ord>(a: T, b: T) -> T {\n    if a <= b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{} {}", smaller(8, 3), smaller("pear", "apple"));\n}',
        output: '3 apple',
        explanation:
          'The Ord bound permits <=. Integers compare numerically and strings alphabetically.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn larger<T: Ord>(a: T, b: T) -> T {\n    if a >= b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{}", larger(larger("fig", "kiwi"), "date"));\n}',
          ['fig', 'date', 'figkiwi', 'kiwi'],
          3,
          'Alphabetically, kiwi comes after fig, and kiwi also comes after date.',
        ),
        choose(
          'Which bound lets a generic function print a T with {}?',
          ['T: Ord', 'T: Clone', 'T: Copy', 'T: std::fmt::Display'],
          3,
          'The {} placeholder uses the Display trait, so T must implement it.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn bigger<T: Ord>(a: T, b: T) -> T {\n    if a > b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{} {}", bigger("10", "9"), bigger(10, 9));\n}',
          ['9 10', '10 10', '10 9', '9 9'],
          0,
          'As strings, "9" is greater than "10" because the first characters compare 9 > 1. As integers, 10 is greater.',
        ),
        choose(
          'Why is fn bigger<T>(a: T, b: T) -> T { if a > b { a } else { b } } rejected?',
          [
            'if cannot return a generic value',
            'Nothing promises that T supports >',
            'a and b must be passed by reference',
            'Generic functions cannot contain if',
          ],
          1,
          'The > operator comes from an ordering trait, and an unconstrained T has no such guarantee.',
        ),
      ],
    },
  ],
  'rust-where': [
    {
      title: 'Move bounds into a where clause',
      explanation: [
        'fn copy_of<T>(value: &T) -> T where T: Clone means exactly the same as fn copy_of<T: Clone>(value: &T) -> T. The where clause goes after the return type and before the opening brace.',
        'It keeps the signature readable when there are several parameters or several bounds. Bounds are combined with +, as in T: Clone + Ord, and each parameter gets its own line.',
      ],
      example: {
        language: 'rust',
        code: 'fn duplicate<T>(value: &T) -> (T, T)\nwhere\n    T: Clone,\n{\n    (value.clone(), value.clone())\n}\n\nfn main() {\n    let word = String::from("echo");\n    let pair = duplicate(&word);\n    println!("{} {} {}", pair.0, pair.1, word);\n}',
        output: 'echo echo echo',
        explanation:
          'The where clause requires Clone, so the body may clone the borrowed value twice. word is only borrowed and is still usable.',
      },
      questions: [
        choose(
          'Which signature means the same as fn keep<T: Clone>(x: &T) -> T?',
          [
            'fn keep<T>(x: &T) where T: Clone -> T',
            'fn keep<T where T: Clone>(x: &T) -> T',
            'fn keep<T>(x: &T: Clone) -> T',
            'fn keep<T>(x: &T) -> T where T: Clone',
          ],
          3,
          'The where clause comes after the return type and lists the same bound.',
        ),
        predictOutput(
          'What does this program print?',
          'fn max_copy<T>(a: &T, b: &T) -> T\nwhere\n    T: Clone + Ord,\n{\n    if a >= b {\n        a.clone()\n    } else {\n        b.clone()\n    }\n}\n\nfn main() {\n    let x = String::from("bee");\n    let y = String::from("ant");\n    let winner = max_copy(&x, &y);\n    println!("{} {} {}", winner, x, y);\n}',
          ['ant bee ant', 'bee ant', 'bee bee ant', 'ant ant bee'],
          2,
          'Ord allows the comparison and Clone allows returning an owned copy; bee sorts after ant, and x and y remain usable.',
        ),
        choose(
          'Where does the where clause go in a function definition?',
          [
            'Before fn, on its own line above the function',
            'Inside the body, as the first statement',
            'Between the function name and <T>',
            'After the return type, before the opening brace',
          ],
          3,
          'A where clause follows the full signature, including the return type, and precedes the body.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn pair_up<A, B>(a: &A, b: &B) -> (A, B)\nwhere\n    A: Clone,\n    B: Clone,\n{\n    (a.clone(), b.clone())\n}\n\nfn main() {\n    let name = String::from("ada");\n    let age = 36;\n    let pair = pair_up(&name, &age);\n    println!("{} {}", pair.1 + 1, pair.0);\n}',
          ['36 ada', '37 ada', 'ada 37', '37 ada36'],
          1,
          'A is String and B is an integer, each with its own bound. pair.1 is the cloned 36, plus 1.',
        ),
      ],
    },
    {
      title: 'Require Clone to return an owned copy of a borrow',
      explanation: [
        'A function that receives &T cannot move the value out of the borrow. To return an owned T it must make a new one, which is what value.clone() does, so T: Clone is required.',
        'The caller keeps its original, and the returned copy is independent: changing one does not change the other.',
      ],
      example: {
        language: 'rust',
        code: 'fn owned<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}\n\nfn main() {\n    let original = String::from("note");\n    let mut copy = owned(&original);\n    copy.push_str("s");\n    println!("{} {}", original, copy);\n}',
        output: 'note notes',
        explanation:
          'owned returns a fresh clone. Appending to copy leaves original unchanged.',
      },
      questions: [
        choose(
          'Why is fn take<T>(value: &T) -> T { *value } rejected?',
          [
            'A where clause is mandatory for every generic function',
            'It would move a T out from behind a shared borrow',
            'References to generic values cannot be dereferenced',
            'Strings cannot be used as type arguments',
          ],
          1,
          'Moving out of a borrow would leave the owner with nothing. A clone produces a new owned value instead.',
        ),
        predictOutput(
          'What does this program print?',
          'fn copy_of<T>(value: &T) -> T\nwhere\n    T: Clone,\n{\n    value.clone()\n}\n\nfn main() {\n    let scores = [1, 2, 3];\n    let mut backup = copy_of(&scores);\n    backup[0] = 9;\n    println!("{} {}", scores[0], backup[0]);\n}',
          ['9 9', '1 9', '1 1', '9 1'],
          1,
          'backup is a separate array cloned from scores, so changing backup[0] leaves scores[0] at 1.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn twin<T>(item: &T) -> (T, T)\nwhere\n    T: Clone,\n{\n    (item.clone(), item.clone())\n}\n\nfn main() {\n    let mut base = String::from("ab");\n    let pair = twin(&base);\n    base.push_str("c");\n    println!("{} {} {}", pair.0, pair.1, base);\n}',
          ['abc abc abc', 'ab ab abc', 'abc ab abc', 'ab ab ab'],
          1,
          'The clones were taken before the push, and they do not share storage with base.',
        ),
        choose(
          'A caller passes &name to fn owned<T>(value: &T) -> T where T: Clone. What does the caller own afterwards?',
          [
            'Only the returned value; name was moved',
            'Only name; the result borrows from it',
            'name and the returned clone, as separate values',
            'Nothing; both were dropped inside the call',
          ],
          2,
          'Passing &name only borrows it, and the result is a new owned clone.',
        ),
      ],
    },
  ],
  'rust-lifetime-elision': [
    {
      title: 'With one input borrow, the output borrows from it',
      explanation: [
        'fn trimmed(text: &str) -> &str has exactly one input reference, so the compiler assumes the returned reference points into text. No lifetime needs to be written; this rule is called lifetime elision.',
        'The result is a view of the caller’s string, not a copy. A function with no input reference cannot return a borrowed &str this way, because there is nothing for the result to borrow from.',
      ],
      example: {
        language: 'rust',
        code: 'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let raw = String::from("  hello  ");\n    let clean = trimmed(&raw);\n    println!("[{}] {}", clean, clean.len());\n}',
        output: '[hello] 5',
        explanation:
          'trim returns a slice inside raw without the surrounding spaces, and elision ties the result to raw.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn tidy(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let input = String::from("   ok ");\n    println!("{} {}", input.len(), tidy(&input).len());\n}',
          ['2 6', '6 2', '6 6', '4 2'],
          1,
          'input still holds all 6 bytes; the trimmed view covers only the 2 letters.',
        ),
        choose(
          'For fn label(text: &str) -> &str, what does elision assume about the returned reference?',
          [
            'It is a new String owned by the caller',
            'It lives for the whole program',
            'It points into text and is valid while text is',
            'It points to a local variable inside label',
          ],
          2,
          'With a single input reference, the output gets that input’s lifetime.',
        ),
        choose(
          'Which signature compiles without writing any lifetime?',
          [
            'fn pick(a: &str, b: &str) -> &str',
            'fn pick(text: &str) -> &str',
            'fn pick() -> &str',
            'fn pick(n: u32) -> &str',
          ],
          1,
          'Elision needs exactly one input reference to tie the output to. Two inputs are ambiguous, and none leaves nothing to borrow.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn core(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let a = String::from(" x ");\n    let b = core(&a);\n    let c = core(b);\n    println!("<{}>{}", c, a.len() - c.len());\n}',
          ['< x >0', '<x>2', '<x>0', '< x >2'],
          1,
          'Both calls return views into a. The second trim changes nothing, and the view is 2 bytes shorter than a.',
        ),
      ],
    },
    {
      title: 'Keep the input valid while the output is used',
      explanation: [
        'Because the returned &str points into the input, the input must stay alive and unchanged for as long as the result is used. Moving or modifying the String while the view is still needed is rejected.',
        'Once the view has been used for the last time, the String is free again, so it can be changed and borrowed anew.',
      ],
      example: {
        language: 'rust',
        code: 'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let mut owner = String::from(" data ");\n    let view = trimmed(&owner);\n    println!("{}", view);\n    owner.push_str("!");\n    println!("{}", owner);\n}',
        output: 'data\n data !',
        explanation:
          'view is used before the push, so the borrow is over by the time owner is modified.',
      },
      questions: [
        choose(
          'Why is this rejected?',
          [
            'owner is moved while view still points into it',
            'trimmed cannot be called with a String reference',
            'view is a copy and needs no owner',
            'moved must be declared mut first',
          ],
          0,
          'view borrows from owner and is printed after owner moves, so it would point into storage that changed hands.',
          'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let owner = String::from(" a ");\n    let view = trimmed(&owner);\n    let moved = owner;\n    println!("{}", view);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn trimmed(text: &str) -> &str {\n    text.trim()\n}\n\nfn main() {\n    let mut note = String::from(" go ");\n    let first = trimmed(&note).len();\n    note.push_str("now");\n    let second = trimmed(&note).len();\n    println!("{} {}", first, second);\n}',
          ['2 2', '2 6', '4 7', '2 5'],
          1,
          'The first view is used immediately. After the push, note is " go now", whose trimmed form is 6 bytes long.',
        ),
        choose(
          'After let view = trimmed(&text);, what does view refer to?',
          [
            'A new String copied from text',
            'Bytes inside text, without copying them',
            'A copy of text in view’s own buffer',
            'A string literal stored in the program',
          ],
          1,
          'The result borrows part of the input, which is why the input must outlive it.',
        ),
        choose(
          'Which program is rejected?',
          [
            'let v = trimmed(&s); s.push_str("!"); println!("{}", v);',
            'let v = trimmed(&s); println!("{}", v); s.push_str("!");',
            'let n = trimmed(&s).len(); s.push_str("!"); println!("{}", n);',
            's.push_str("!"); let v = trimmed(&s); println!("{}", v);',
          ],
          0,
          'Only the second uses the view after s has been modified; n in the third is a plain number, not a borrow.',
        ),
      ],
    },
  ],
  'rust-lifetime-explicit': [
    {
      title: 'Two input borrows need an explicit lifetime',
      explanation: [
        "fn longer(a: &str, b: &str) -> &str is rejected: with two input references, the compiler cannot tell which one the result borrows from. A lifetime parameter states the relationship: fn longer<'a>(a: &'a str, b: &'a str) -> &'a str.",
        "Reading 'a as a region of code, the signature says the result is valid only where both inputs are valid. The caller must keep both alive while using the result, even if at run time it came from just one.",
      ],
      example: {
        language: 'rust',
        code: 'fn longer<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    let first = String::from("pear");\n    let second = String::from("fig");\n    println!("{}", longer(&first, &second));\n}',
        output: 'pear',
        explanation:
          'The lifetime parameter ties the result to both inputs; at run time, pear is the longer one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn longer<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() > b.len() {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{} {}", longer("ab", "xyz"), longer("hi", "yo"));\n}',
          ['xyz yo', 'xyz hi', 'ab yo', 'ab hi'],
          0,
          'xyz is longer than ab. hi and yo tie, and with a strict > the else branch returns b, yo.',
        ),
        choose(
          'Why does fn pick(a: &str, b: &str) -> &str need a lifetime parameter?',
          [
            'With two input borrows, the source of the output is ambiguous',
            'Every function returning &str needs one',
            'Two &str parameters must share one allocation',
            'Otherwise the output is copied into a new String',
          ],
          0,
          'Elision only works with a single input reference. With two, the signature must say how the output relates to them.',
        ),
        choose(
          "In fn longer<'a>(a: &'a str, b: &'a str) -> &'a str, how long may the caller use the result?",
          [
            'Only while both a and b remain valid',
            'Only while a is valid, since it is listed first',
            "For the rest of the program, as 'a means static",
            'Only until longer returns',
          ],
          0,
          "Both inputs share 'a, so the result is promised valid only within both of their lifetimes.",
        ),
        choose(
          'At run time, result points into a. Why is this program still rejected?',
          [
            'longer copies b into result, so b cannot move',
            'a and b must have the same length',
            'result must be declared mut',
            'The signature says result may borrow from b',
          ],
          3,
          'The compiler checks the signature, not the run-time path. It treats result as possibly borrowing b, which moves while result is still used.',
          'fn longer<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() >= b.len() {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    let a = String::from("long text");\n    let b = String::from("hi");\n    let result = longer(&a, &b);\n    let taken = b;\n    println!("{}", result);\n}',
        ),
      ],
    },
    {
      title: 'Tie the output only to the input it comes from',
      explanation: [
        "If the result always comes from one parameter, only that parameter needs the output lifetime: fn apply<'a>(text: &'a str, mode: &str) -> &'a str. The other input is borrowed only for the duration of the call.",
        'This gives callers more freedom: they may move or drop mode right after the call while still using the result. The body, in turn, is not allowed to return mode.',
      ],
      example: {
        language: 'rust',
        code: 'fn apply<\'a>(text: &\'a str, mode: &str) -> &\'a str {\n    if mode == "trim" {\n        text.trim()\n    } else {\n        text\n    }\n}\n\nfn main() {\n    let text = String::from("  hi  ");\n    let mode = String::from("trim");\n    let result = apply(&text, &mode);\n    let moved_mode = mode;\n    println!("[{}] {}", result, moved_mode);\n}',
        output: '[hi] trim',
        explanation:
          'result is tied only to text, so moving mode after the call is allowed.',
      },
      questions: [
        choose(
          "Given fn apply<'a>(text: &'a str, mode: &str) -> &'a str, which body is rejected?",
          [
            'text.trim()',
            'if mode == "x" { text.trim() } else { text }',
            'if mode == "x" { mode } else { text }',
            'text',
          ],
          2,
          "mode is not tied to 'a, so returning it would break the signature’s promise.",
        ),
        predictOutput(
          'What does this program print?',
          'fn pick<\'a>(main: &\'a str, backup: &\'a str, use_main: bool) -> &\'a str {\n    if use_main {\n        main\n    } else {\n        backup\n    }\n}\n\nfn main() {\n    let a = String::from("alpha");\n    let b = String::from("beta");\n    println!("{} {}", pick(&a, &b, false), pick(&b, &a, true));\n}',
          ['beta beta', 'alpha beta', 'beta alpha', 'alpha alpha'],
          0,
          'The first call returns its backup, b. The second returns its main argument, which is also b.',
        ),
        choose(
          'Which signature lets the caller move the second argument’s owner right after the call while still using the result?',
          [
            "fn f<'a>(a: &'a str, b: &str) -> &'a str",
            "fn f<'a>(a: &'a str, b: &'a str) -> &'a str",
            'fn f(a: &str, b: &str) -> &str',
            "fn f<'a>(a: &str, b: &'a str) -> &'a str",
          ],
          0,
          'Only the last ties the result to a alone. The first ties it to both, the third to b, and the second does not compile.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn longest<\'a>(a: &\'a str, b: &\'a str, c: &\'a str) -> &\'a str {\n    let ab = if a.len() >= b.len() { a } else { b };\n    if ab.len() >= c.len() {\n        ab\n    } else {\n        c\n    }\n}\n\nfn main() {\n    println!("{}", longest("tea", "cocoa", "juice"));\n}',
          ['juice', 'tea', 'teacocoa', 'cocoa'],
          3,
          'cocoa beats tea, and cocoa ties juice; with >= the earlier winner, cocoa, is kept.',
        ),
      ],
    },
  ],
  'rust-borrowed-struct': [
    {
      title: 'Declare the lifetime of a borrowed field',
      explanation: [
        "A struct may hold a reference, but then it must say how long that reference is valid: struct Excerpt<'a> { text: &'a str }. The parameter 'a links every Excerpt to the data it points into.",
        'An Excerpt cannot be used after its source is moved or dropped. Building one borrows the source exactly as a plain reference would.',
      ],
      example: {
        language: 'rust',
        code: 'struct Excerpt<\'a> {\n    text: &\'a str,\n}\n\nfn main() {\n    let article = String::from("  rust borrows  ");\n    let quote = Excerpt { text: article.trim() };\n    println!("{} ({})", quote.text, quote.text.len());\n}',
        output: 'rust borrows (12)',
        explanation:
          'quote.text points into article. article stays alive and unchanged while quote is used.',
      },
      questions: [
        choose(
          'Which struct declaration does the compiler accept?',
          [
            'struct Tag { name: &str }',
            "struct Tag<'a> { name: &'a str }",
            "struct Tag { name: &'a str }",
            "struct Tag<'a> { name: &str<'a> }",
          ],
          1,
          'A reference field needs a lifetime, and that lifetime must be declared on the struct.',
        ),
        choose(
          'Why is this program rejected?',
          [
            'Tag cannot store a &String as &str',
            'source moves while tag still borrows it',
            'tag.name must be cloned before printing',
            'moved needs a lifetime annotation',
          ],
          1,
          'tag holds a reference into source and is used after source moves.',
          'struct Tag<\'a> {\n    name: &\'a str,\n}\n\nfn main() {\n    let source = String::from("v1");\n    let tag = Tag { name: &source };\n    let moved = source;\n    println!("{}", tag.name);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'struct Pair<\'a> {\n    left: &\'a str,\n    right: &\'a str,\n}\n\nfn main() {\n    let text = String::from(" key ");\n    let other = String::from("value");\n    let p = Pair { left: text.trim(), right: &other };\n    println!("{}={} {}", p.left, p.right, p.left.len() + p.right.len());\n}',
          ['key=value 10', ' key =value 10', 'key=value 8', 'value=key 8'],
          2,
          'left is the trimmed view of text, 3 bytes, and right is all of other, 5 bytes.',
        ),
        predictOutput(
          'What is the output of this program?',
          'struct View<\'a> {\n    part: &\'a str,\n}\n\nfn main() {\n    let line = String::from("  ab  ");\n    let raw = View { part: &line };\n    let clean = View { part: line.trim() };\n    println!("{} {}", raw.part.len(), clean.part.len());\n}',
          ['6 2', '2 2', '6 6', '2 6'],
          0,
          'Both views borrow line at once, which is fine for shared borrows. One covers all 6 bytes and one only ab.',
        ),
      ],
    },
    {
      title: 'Write methods for a borrowing struct',
      explanation: [
        "The impl block repeats the lifetime: impl<'a> Parser<'a> { ... }. Inside, methods can read the borrowed field through &self like any other field.",
        "A method that returns the field can promise -> &'a str. Then the result borrows the original text, not the struct, so it stays usable even after the struct itself is gone.",
      ],
      example: {
        language: 'rust',
        code: "struct Parser<'a> {\n    input: &'a str,\n}\n\nimpl<'a> Parser<'a> {\n    fn trimmed(&self) -> &'a str {\n        self.input.trim()\n    }\n\n    fn is_blank(&self) -> bool {\n        self.trimmed().len() == 0\n    }\n}\n\nfn main() {\n    let raw = String::from(\"   \");\n    let p = Parser { input: &raw };\n    println!(\"{} {}\", p.is_blank(), p.input.len());\n}",
        output: 'true 3',
        explanation:
          'trimmed returns an empty view of raw, so is_blank is true, while input still covers all 3 spaces.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Header<\'a> {\n    name: &\'a str,\n    value: &\'a str,\n}\n\nimpl<\'a> Header<\'a> {\n    fn longest(&self) -> &\'a str {\n        if self.name.len() >= self.value.len() {\n            self.name\n        } else {\n            self.value\n        }\n    }\n}\n\nfn main() {\n    let line = String::from("host");\n    let val = String::from("example");\n    let h = Header { name: &line, value: &val };\n    println!("{}", h.longest());\n}',
          ['host', '7', 'hostexample', 'example'],
          3,
          'value is longer (7 bytes against 4), so longest returns the borrow of val.',
        ),
        choose(
          "In impl<'a> Parser<'a>, what does fn input(&self) -> &'a str promise?",
          [
            'The result is a new String owned by the caller',
            'The result borrows the original text, not the Parser',
            'The Parser must live for the whole program',
            'The result expires as soon as the method returns',
          ],
          1,
          "'a is the lifetime of the borrowed text, so the result is valid as long as that text is.",
        ),
        choose(
          "Which impl header matches struct Window<'a> { data: &'a str }?",
          [
            'impl Window',
            "impl Window<'a>",
            "impl<'a> Window<'a>",
            "impl<'a> Window",
          ],
          2,
          'The lifetime must be declared after impl and then applied to the type.',
        ),
        predictOutput(
          'What is the output of this program?',
          "struct Window<'a> {\n    data: &'a str,\n}\n\nimpl<'a> Window<'a> {\n    fn shrink(&self) -> Window<'a> {\n        Window { data: self.data.trim() }\n    }\n}\n\nfn main() {\n    let s = String::from(\"  mid  \");\n    let w = Window { data: &s };\n    let n = w.shrink();\n    println!(\"{} {}\", w.data.len(), n.data.len());\n}",
          ['3 3', '7 7', '5 3', '7 3'],
          3,
          'shrink makes a new Window over the trimmed part of the same String; the original still covers all 7 bytes.',
        ),
      ],
    },
  ],
  'rust-static': [
    {
      title: "String literals are &'static str",
      explanation: [
        'A string literal such as "ready" is stored inside the compiled program, so it exists for the whole run. Its type is &\'static str: a borrow that is valid for the entire program.',
        'That is why a function can return a literal without any input reference, while it could never return a borrow of a local String, which is dropped when the function ends.',
      ],
      example: {
        language: 'rust',
        code: 'fn level_name(level: u32) -> &\'static str {\n    if level >= 10 {\n        "expert"\n    } else if level >= 3 {\n        "regular"\n    } else {\n        "new"\n    }\n}\n\nfn main() {\n    println!("{} {} {}", level_name(2), level_name(3), level_name(12));\n}',
        output: 'new regular expert',
        explanation:
          'Every branch returns a literal, so the static return type is satisfied for each input.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn size_name(bytes: u32) -> &\'static str {\n    if bytes > 1000 {\n        "large"\n    } else if bytes > 100 {\n        "medium"\n    } else {\n        "small"\n    }\n}\n\nfn main() {\n    println!("{} {} {}", size_name(100), size_name(1000), size_name(1001));\n}',
          [
            'small medium large',
            'medium large large',
            'small small large',
            'medium medium large',
          ],
          0,
          'The comparisons are strict: 100 is not above 100, 1000 is above 100 but not above 1000.',
        ),
        choose(
          'Why can fn name() -> &\'static str { "crab" } return a reference with no input?',
          [
            'The literal is copied into a new String on return',
            'Returning a literal moves it onto the caller’s stack',
            "'static extends the life of a local variable",
            'The literal’s bytes live in the program for the whole run',
          ],
          3,
          'Literals are part of the compiled program, so a borrow of one never dangles.',
        ),
        choose(
          "Which body fits the return type &'static str?",
          [
            'let s = String::from("done"); &s',
            'String::from("done")',
            '"done"',
            'let s = String::from("done"); s.trim()',
          ],
          2,
          'Only the literal lives for the whole program. The others either return an owned String or borrow a local that is dropped.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn pick(on: bool) -> &\'static str {\n    if on {\n        "on"\n    } else {\n        "off"\n    }\n}\n\nfn main() {\n    let a = pick(true);\n    let b = pick(false);\n    let mut owned = String::from(b);\n    owned.push_str(a);\n    println!("{} {}", owned, owned.len());\n}',
          ['offon 5', 'onoff 5', 'offon 4', 'off 3'],
          0,
          'owned starts as a copy of off and then has on appended, for 5 bytes.',
        ),
      ],
    },
    {
      title: 'A static borrow fits where a shorter one is expected',
      explanation: [
        "A &'static str is valid everywhere, so it can be returned or stored wherever a shorter-lived &str is expected. A function returning a borrow of its input may also return a literal in some branches.",
        "The reverse is not allowed: a borrowed parameter cannot be returned as &'static str, because the caller’s String might be dropped long before the program ends.",
      ],
      example: {
        language: 'rust',
        code: 'fn display_name(name: &str) -> &str {\n    if name.len() == 0 {\n        "anonymous"\n    } else {\n        name\n    }\n}\n\nfn main() {\n    let empty = String::from("");\n    let given = String::from("Ada");\n    println!("{} {}", display_name(&empty), display_name(&given));\n}',
        output: 'anonymous Ada',
        explanation:
          'The result is tied to name, and the literal anonymous is valid even longer, so either branch may be returned.',
      },
      questions: [
        choose(
          "Why is fn echo(text: &str) -> &'static str { text } rejected?",
          [
            'A function returning &str cannot take a &str argument',
            'text may point into a String dropped before the program ends',
            "'static references must be created with String::from",
            'text would need to be mut to be returned',
          ],
          1,
          'The caller may pass a borrow of a short-lived String, which cannot be promised for the whole program.',
        ),
        predictOutput(
          'What does this program print?',
          'fn label(code: &str) -> &str {\n    if code == "" {\n        "none"\n    } else {\n        code.trim()\n    }\n}\n\nfn main() {\n    let a = String::from(" x1 ");\n    let b = String::from("");\n    println!("[{}] [{}]", label(&a), label(&b));\n}',
          ['[x1] [none]', '[ x1 ] [none]', '[x1] []', '[none] [x1]'],
          0,
          'a is trimmed to x1, and the empty b is replaced by the literal none.',
        ),
        choose(
          'A function returns a &str borrowed from its input, but returns the literal "n/a" in one branch. Why does that compile?',
          [
            'Literals are converted to String before being returned',
            "A &'static str can be used where a shorter-lived &str is expected",
            'The compiler copies the input into static memory',
            'Returning a literal turns off lifetime checking for the function',
          ],
          1,
          'A borrow that lives longer than required is always acceptable in place of a shorter one.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn grade(score: u32) -> &\'static str {\n    if score >= 90 {\n        "A"\n    } else if score >= 80 {\n        "B"\n    } else {\n        "C"\n    }\n}\n\nfn main() {\n    let mut report = String::from("grades:");\n    report.push_str(grade(85));\n    report.push_str(grade(90));\n    report.push_str(grade(79));\n    println!("{}", report);\n}',
          ['grades:ABC', 'grades:BBC', 'grades:CAB', 'grades:BAC'],
          3,
          '85 is a B, 90 reaches the A threshold, and 79 is below both, giving B, A, C in call order.',
        ),
      ],
    },
  ],
  'rust-closure-capture': [
    {
      title: 'A closure can read variables from its scope',
      explanation: [
        'let award = |points| points + bonus; defines an anonymous function. Its parameters go between the pipes, and their types are usually inferred from how it is called.',
        'Unlike a named fn, a closure may use local variables that are in scope where it is written, such as bonus. Reading a variable borrows it; the closure does not copy or take it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let bonus = 5;\n    let award = |points| points + bonus;\n    println!("{} {}", award(10), award(1));\n}',
        output: '15 6',
        explanation: 'Each call adds the captured bonus to its own argument.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let factor = 3;\n    let offset = 2;\n    let scale = |x| x * factor + offset;\n    println!("{}", scale(4));\n}',
          ['14', '20', '18', '12'],
          0,
          'The closure uses both captured values: 4 * 3 + 2.',
        ),
        choose(
          'Why can a closure use the local variable bonus when a nested fn item cannot?',
          [
            'Closures run before local variables are created',
            'Closures capture variables from their surrounding scope',
            'A closure copies every local variable in main',
            'A nested fn can read locals only if they are mut',
          ],
          1,
          'Capturing the environment is what distinguishes a closure from an ordinary function item.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let sep = String::from("-");\n    let join = |a, b| format!("{}{}{}", a, sep, b);\n    println!("{}", join(1, 2));\n    println!("{}", sep);\n}',
          ['1-2', '12\n-', '1 - 2\n-', '1-2\n-'],
          3,
          'The closure only reads sep, so sep is still usable by main afterwards.',
        ),
        choose(
          'let show = |x| x + base; only reads base, and main uses base again later. What does the closure hold?',
          [
            'Ownership of base, moved in',
            'A mutable borrow of base',
            'A shared borrow of base',
            'Nothing until show is first called',
          ],
          2,
          'A closure that only reads a variable captures it by shared borrow, the least it needs.',
        ),
      ],
    },
    {
      title: 'A captured borrow lasts while the closure is used',
      explanation: [
        'The borrow starts when the closure is created and lasts until the closure’s last call. During that time the variable can still be read, but it cannot be moved away.',
        'After the closure is no longer used, the borrow is over and the variable can be moved as usual.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let name = String::from("Ivy");\n    let greet = |greeting| format!("{}, {}", greeting, name);\n    println!("{}", greet("Hi"));\n    println!("{}", greet("Bye"));\n    let moved = name;\n    println!("{}", moved);\n}',
        output: 'Hi, Ivy\nBye, Ivy\nIvy',
        explanation:
          'greet is last used before the move, so moving name afterwards is allowed.',
      },
      questions: [
        choose(
          'Why is this program rejected?',
          [
            'greet must be declared mut to be called',
            'name is moved while greet still borrows it',
            'Closures cannot capture a String',
            'format! cannot be used inside a closure',
          ],
          1,
          'greet is called after the move, so its borrow of name is still active when name moves.',
          'fn main() {\n    let name = String::from("Ivy");\n    let greet = |g| format!("{} {}", g, name);\n    let moved = name;\n    println!("{}", greet("Hi"));\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let low = 10;\n    let high = 20;\n    let span = |extra| high - low + extra;\n    println!("{} {}", span(0), span(5));\n}',
          ['10 15', '30 35', '10 10', '-10 -5'],
          0,
          'Both calls see the same captured values: 20 - 10, then plus each extra.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let word = String::from("tree");\n    let longer = |n| word.len() + n;\n    let total = longer(1) + longer(2);\n    println!("{} {}", total, word);\n}',
          ['11 tree', '7 tree', '11', '8 tree'],
          0,
          'Each call reads the 4-byte word: 5 + 6 is 11, and word is still owned by main.',
        ),
        choose(
          'A closure only reads a captured String. What may main do with that String while the closure will still be called?',
          [
            'Nothing at all; the closure owns it',
            'Move it, since the closure kept its own copy',
            'Modify it, since the closure only reads',
            'Read it, but not move it',
          ],
          3,
          'A shared borrow allows other reads but forbids moving or modifying the value until the borrow ends.',
        ),
      ],
    },
  ],
  'rust-fn-bound': [
    {
      title: 'Accept a closure with an Fn bound',
      explanation: [
        'Every closure has its own unnamed type, so a function that takes one is generic: fn apply<F: Fn(i32) -> i32>(f: F, x: i32). The bound gives the argument and return types, and allows calls like f(x) in the body.',
        'Named functions satisfy the same bound, so apply(square, 4) works as well as apply(|n| n + 1, 4).',
      ],
      example: {
        language: 'rust',
        code: 'fn apply_twice<F: Fn(i32) -> i32>(f: F, start: i32) -> i32 {\n    f(f(start))\n}\n\nfn main() {\n    let offset = 10;\n    println!("{}", apply_twice(|n| n + offset, 1));\n}',
        output: '21',
        explanation:
          'The closure adds the captured offset, and apply_twice calls it on its own result: 1, 11, 21.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn thrice<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {\n    f(f(f(x)))\n}\n\nfn main() {\n    println!("{}", thrice(|n| n * 2, 3));\n}',
          ['18', '12', '48', '24'],
          3,
          'Doubling three times takes 3 to 6, 12, and 24.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {\n    f(x) + 1\n}\n\nfn main() {\n    println!("{} {}", apply(square, 4), apply(|n| n - 1, 4));\n}',
          ['16 3', '17 4', '25 4', '17 3'],
          1,
          'A named function and a closure both satisfy the bound: 16 + 1 and 3 + 1.',
        ),
        choose(
          'Which bound describes a callable that takes two i32 values and returns a bool?',
          [
            'F: Fn((i32, i32), bool)',
            'F: Fn -> bool(i32, i32)',
            'F: bool(i32, i32)',
            'F: Fn(i32, i32) -> bool',
          ],
          3,
          'The parameter types go in parentheses after Fn, and the return type follows the arrow.',
        ),
        choose(
          'Why is a closure parameter declared with a generic F rather than a concrete type?',
          [
            'Closure types are decided at run time',
            'Closures always have the same type as fn items',
            'Every closure has its own unnamed type',
            'A concrete type would copy the captured values',
          ],
          2,
          'No closure type can be written by name, so the function names it through a bound instead.',
        ),
      ],
    },
    {
      title: 'Fn callables can be called again and again',
      explanation: [
        'Calling an Fn only needs a shared borrow of it, so the function may call f as many times as it likes. In exchange, the closure may only read what it captured.',
        'A closure that changes a captured variable does not satisfy Fn, and passing one to a parameter bounded by Fn is rejected.',
      ],
      example: {
        language: 'rust',
        code: 'fn count_true<F: Fn(i32) -> bool>(test: F, values: [i32; 3]) -> i32 {\n    let a = if test(values[0]) { 1 } else { 0 };\n    let b = if test(values[1]) { 1 } else { 0 };\n    let c = if test(values[2]) { 1 } else { 0 };\n    a + b + c\n}\n\nfn main() {\n    let limit = 5;\n    println!("{}", count_true(|n| n > limit, [3, 8, 6]));\n}',
        output: '2',
        explanation:
          'The same closure is called three times; 8 and 6 are above the captured limit.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn both<F: Fn(i32) -> bool>(check: F, a: i32, b: i32) -> bool {\n    check(a) && check(b)\n}\n\nfn main() {\n    let max = 9;\n    println!("{} {}", both(|n| n <= max, 3, 9), both(|n| n <= max, 4, 12));\n}',
          ['true false', 'true true', 'false false', 'false true'],
          0,
          '3 and 9 are both at most 9; in the second call 12 is not.',
        ),
        choose(
          'Which closure is rejected by a parameter bounded F: Fn(i32) -> i32?',
          [
            '|n| n + offset, where offset is a captured i32',
            '|n| { total += n; total }, with total captured',
            '|n| n * n, which captures nothing at all',
            '|n| n - limit, where limit is a captured i32',
          ],
          1,
          'Only that closure changes a captured variable, which Fn does not allow.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn sum_mapped<F: Fn(i32) -> i32>(f: F, values: [i32; 3]) -> i32 {\n    f(values[0]) + f(values[1]) + f(values[2])\n}\n\nfn main() {\n    let bonus = 1;\n    println!("{}", sum_mapped(|v| v * 10 + bonus, [1, 2, 3]));\n}',
          ['61', '60', '66', '63'],
          3,
          'Each of the three calls adds the bonus: 11 + 21 + 31.',
        ),
        choose(
          'Why may the body of fn twice<F: Fn(i32) -> i32>(f: F, x: i32) call f more than once?',
          [
            'Each call makes a fresh copy of the closure',
            'Fn closures cannot capture anything',
            'Calling an Fn only needs a shared borrow of f',
            'The bound turns f into a named function',
          ],
          2,
          'An Fn call leaves the closure unchanged, so nothing prevents calling it again.',
        ),
      ],
    },
  ],
  'rust-fn-mut': [
    {
      title: 'A closure that changes its capture must be mut',
      explanation: [
        'If a closure assigns to a captured variable, as in || clicks += 1, it captures that variable by mutable borrow. Calling it changes the closure’s state, so the closure binding must be declared let mut.',
        'While the closure will still be called, nothing else may read the variable. After its last call, the borrow ends and the variable shows every change.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut clicks = 0;\n    let mut click = || clicks += 1;\n    click();\n    click();\n    click();\n    println!("{}", clicks);\n}',
        output: '3',
        explanation:
          'Each call adds 1 through the mutable borrow, and clicks is read only after the last call.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut total = 10;\n    let mut spend = |amount| total -= amount;\n    spend(3);\n    spend(4);\n    println!("{}", total);\n}',
          ['10', '3', '7', '17'],
          1,
          'Both calls change the captured total: 10 - 3 - 4.',
        ),
        choose(
          'count is declared let mut, yet let tick = || count += 1; tick(); is rejected. Why?',
          [
            'Closures cannot change captured variables at all',
            'count must be passed as an argument instead',
            'tick must return the new count to compile',
            'Calling a mutating closure needs let mut tick',
          ],
          3,
          'The call changes state held by the closure, so the closure itself must be mutable.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let mut log = String::new();\n    let mut record = |word: &str| {\n        log.push_str(word);\n        log.push_str(";");\n    };\n    record("a");\n    record("bc");\n    println!("{} {}", log, log.len());\n}',
          ['abc 3', 'a;bc 4', 'a;bc; 5', 'bc; 3'],
          2,
          'Each call appends a word and a semicolon to the captured String.',
        ),
        choose(
          'Why is this program rejected?',
          [
            'inc may only be called once per program',
            'println! cannot read an integer a closure captured',
            'n is read while inc still mutably borrows it',
            'n must be declared after inc to be captured',
          ],
          2,
          'inc is called again after the println!, so its mutable borrow is still active when n is read.',
          'fn main() {\n    let mut n = 0;\n    let mut inc = || n += 1;\n    inc();\n    println!("{}", n);\n    inc();\n}',
        ),
      ],
    },
    {
      title: 'Accept a mutating closure with FnMut',
      explanation: [
        'A function that calls a mutating closure bounds it by FnMut and takes the parameter as mut f, because each call may change the closure’s state.',
        'FnMut is the looser bound: it accepts closures that mutate captures and also closures that only read. Fn accepts only the latter.',
      ],
      example: {
        language: 'rust',
        code: 'fn each<F: FnMut(i32)>(values: &[i32], mut f: F) {\n    for &v in values {\n        f(v);\n    }\n}\n\nfn main() {\n    let mut largest = 0;\n    each(&[4, 9, 2], |v| {\n        if v > largest {\n            largest = v;\n        }\n    });\n    println!("{}", largest);\n}',
        output: '9',
        explanation:
          'each calls the closure once per element, and the closure updates the captured largest.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn visit<F: FnMut(i32)>(values: &[i32], mut f: F) {\n    for &v in values {\n        f(v);\n    }\n}\n\nfn main() {\n    let mut big = 0;\n    visit(&[1, 2, 4, 7, 8], |v| {\n        if v > 3 {\n            big += 1;\n        }\n    });\n    println!("{}", big);\n}',
          ['2', '5', '3', '4'],
          2,
          'The closure counts the values above 3: 4, 7, and 8.',
        ),
        choose(
          'Which bound accepts both |x| total += x and |x| println!("{}", x)?',
          [
            'F: FnMut(i32)',
            'F: Fn(i32)',
            'F: Fn(i32) -> i32',
            'F: FnMut(i32) -> bool',
          ],
          0,
          'Fn rejects the mutating closure, and both closures return (), so FnMut(i32) is the bound that fits both.',
        ),
        choose(
          'What is wrong with fn run<F: FnMut()>(f: F) { f(); }?',
          [
            'The bound must be Fn instead of FnMut',
            'f must be passed as &F',
            'The parameter must be declared mut f',
            'The function must return the closure',
          ],
          2,
          'Calling an FnMut needs mutable access to it, so the parameter binding must be mutable.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn feed<F: FnMut(i32)>(values: &[i32], mut sink: F) {\n    for &v in values {\n        sink(v);\n    }\n}\n\nfn main() {\n    let mut sum = 0;\n    let mut calls = 0;\n    feed(&[5, -2, 6], |v| {\n        sum += v;\n        calls += 1;\n    });\n    println!("{} {}", sum, calls);\n}',
          ['13 3', '9 2', '9 3', '11 3'],
          2,
          'The closure runs once per element, adding 5 - 2 + 6 and counting three calls.',
        ),
      ],
    },
  ],
  'rust-fn-once': [
    {
      title: 'A closure that gives away its capture runs once',
      explanation: [
        'move before a closure makes it take ownership of what it captures. If the body then moves a captured value out, for example by returning it, the closure can be called only once: after that call, it no longer has the value.',
        'Using move alone does not limit the number of calls. A move closure that only reads its captured value can be called again and again.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let ticket = String::from("seat 12A");\n    let redeem = move || ticket;\n    let used = redeem();\n    println!("{}", used);\n}',
        output: 'seat 12A',
        explanation:
          'redeem owns ticket and returns it, handing ownership to used. A second redeem() would be rejected.',
      },
      questions: [
        choose(
          'What happens with this program?',
          [
            'It compiles, and a and b both hold "hi"',
            'It compiles, and b holds an empty String',
            'It compiles but panics on the second call',
            'It is rejected: the first call moved note out',
          ],
          3,
          'give returns its captured String, so it can be called only once; the compiler rejects the second call.',
          'fn main() {\n    let note = String::from("hi");\n    let give = move || note;\n    let a = give();\n    let b = give();\n}',
        ),
        choose(
          'Which closure can be called only once?',
          [
            'move || data, returning the captured String',
            '|| data.len(), reading the captured String',
            '|n| n + 1, capturing nothing',
            'move || data.len(), reading the moved String',
          ],
          0,
          'Only the closure that hands its String to the caller loses it on the first call.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let label = String::from("box");\n    let size = move || label.len();\n    println!("{} {}", size(), size());\n}',
          ['3 0', '0 3', '3 3', '3'],
          2,
          'size owns label but only reads it, so every call sees the same 3-byte String.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let message = String::from("ping");\n    let send = move || {\n        let sent = message;\n        sent.len() * 2\n    };\n    println!("{}", send());\n}',
          ['8', '4', '16', '0'],
          0,
          'The single call moves message into sent and doubles its length of 4.',
        ),
      ],
    },
    {
      title: 'Take FnOnce when you call the closure once',
      explanation: [
        'fn run_once<F: FnOnce() -> String>(job: F) -> String { job() } promises to call job at most once, so it can accept every closure, including those that give away their captures.',
        'Closures that satisfy Fn or FnMut satisfy FnOnce too, which makes FnOnce the most accepting bound. The price is that the body cannot call the closure a second time.',
      ],
      example: {
        language: 'rust',
        code: 'fn run_once<F: FnOnce() -> String>(job: F) -> String {\n    job()\n}\n\nfn main() {\n    let draft = String::from("report");\n    let result = run_once(move || draft);\n    println!("{} ready", result);\n}',
        output: 'report ready',
        explanation:
          'The closure returns its captured String, which is only allowed because run_once calls it once.',
      },
      questions: [
        choose(
          'What does the compiler say about fn twice<F: FnOnce() -> u32>(f: F) -> u32 { f() + f() }?',
          [
            'It is rejected: the first call consumes f',
            'It compiles; FnOnce allows any number of calls',
            'It compiles, but the second call returns 0',
            'It is rejected: FnOnce closures cannot return u32',
          ],
          0,
          'An FnOnce call takes the closure by value, so f is gone after the first call.',
        ),
        choose(
          'A function calls its closure argument exactly once. Which bound accepts the most closures?',
          ['Fn', 'FnOnce', 'FnMut', 'fn() (a function pointer)'],
          1,
          'Every closure implements FnOnce, while Fn and FnMut exclude closures that consume or mutate captures.',
        ),
        predictOutput(
          'What does this program print?',
          'fn consume<F: FnOnce() -> String>(f: F) -> usize {\n    f().len()\n}\n\nfn main() {\n    let a = String::from("abc");\n    let b = String::from("de");\n    println!("{}", consume(move || a) + consume(|| String::from("xyz")) + b.len());\n}',
          ['6', '8', '5', '7'],
          1,
          'The two closures produce Strings of lengths 3 and 3, and b adds 2.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn once<F: FnOnce(i32) -> i32>(f: F, x: i32) -> i32 {\n    f(x)\n}\n\nfn main() {\n    let step = 4;\n    println!("{} {}", once(|n| n + step, 1), once(|n| n * step, 2));\n}',
          ['5 6', '4 8', '8 5', '5 8'],
          3,
          'Closures that only read their captures are accepted by FnOnce too: 1 + 4 and 2 * 4.',
        ),
      ],
    },
  ],
  'rust-iterator-lazy': [
    {
      title: 'Adapters wait until something consumes them',
      explanation: [
        'values.iter().map(|n| n * 2) does not double anything yet. It builds an iterator that describes the work, and the closure has not run.',
        'A consuming method such as sum, count, or a for loop pulls items through, and only then do the adapter closures run. An iterator that is never consumed does no work at all.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let values = [1, 2, 3];\n    let doubled = values.iter().map(|n| {\n        println!("doubling {}", n);\n        n * 2\n    });\n    println!("built");\n    let total: i32 = doubled.sum();\n    println!("total {}", total);\n}',
        output: 'built\ndoubling 1\ndoubling 2\ndoubling 3\ntotal 12',
        explanation:
          'Creating doubled prints nothing; the closure runs only when sum pulls each item.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let nums = [5, 6];\n    let steps = nums.iter().map(|n| {\n        println!("saw {}", n);\n        n + 1\n    });\n    println!("ready");\n    let count = steps.count();\n    println!("{}", count);\n}',
          [
            'saw 5\nsaw 6\nready\n2',
            'ready\nsaw 5\nsaw 6\n2',
            'ready\n2',
            'saw 5\nsaw 6\n2\nready',
          ],
          1,
          'Nothing runs until count consumes the iterator, after ready has been printed.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let values = [1, 2, 3];\n    let _plan = values.iter().map(|n| {\n        println!("work {}", n);\n        n * 10\n    });\n    println!("end");\n}',
          [
            'work 1\nwork 2\nwork 3\nend',
            'end\nwork 1\nwork 2\nwork 3',
            'work 1\nend',
            'end',
          ],
          3,
          '_plan is never consumed, so the closure never runs.',
        ),
        choose(
          'What makes values.iter().map(|n| n * n) actually run its closure?',
          [
            'Binding the iterator to a variable with let',
            'Adding another .map after it',
            'Creating it inside a function',
            'Consuming it, for example with sum or count',
          ],
          3,
          'Adapters only describe work; a consumer drives it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let prices = [3, 4, 5];\n    let fee = 2;\n    let total: i32 = prices.iter().map(|p| p + fee).sum();\n    println!("{}", total);\n}',
          ['18', '14', '16', '12'],
          0,
          'sum consumes the iterator, and the fee is added to each of the three prices: 5 + 6 + 7.',
        ),
      ],
    },
    {
      title: 'Items flow one at a time through the chain',
      explanation: [
        'A consumer pulls one item through every adapter before asking for the next. With two maps, the first item passes both maps before the second item enters the first map.',
        'take(n) stops pulling after n items, so the items after them never reach the earlier adapters at all.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let total: i32 = [1, 2]\n        .iter()\n        .map(|n| {\n            println!("a{}", n);\n            n + 1\n        })\n        .map(|n| {\n            println!("b{}", n);\n            n * 10\n        })\n        .sum();\n    println!("{}", total);\n}',
        output: 'a1\nb2\na2\nb3\n50',
        explanation:
          'Item 1 goes through a and b before item 2 starts. The results 20 and 30 add to 50.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [4, 5, 6, 7];\n    let total: i32 = values\n        .iter()\n        .map(|n| {\n            println!("visit {}", n);\n            n * 2\n        })\n        .take(2)\n        .sum();\n    println!("{}", total);\n}',
          [
            'visit 4\nvisit 5\nvisit 6\nvisit 7\n18',
            'visit 4\nvisit 5\nvisit 6\nvisit 7\n44',
            'visit 4\nvisit 5\n18',
            '18',
          ],
          2,
          'take(2) stops after two items, so map only ever sees 4 and 5.',
        ),
        choose(
          'In .map(f).map(g).sum() over the items x and y, in what order do the closures run?',
          [
            'f(x), f(y), g(x), g(y)',
            'g(x), g(y), f(x), f(y)',
            'f(x), g(x), f(y), g(y)',
            'g(x), f(x), g(y), f(y)',
          ],
          2,
          'Each item travels through the whole chain before the next item is pulled.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let count = [7, 8, 9]\n        .iter()\n        .map(|n| {\n            print!("{} ", n);\n            n\n        })\n        .take(2)\n        .count();\n    println!("-> {}", count);\n}',
          ['7 8 9 -> 2', '7 8 -> 2', '-> 2', '7 8 -> 3'],
          1,
          'Only two items are pulled, so the closure prints 7 and 8, and count is 2.',
        ),
        choose(
          'Why does the statement values.iter().map(|n| n * 2); on its own line draw a compiler warning?',
          [
            'map must always be followed by collect',
            'Closures in map cannot multiply references',
            'The iterator is never consumed, so the map does nothing',
            'iter borrows values, which is not allowed in a statement',
          ],
          2,
          'The compiler flags unused iterators because their adapters will never run.',
        ),
      ],
    },
  ],
  'rust-map-filter': [
    {
      title: 'filter keeps items whose test is true',
      explanation: [
        'filter(|n| *n > 4) passes each item to the closure by reference and keeps the item only when the closure returns true. Kept items stay in their original order.',
        'The examples call .iter().copied() first, which turns the &i32 items of a slice into plain i32 values. filter still hands each one over by reference, so the test reads it through *n. collect then gathers the kept items into a Vec.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let temps = [12, 25, 18, 30];\n    let warm: Vec<i32> = temps.iter().copied().filter(|t| *t >= 18).collect();\n    println!("{:?}", warm);\n}',
        output: '[25, 18, 30]',
        explanation:
          'Only 12 fails the test. The kept values appear in the same order as in temps.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [5, 1, 8, 3, 9];\n    let kept: Vec<i32> = values.iter().copied().filter(|n| *n > 4).collect();\n    println!("{:?}", kept);\n}',
          ['[1, 3]', '[5, 8, 9]', '[9, 8, 5]', '[8, 9]'],
          1,
          'filter keeps 5, 8, and 9 in their original order; 5 counts because 5 > 4.',
        ),
        choose(
          'What does filter do with an item when its closure returns false?',
          [
            'Stops the whole iteration immediately',
            'Leaves it out and moves on to the next item',
            'Replaces it with a default value',
            'Moves it to the end of the output',
          ],
          1,
          'filter skips rejected items and keeps pulling, so later items are still tested.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let words = ["tea", "", "cake", "", "jam"];\n    let filled = words.iter().filter(|w| w.len() > 0).count();\n    println!("{}", filled);\n}',
          ['5', '2', '3', '4'],
          2,
          'The two empty strings fail the test, leaving three words to count.',
        ),
        choose(
          'In .iter().copied().filter(|n| *n > 0), why does the test write *n?',
          [
            'copied turns each item into a reference',
            'filter passes each item to its closure by reference',
            'n is a mutable borrow that must be released',
            'The * converts n from u32 to i32',
          ],
          1,
          'filter only lends the item to the test, so the closure receives a reference and dereferences it to compare.',
        ),
      ],
    },
    {
      title: 'map transforms, and the order of steps matters',
      explanation: [
        'map(|n| n * 10) replaces each item with the closure’s result. Chained with filter, each step sees what the previous step produced.',
        'So .filter(p).map(f) tests the original values, while .map(f).filter(p) tests the transformed ones, and the two orders can keep different items.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let values = [1, 2, 3, 4];\n    let a: Vec<i32> = values.iter().copied().filter(|n| *n > 2).map(|n| n * 10).collect();\n    let b: Vec<i32> = values.iter().copied().map(|n| n * 10).filter(|n| *n > 2).collect();\n    println!("{:?} {:?}", a, b);\n}',
        output: '[30, 40] [10, 20, 30, 40]',
        explanation:
          'In a, the test sees 1 to 4 and keeps 3 and 4. In b, it sees 10 to 40 and keeps all of them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let scores = [4, 7, 2, 9];\n    let total: i32 = scores.iter().copied().map(|s| s * 2).filter(|s| *s > 8).sum();\n    println!("{}", total);\n}',
          ['18', '44', '32', '16'],
          2,
          'Doubling gives 8, 14, 4, 18; the test then keeps 14 and 18.',
        ),
        choose(
          'You want the doubled values of only the negative numbers. Which chain is correct?',
          [
            '.map(|n| n * 2).filter(|n| *n > 0)',
            '.filter(|n| *n < 0).map(|n| n * 2)',
            '.map(|n| n * 2)',
            '.filter(|n| *n > 0).map(|n| n * 2)',
          ],
          1,
          'Test the original sign first, then transform only the survivors.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let words = ["ox", "bee", "ant", "eel", "yak"];\n    let kept: Vec<String> = words\n        .iter()\n        .filter(|w| w.len() == 3)\n        .map(|w| format!("{}!", w))\n        .collect();\n    println!("{} {}", kept.len(), kept[0]);\n}',
          ['4 ox!', '4 bee!', '5 bee!', '1 ox!'],
          1,
          'ox is the only word that is not 3 letters long, so four words are kept, the first being bee.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut out = Vec::new();\n    for n in [1, 2, 3, 4, 5].iter().copied().filter(|n| *n != 3).map(|n| n * n) {\n        out.push(n);\n    }\n    println!("{:?}", out);\n}',
          [
            '[1, 4, 9, 16, 25]',
            '[1, 2, 4, 5]',
            '[4, 16, 25]',
            '[1, 4, 16, 25]',
          ],
          3,
          'The for loop consumes the chain: 3 is filtered out, and every other value is squared.',
        ),
      ],
    },
  ],
  'rust-fold': [
    {
      title: 'fold carries an accumulator through every item',
      explanation: [
        'iter.fold(init, |acc, item| next) starts the accumulator at init. For each item, the closure receives the current accumulator and the item and returns the new accumulator; the last one is the result.',
        'For an empty iterator the closure never runs and fold returns init, so init should be the right answer for no items: 0 for a sum, 1 for a product.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let deposits = [20, 5, 10];\n    let balance = deposits.iter().fold(100, |acc, d| acc + d);\n    println!("{}", balance);\n}',
        output: '135',
        explanation: 'The accumulator goes 100, 120, 125, 135.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let product = [2, 5, 3].iter().fold(0, |acc, n| acc * n);\n    println!("{}", product);\n}',
          ['30', '0', '10', '1'],
          1,
          'Starting from 0, every multiplication gives 0 again. A product must start at 1.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let left = [1, 2, 3].iter().fold(10, |acc, n| acc - n);\n    println!("{}", left);\n}',
          ['6', '-4', '16', '4'],
          3,
          'Each item is subtracted from the running value: 10 - 1 - 2 - 3.',
        ),
        choose(
          'What does values.iter().fold(7, |acc, n| acc + n) return when values is empty?',
          ['7', '0', 'None', '1'],
          0,
          'With no items the closure never runs, so the initial accumulator is the result.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let words = ["sun", "moon", "sky"];\n    let letters = words.iter().fold(0, |acc, w| acc + w.len());\n    println!("{}", letters);\n}',
          ['10', '3', '9', '11'],
          0,
          'The lengths 3, 4, and 3 are added to the accumulator one by one.',
        ),
      ],
    },
    {
      title: 'The accumulator can have its own type',
      explanation: [
        'The accumulator’s type comes from init, not from the items. Folding numbers can build a String, or a tuple that tracks two results in a single pass.',
        'The closure must return that same type every time, because its result becomes the next accumulator.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let digits = [3, 1, 4];\n    let text = digits.iter().fold(String::new(), |acc, d| format!("{}{}", acc, d));\n    println!("{}", text);\n}',
        output: '314',
        explanation:
          'The accumulator is a String. Each step appends the next digit to the text built so far.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [4, 6, 8];\n    let stats = values.iter().fold((0, 0), |acc, v| (acc.0 + 1, acc.1 + v));\n    println!("{} {}", stats.0, stats.1);\n}',
          ['18 3', '3 8', '3 18', '2 18'],
          2,
          'The tuple counts items in field 0 and sums them in field 1.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let letters = ["a", "b", "c"];\n    let word = letters.iter().fold(String::new(), |acc, l| format!("{}{}", l, acc));\n    println!("{}", word);\n}',
          ['cba', 'abc', 'a', 'c'],
          0,
          'Each new letter is placed before the text so far, which reverses the order.',
        ),
        choose(
          'In items.iter().fold(String::new(), |acc, x| ...), what must the closure return?',
          [
            'A String, the type of the initial value',
            'The item type of the iterator',
            'A bool deciding whether to continue',
            'Nothing; fold ignores the closure’s result',
          ],
          0,
          'Each result becomes the next accumulator, so it must match the type of init.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let r = [1, 2, 3, 4].iter().fold((0, 1), |acc, n| (acc.0 + n, acc.1 * n));\n    println!("{} {}", r.0, r.1);\n}',
          ['24 10', '10 0', '9 24', '10 24'],
          3,
          'One pass keeps a sum starting at 0 and a product starting at 1.',
        ),
      ],
    },
  ],
  'rust-collect': [
    {
      title: 'collect builds the collection the type asks for',
      explanation: [
        'collect turns an iterator into a collection, and the target type decides which one. The type comes from an annotation such as let v: Vec<u32>, or from collect::<Vec<u32>>() written on the call.',
        'Without either, the compiler cannot tell what to build and rejects the code. The same items can become different collections: &str pieces collect into a String by concatenation.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let squares: Vec<u32> = [1, 2, 3].iter().map(|n| n * n).collect();\n    let word: String = ["r", "u", "s", "t"].iter().copied().collect();\n    println!("{:?} {}", squares, word);\n}',
        output: '[1, 4, 9] rust',
        explanation:
          'The annotations choose a Vec<u32> for the squares and a String for the joined letters.',
      },
      questions: [
        choose(
          'Why is let v = [1, 2].iter().map(|n| n + 1).collect(); rejected?',
          [
            'map results cannot be collected',
            'collect needs the closure to return a String',
            'collect only works on vectors, not arrays',
            'Nothing tells collect which collection to build',
          ],
          3,
          'collect can build many collections, so the target type must be stated.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let parts = ["ab", "", "cd"];\n    let joined: String = parts.iter().copied().filter(|p| p.len() > 0).collect();\n    println!("{} {}", joined, joined.len());\n}',
          ['ab cd 5', 'abcd 3', 'abcd 6', 'abcd 4'],
          3,
          'Collecting &str pieces into a String concatenates them with nothing in between.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let lengths: Vec<usize> = ["one", "three", "five"].iter().map(|w| w.len()).collect();\n    println!("{} {}", lengths[1], lengths.len());\n}',
          ['3 3', '4 3', '5 13', '5 3'],
          3,
          'lengths is [3, 5, 4]; index 1 holds 5, and there are 3 entries.',
        ),
        choose(
          'Which line collects into a Vec<u8> without a separate annotation on v?',
          [
            'let v = bytes.iter().copied().collect();',
            'let v = bytes.iter().copied().collect::<Vec<u8>>();',
            'let v = bytes.iter().copied().collect(Vec<u8>);',
            'let v = Vec<u8>::collect(bytes.iter());',
          ],
          1,
          'The turbofish ::<Vec<u8>> names the target type on the call itself.',
        ),
      ],
    },
    {
      title: 'Collecting Results stops at the first error',
      explanation: [
        'When each item is a Result<T, E>, collecting into Result<Vec<T>, E> gives Ok with all the values if every item succeeds. At the first Err, collection stops and that error is the result.',
        'Because the outcome is a single Result, it combines with ?: inside a function returning Result, collect::<Result<Vec<_>, _>>()? either yields the Vec or returns the error to the caller.',
      ],
      example: {
        language: 'rust',
        code: 'fn checked(n: i32) -> Result<i32, String> {\n    if n < 0 {\n        Err(format!("{} is negative", n))\n    } else {\n        Ok(n * 2)\n    }\n}\n\nfn main() {\n    let all: Result<Vec<i32>, String> = [3, -1, 4, -9].iter().map(|n| checked(*n)).collect();\n    match all {\n        Ok(values) => println!("{:?}", values),\n        Err(e) => println!("error: {}", e),\n    }\n}',
        output: 'error: -1 is negative',
        explanation:
          'The second item fails, so the whole collection is that Err; -9 is never reached.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn checked(n: i32) -> Result<i32, String> {\n    if n < 0 {\n        Err(format!("{} is negative", n))\n    } else {\n        Ok(n * 2)\n    }\n}\n\nfn main() {\n    let all: Result<Vec<i32>, String> = [1, 0, 3].iter().map(|n| checked(*n)).collect();\n    match all {\n        Ok(values) => {\n            let sum: i32 = values.iter().sum();\n            println!("sum {}", sum);\n        }\n        Err(e) => println!("error: {}", e),\n    }\n}',
          ['sum 4', 'error: 0 is negative', 'sum 6', 'sum 8'],
          3,
          'Every item succeeds, so the Vec holds 2, 0, and 6.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn digit(s: &str) -> Result<i32, String> {\n    println!("parsing {}", s);\n    match s.parse::<i32>() {\n        Ok(n) => Ok(n),\n        Err(_) => Err(format!("bad {}", s)),\n    }\n}\n\nfn main() {\n    let result: Result<Vec<i32>, String> = ["7", "x", "9"].iter().map(|s| digit(s)).collect();\n    match result {\n        Ok(v) => println!("{}", v.len()),\n        Err(e) => println!("{}", e),\n    }\n}',
          [
            'parsing 7\nparsing x\nparsing 9\nbad x',
            'parsing 7\nparsing x\nbad x',
            'parsing 7\nparsing x\nparsing 9\n2',
            'bad x',
          ],
          1,
          'collect stops pulling at the first Err, so 9 is never parsed.',
        ),
        choose(
          'Collecting the items Ok(1), Err("a"), Err("b") into Result<Vec<i32>, &str> gives what?',
          ['Err("b")', 'Ok([1])', 'Ok([1, 0, 0])', 'Err("a")'],
          3,
          'The first error encountered becomes the result; later items are not examined.',
        ),
        choose(
          'Inside a function returning Result, why can xs.iter().map(parse_one).collect::<Result<Vec<i32>, E>>()? use ?',
          [
            '? converts each item to i32 before collecting',
            '? retries failed items until they succeed',
            'collect gave one Result; ? unwraps Ok or returns Err',
            '? turns the iterator into a Vec without allocating',
          ],
          2,
          'The collected value is a single Result, which is exactly what ? works on.',
        ),
      ],
    },
  ],
};
