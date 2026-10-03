import { choose, predictOutput, type KnowledgePointModule } from './authoring';

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
  'rust-module-privacy': [
    {
      title: 'Module items are private unless marked pub',
      explanation: [
        'mod kitchen { ... } groups items under a name. Code outside the module reaches them by path, as kitchen::soup_rating(), but only if the item is declared pub.',
        'Inside the module, every item can use every other item, private or not. That lets a module expose a small public function while keeping its helpers hidden.',
      ],
      example: {
        language: 'rust',
        code: 'mod kitchen {\n    fn secret_spice() -> u32 {\n        3\n    }\n\n    pub fn soup_rating() -> u32 {\n        secret_spice() + 5\n    }\n}\n\nfn main() {\n    println!("{}", kitchen::soup_rating());\n}',
        output: '8',
        explanation:
          'main may call the pub function, and that function may call the private helper because both live in kitchen.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mod scores {\n    fn base() -> u32 {\n        10\n    }\n\n    pub fn doubled() -> u32 {\n        base() * 2\n    }\n\n    pub fn bonus() -> u32 {\n        base() + 1\n    }\n}\n\nfn main() {\n    println!("{} {}", scores::doubled(), scores::bonus());\n}',
          ['10 11', '20 10', '11 20', '20 11'],
          3,
          'Both public functions use the private base, which returns 10.',
        ),
        choose(
          'With the module below, which call compiles inside main?',
          ['bank::balance()', 'bank::audit()', 'audit()', 'balance()'],
          0,
          'Only pub items are reachable from outside, and they are named through the module path.',
          'mod bank {\n    fn audit() -> u32 {\n        1\n    }\n\n    pub fn balance() -> u32 {\n        audit() + 99\n    }\n}',
        ),
        choose(
          'Why may soup_rating call secret_spice although secret_spice is private?',
          [
            'pub on soup_rating makes the whole module public',
            'Any pub function anywhere may call private functions',
            'Private items are visible everywhere inside their own module',
            'secret_spice is defined first, so it counts as public',
          ],
          2,
          'Privacy only restricts access from outside the module; items inside it see each other.',
        ),
        choose(
          'main calls tools::helper(), where helper is declared as fn helper() -> u32 inside mod tools. What happens?',
          [
            'It runs, because main may call anything',
            'It runs, but returns a default value',
            'A warning is printed and the call is skipped',
            'A compile error: helper is private to tools',
          ],
          3,
          'Without pub, helper can only be used from inside tools, and the compiler rejects the outside call.',
        ),
      ],
    },
    {
      title: 'Every module on the path must be visible',
      explanation: [
        'A path such as shop::till::total() works from main only if each step is visible there: till must be pub inside shop, and total must be pub inside till. A pub function inside a private module is still unreachable from outside.',
        'shop itself needs no pub, because it is declared right next to main. A public function in shop can still use its private submodules on the caller’s behalf.',
      ],
      example: {
        language: 'rust',
        code: 'mod shop {\n    pub mod till {\n        pub fn total() -> u32 {\n            42\n        }\n    }\n\n    mod storage {\n        pub fn count() -> u32 {\n            7\n        }\n    }\n\n    pub fn stock() -> u32 {\n        storage::count() * 2\n    }\n}\n\nfn main() {\n    println!("{} {}", shop::till::total(), shop::stock());\n}',
        output: '42 14',
        explanation:
          'till and total are both pub, so main can name the path. storage is private, so main reaches its count only through stock.',
      },
      questions: [
        choose(
          'In the example, why would shop::storage::count() be rejected in main even though count is pub?',
          [
            'storage is private, so main cannot reach into it',
            'count may only be called as storage::count()',
            'A pub fn inside a private module is an error',
            'shop must be marked pub before main can use it',
          ],
          0,
          'Every module along the path has to be visible to the caller, and storage is private to shop.',
        ),
        predictOutput(
          'What does this program print?',
          'mod outer {\n    fn hidden() -> u32 {\n        5\n    }\n\n    pub mod inner {\n        pub fn seven() -> u32 {\n            7\n        }\n    }\n\n    pub fn combined() -> u32 {\n        hidden() + inner::seven()\n    }\n}\n\nfn main() {\n    println!("{} {}", outer::inner::seven(), outer::combined());\n}',
          ['7 5', '12 7', '5 12', '7 12'],
          3,
          'main can reach seven directly, and combined adds the private hidden value to it.',
        ),
        choose(
          'With the modules below, which call can main make?',
          [
            'app::db::connect()',
            'app::ui::refresh()',
            'app::ui::draw()',
            'app::refresh()',
          ],
          1,
          'db is private, draw is private, and refresh lives in ui, not directly in app.',
          'mod app {\n    mod db {\n        pub fn connect() -> u32 {\n            1\n        }\n    }\n\n    pub mod ui {\n        fn draw() -> u32 {\n            2\n        }\n\n        pub fn refresh() -> u32 {\n            3\n        }\n    }\n}',
        ),
        choose(
          'A module has pub fn report() that calls a private fn format_rows() in the same module. What can outside code do?',
          [
            'Call both report and format_rows directly',
            'Call report, which may use format_rows internally',
            'Call neither, since one of them is private',
            'Call format_rows through report::format_rows()',
          ],
          1,
          'Outside code sees only report; the private helper still runs whenever report calls it.',
        ),
      ],
    },
  ],
  'rust-use': [
    {
      title: 'use brings a path into scope under a short name',
      explanation: [
        'use std::cmp::max; lets later code write max(3, 9) instead of std::cmp::max(3, 9). It works for your own modules too: use geometry::area;.',
        'use only introduces a name. It runs nothing and copies nothing, and the name is available only in the module or block where the use line appears.',
      ],
      example: {
        language: 'rust',
        code: 'mod geometry {\n    pub fn area(w: u32, h: u32) -> u32 {\n        w * h\n    }\n}\n\nuse geometry::area;\n\nfn main() {\n    println!("{} {}", area(3, 4), geometry::area(2, 5));\n}',
        output: '12 10',
        explanation:
          'area and geometry::area name the same function; the use line just adds the short name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::cmp::max;\nuse std::cmp::min;\n\nfn main() {\n    let low = min(8, 3);\n    let high = max(8, 3);\n    println!("{} {}", low, high);\n}',
          ['8 3', '3 8', '8 8', '3 3'],
          1,
          'The imported names call std::cmp::min and std::cmp::max, which return the smaller and larger value.',
        ),
        choose(
          'What does use std::cmp::max; do when the program runs?',
          [
            'Nothing at run time; it only makes the name max available',
            'It calls max once to check that the import works',
            'It copies the max function into the current file',
            'It loads std::cmp from disk before main starts',
          ],
          0,
          'use is resolved by the compiler; it only adds a name to the current scope.',
        ),
        predictOutput(
          'What is the output of this program?',
          'mod units {\n    pub fn cm(m: u32) -> u32 {\n        m * 100\n    }\n}\n\nfn first() -> u32 {\n    use units::cm;\n    cm(3)\n}\n\nfn main() {\n    println!("{}", first() + units::cm(2));\n}',
          ['300', '5', '500', '302'],
          2,
          'first uses the short name cm, and main uses the full path; both reach the same function: 300 + 200.',
        ),
        choose(
          'fn a contains use std::cmp::max;, and fn b, defined separately, calls max(1, 2) with no use of its own. What happens?',
          [
            'It compiles, because use applies to the whole file',
            'It compiles, but max returns 0 inside b',
            'b is rejected: the use only applies inside a',
            'b borrows the imported name by calling a first',
          ],
          2,
          'A use inside a function body only adds the name within that block.',
        ),
      ],
    },
    {
      title: 'Rename an import with as',
      explanation: [
        'use metric::convert as to_cm; imports the item under a local name of your choice. This avoids clashes when two modules export the same name, and can shorten a long name.',
        'The alias is just another name for the same item. Importing a type under an alias does not create a new type.',
      ],
      example: {
        language: 'rust',
        code: 'mod metric {\n    pub fn convert(x: u32) -> u32 {\n        x * 100\n    }\n}\n\nmod imperial {\n    pub fn convert(x: u32) -> u32 {\n        x * 12\n    }\n}\n\nuse imperial::convert as to_inches;\nuse metric::convert as to_cm;\n\nfn main() {\n    println!("{} {}", to_cm(2), to_inches(2));\n}',
        output: '200 24',
        explanation:
          'Both modules export convert. The aliases give each one a distinct local name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::cmp::max as larger;\nuse std::cmp::min as smaller;\n\nfn main() {\n    let a = larger(4, 11);\n    let b = smaller(a, 7);\n    println!("{} {}", a, b);\n}',
          ['4 7', '11 4', '11 7', '7 11'],
          2,
          'larger is max, so a is 11; smaller is min, so b is the smaller of 11 and 7.',
        ),
        choose(
          'Modules a and b both export pub fn parse. Which imports let one scope call both by short names?',
          [
            'use a::parse; use b::parse;',
            'use a::parse; use b::parse as parse_b;',
            'use a::parse as parse; use b::parse as parse;',
            'use a::parse as b; use b::parse as a;',
          ],
          1,
          'Two items cannot share one name in a scope, so at least one import needs a distinct alias.',
        ),
        choose(
          'After use std::collections::HashMap as Map;, how are Map and HashMap related?',
          [
            'Map is a new type copied from HashMap',
            'Map is a HashMap that always starts empty',
            'Map is another name for the same HashMap type',
            'Map replaces HashMap throughout the standard library',
          ],
          2,
          'An alias changes only the local name; the type is the same.',
        ),
        predictOutput(
          'What is the output of this program?',
          'mod network {\n    pub mod http {\n        pub fn port() -> u32 {\n            80\n        }\n    }\n}\n\nuse network::http as web;\n\nfn main() {\n    println!("{}", web::port() + network::http::port());\n}',
          ['80', '8080', '160', '0'],
          2,
          'web is an alias for the module network::http, so both paths call the same function: 80 + 80.',
        ),
      ],
    },
  ],
  'rust-reexport': [
    {
      title: 'pub use publishes an item at a new path',
      explanation: [
        'Inside a module, pub use internal::checksum; makes checksum available as library::checksum to outside code, even though the module internal is private.',
        'Callers depend only on that public path, so the module can reorganize its internals later without breaking them. The re-exported item must itself be visible to the module doing the re-export.',
      ],
      example: {
        language: 'rust',
        code: 'mod library {\n    mod internal {\n        pub fn checksum() -> u32 {\n            99\n        }\n    }\n\n    pub use internal::checksum;\n}\n\nfn main() {\n    println!("{}", library::checksum());\n}',
        output: '99',
        explanation:
          'main cannot name library::internal, but the re-export gives checksum a public path one level up.',
      },
      questions: [
        choose(
          'In the example, which call from main is rejected?',
          [
            'library::checksum()',
            'library::internal::checksum()',
            'Neither; both paths are accepted',
            'Both; re-exports cannot be called',
          ],
          1,
          'internal is still private. Only the re-exported path is public.',
        ),
        predictOutput(
          'What does this program print?',
          'mod shapes {\n    mod circle {\n        pub fn area_x100(r: u32) -> u32 {\n            r * r * 314\n        }\n    }\n\n    pub use circle::area_x100 as circle_area;\n}\n\nfn main() {\n    println!("{}", shapes::circle_area(2));\n}',
          ['628', '314', '1256', '2512'],
          2,
          'The re-export renames area_x100 to circle_area; with r = 2 it computes 2 * 2 * 314.',
        ),
        choose(
          'What is the main benefit of pub use internal::checksum; in a library module?',
          [
            'checksum runs once automatically when the module loads',
            'Callers use a short stable path while internals stay private',
            'Every item in internal becomes public too',
            'checksum is copied, so internal can be deleted',
          ],
          1,
          'A re-export separates the public API path from the private module layout.',
        ),
        choose(
          'A parent module writes pub use internal::secret;, where internal contains fn secret() -> u32 without pub. What happens?',
          [
            'It is rejected: a private item cannot be re-exported',
            'It compiles: pub use makes secret public',
            'It compiles, but calls to secret return 0',
            'It compiles only if internal is also pub',
          ],
          0,
          'pub use can only publish items that are visible to the module doing the re-export.',
        ),
      ],
    },
    {
      title: 'Re-export exactly the supported API',
      explanation: [
        'Each pub use publishes one item. Neighboring items in the same private module stay hidden, so a facade module can expose a few functions while everything else remains internal.',
        'Re-exports can be chained: a module may re-export an item that a child module re-exported in turn, so a deeply nested function gets a short public path.',
      ],
      example: {
        language: 'rust',
        code: 'mod engine {\n    mod math {\n        pub fn add(a: u32, b: u32) -> u32 {\n            a + b\n        }\n\n        pub fn scale(a: u32) -> u32 {\n            a * 10\n        }\n    }\n\n    mod text {\n        pub fn label() -> &\'static str {\n            "sum"\n        }\n    }\n\n    pub use math::add;\n    pub use text::label;\n}\n\nfn main() {\n    println!("{} = {}", engine::label(), engine::add(2, 3));\n}',
        output: 'sum = 5',
        explanation:
          'Only add and label are published. scale stays private to engine even though it sits next to add.',
      },
      questions: [
        choose(
          'In the example, which call from main is rejected?',
          [
            'engine::add(1, 1)',
            'engine::label()',
            'engine::scale(4)',
            'engine::add(engine::add(1, 1), 1)',
          ],
          2,
          'scale was never re-exported, and math is private.',
        ),
        predictOutput(
          'What does this program print?',
          'mod outer {\n    mod middle {\n        mod inner {\n            pub fn depth() -> u32 {\n                3\n            }\n        }\n\n        pub use inner::depth;\n    }\n\n    pub use middle::depth;\n}\n\nfn main() {\n    println!("{}", outer::depth() * 2);\n}',
          ['3', '6', '9', '12'],
          1,
          'The chain of re-exports gives inner’s function the short path outer::depth.',
        ),
        predictOutput(
          'What is the output of this program?',
          'mod api {\n    pub mod v1 {\n        pub fn version() -> u32 {\n            1\n        }\n    }\n\n    pub mod v2 {\n        pub fn version() -> u32 {\n            2\n        }\n    }\n\n    pub use v2::version as latest;\n}\n\nfn main() {\n    println!("{} {}", api::latest(), api::v1::version());\n}',
          ['1 2', '2 1', '2 2', '1 1'],
          1,
          'latest is a re-export of v2::version, while v1::version is still reachable by its own path.',
        ),
        choose(
          'A library re-exports pub use parsing::parse; and later moves parse into a module named reader, changing that line to pub use reader::parse;. What must callers who use the re-exported path change?',
          [
            'Nothing; the public path stays the same',
            'Every call, to name reader::parse instead',
            'Their own use lines, to name parsing',
            'They must add a pub use of their own',
          ],
          0,
          'Callers only see the re-exported path, which did not change.',
        ),
      ],
    },
  ],
  'rust-module-paths': [
    {
      title: 'super starts a path at the parent module',
      explanation: [
        'Inside mod shop { pub mod checkout { ... } }, a path beginning with super:: starts at shop, the module that contains checkout. super::super:: goes up two levels.',
        'A child module may use private items of its ancestors, so super::tax() works even though tax has no pub. The reverse does not hold: a parent cannot see its child’s private items.',
      ],
      example: {
        language: 'rust',
        code: 'mod shop {\n    fn tax() -> u32 {\n        2\n    }\n\n    pub mod checkout {\n        pub fn total(price: u32) -> u32 {\n            price + super::tax()\n        }\n    }\n}\n\nfn main() {\n    println!("{}", shop::checkout::total(10));\n}',
        output: '12',
        explanation:
          'super::tax() inside checkout names the private tax in shop, which a child module may use.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mod a {\n    fn level() -> u32 {\n        1\n    }\n\n    pub mod b {\n        fn level() -> u32 {\n            2\n        }\n\n        pub mod c {\n            pub fn sum() -> u32 {\n                super::level() * 10 + super::super::level()\n            }\n        }\n    }\n}\n\nfn main() {\n    println!("{}", a::b::c::sum());\n}',
          ['12', '3', '20', '21'],
          3,
          'From c, super is b (level 2) and super::super is a (level 1), giving 2 * 10 + 1.',
        ),
        choose(
          'Why may code in checkout call super::tax() although tax is private?',
          [
            'super makes every item public for that one call',
            'Private items are visible to the whole program',
            'A child module can see private items of its ancestors',
            'tax is public because it is defined first',
          ],
          2,
          'Privacy hides items from outside a module, but descendants of the module are inside it.',
        ),
        choose(
          'Inside mod parent { mod child { ... } }, a function in child calls super::helper(). Where does the compiler look for helper?',
          [
            'In child itself',
            'In the first external dependency',
            'In parent, the module containing child',
            'In every module, starting from main',
          ],
          2,
          'super always refers to the module one level up from where the path is written.',
        ),
        choose(
          'Can code in outer call a private function declared inside its child module inner?',
          [
            'Yes; parents see everything their children define',
            'Yes, but only through a self:: path',
            'Only if the call is written with super',
            'No; inner’s private items are hidden from its parent',
          ],
          3,
          'Visibility flows down to descendants, not up: an item private to inner is visible only within inner.',
        ),
      ],
    },
    {
      title: 'self names the current module',
      explanation: [
        'A path beginning with self:: starts at the module where it is written, so self::body::rows() names a child of the current module. It makes clear that the item is local rather than from somewhere else.',
        'Combining the two reaches siblings: from network, super::config::retries() goes up to the shared parent and down into config.',
      ],
      example: {
        language: 'rust',
        code: 'mod report {\n    fn header() -> u32 {\n        100\n    }\n\n    pub fn build() -> u32 {\n        self::header() + self::body::rows()\n    }\n\n    mod body {\n        pub fn rows() -> u32 {\n            5\n        }\n    }\n}\n\nfn main() {\n    println!("{}", report::build());\n}',
        output: '105',
        explanation:
          'Both self:: paths start at report: one names its private header, the other its child module body.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mod app {\n    pub mod config {\n        pub fn retries() -> u32 {\n            3\n        }\n    }\n\n    pub mod network {\n        pub fn attempts() -> u32 {\n            super::config::retries() + 1\n        }\n    }\n}\n\nfn main() {\n    println!("{}", app::network::attempts());\n}',
          ['4', '3', '1', '31'],
          0,
          'From network, super is app, and app::config::retries returns 3.',
        ),
        choose(
          'Inside mod network, which path reaches its sibling module config when both are inside app?',
          ['self::config', 'config', 'super::config', 'network::config'],
          2,
          'A sibling lives in the parent, so the path goes up with super and then down into config.',
        ),
        choose(
          'At the start of a path, what does self:: refer to?',
          [
            'The value a method was called on',
            'The parent of the current module',
            'The root module of the program',
            'The module the path is written in',
          ],
          3,
          'In a path, self means the current module. The method receiver is a different use of the word.',
        ),
        predictOutput(
          'What is the output of this program?',
          'mod math {\n    pub fn double(n: u32) -> u32 {\n        n * 2\n    }\n\n    pub mod extra {\n        pub fn quadruple(n: u32) -> u32 {\n            super::double(super::double(n))\n        }\n\n        pub fn octuple(n: u32) -> u32 {\n            self::quadruple(n) * 2\n        }\n    }\n}\n\nfn main() {\n    println!("{}", math::extra::octuple(3));\n}',
          ['24', '12', '48', '6'],
          0,
          'self::quadruple is extra’s own function, which doubles 3 twice via super; octuple doubles that 12.',
        ),
      ],
    },
  ],
  'rust-semver': [
    {
      title: 'Read major, minor, and patch numbers',
      explanation: [
        'A semantic version has three whole numbers, MAJOR.MINOR.PATCH, such as 1.4.2. A breaking change raises major, a compatible new feature raises minor, and a bug fix raises patch; the numbers to the right of a raised one reset to 0.',
        'Versions compare number by number, from major to patch. They must be compared as numbers, not as text: 1.10.0 is newer than 1.9.3, but the string "1.10.0" sorts before "1.9.3".',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let a = (1, 10, 0);\n    let b = (1, 9, 3);\n    println!("{} {}", a > b, "1.10.0" > "1.9.3");\n}',
        output: 'true false',
        explanation:
          'Tuples compare field by field, so 10 beats 9 in the minor position. As text, the character 1 sorts before 9.',
      },
      questions: [
        choose(
          'A library at version 2.3.1 adds a backward-compatible feature. What is its next version?',
          ['2.3.2', '3.0.0', '2.4.1', '2.4.0'],
          3,
          'A compatible feature raises minor and resets patch to 0.',
        ),
        choose(
          'A release of version 3.6.2 removes a public function that callers used. What should the next version be?',
          ['4.0.0', '3.7.0', '3.6.3', '4.6.2'],
          0,
          'Removing public API breaks callers, so major increases and the other parts reset.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let installed = (2, 0, 9);\n    let required = (2, 1, 0);\n    println!("{} {}", installed >= required, (3, 0, 0) > (2, 99, 99));\n}',
          ['false true', 'true true', 'true false', 'false false'],
          0,
          'The minor part decides the first comparison (0 < 1), and the major part decides the second (3 > 2).',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let text_newer = "0.10.1" > "0.9.0";\n    let number_newer = (0, 10, 1) > (0, 9, 0);\n    println!("text: {}, numbers: {}", text_newer, number_newer);\n}',
          [
            'text: true, numbers: true',
            'text: true, numbers: false',
            'text: false, numbers: true',
            'text: false, numbers: false',
          ],
          2,
          'As text, "0.1…" sorts before "0.9…"; as numbers, minor 10 is greater than 9.',
        ),
      ],
    },
    {
      title: 'Parse exactly three numeric components',
      explanation: [
        'Parsing "2.14.0" means splitting on dots, parsing each piece as an integer, and rejecting anything else: too few pieces, too many, or a piece that is not a number. Returning Option lets the caller see None instead of a silently guessed version.',
        'In a function that returns Option, ? on an Option returns None early when the value is missing. .ok() turns parse’s Result into an Option so that ? can be used on it too.',
      ],
      example: {
        language: 'rust',
        code: 'fn parse_version(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split(\'.\');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}\n\nfn main() {\n    match parse_version("2.14.0") {\n        Some((major, minor, patch)) => println!("{} {} {}", major, minor, patch),\n        None => println!("invalid"),\n    }\n}',
        output: '2 14 0',
        explanation:
          'All three pieces parse and nothing is left over, so the function returns the three numbers.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn parse_version(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split(\'.\');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}\n\nfn show(text: &str) {\n    match parse_version(text) {\n        Some(v) => println!("{}.{}.{}", v.0, v.1, v.2),\n        None => println!("invalid {}", text),\n    }\n}\n\nfn main() {\n    show("1.2");\n    show("3.0.12");\n}',
          [
            '1.2.0\n3.0.12',
            'invalid 1.2\n3.0.12',
            '1.2\n3.0.12',
            'invalid 1.2\ninvalid 3.0.12',
          ],
          1,
          '"1.2" runs out of pieces at patch, so ? returns None; "3.0.12" has exactly three numbers.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn parse_version(text: &str) -> Option<(u32, u32, u32)> {\n    let mut parts = text.split(\'.\');\n    let major = parts.next()?.parse().ok()?;\n    let minor = parts.next()?.parse().ok()?;\n    let patch = parts.next()?.parse().ok()?;\n    if parts.next().is_some() {\n        return None;\n    }\n    Some((major, minor, patch))\n}\n\nfn show(text: &str) {\n    match parse_version(text) {\n        Some(v) => println!("{}.{}.{}", v.0, v.1, v.2),\n        None => println!("invalid {}", text),\n    }\n}\n\nfn main() {\n    show("1.2.3.4");\n    show("1.x.3");\n}',
          [
            '1.2.3\ninvalid 1.x.3',
            '1.2.3\n1.0.3',
            'invalid 1.2.3.4\n1.0.3',
            'invalid 1.2.3.4\ninvalid 1.x.3',
          ],
          3,
          'A fourth piece is rejected rather than ignored, and x fails to parse, so both inputs are invalid.',
        ),
        choose(
          'Why should a parser reject "1.2" instead of reading it as 1.2.0?',
          [
            'Two-part versions must be parsed as floating point numbers',
            'Rust cannot split a string into fewer than three pieces',
            'The patch number must always be written as 0',
            'A missing part is malformed input, and guessing hides the error',
          ],
          3,
          'Silently filling in a value turns bad input into a version nobody wrote.',
        ),
        choose(
          'In a function returning Option<(u32, u32, u32)>, what does parts.next()? do when no piece is left?',
          [
            'Substitutes an empty string and continues',
            'Panics because the iterator is exhausted',
            'Restarts the split from the first piece',
            'Returns None from the whole function immediately',
          ],
          3,
          'next() gives None at the end, and ? on None returns None from the enclosing function.',
        ),
      ],
    },
  ],
  'rust-cfg': [
    {
      title: 'cfg removes items at compile time',
      explanation: [
        '#[cfg(predicate)] on an item keeps the item only if the predicate is true for this build. Otherwise the item is removed before type checking, as if it had never been written.',
        'Real predicates test the build, such as target_os = "linux", test, or a Cargo feature. cfg(all()) is always true and cfg(any()) always false, which makes them handy for experiments. Two items may share a name if exactly one survives.',
      ],
      example: {
        language: 'rust',
        code: '#[cfg(all())]\nfn mode() -> &\'static str {\n    "included"\n}\n\n#[cfg(any())]\nfn mode() -> &\'static str {\n    "excluded"\n}\n\nfn main() {\n    println!("{}", mode());\n}',
        output: 'included',
        explanation:
          'The second mode is removed during compilation, so only the first exists to be called.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          '#[cfg(not(any()))]\nfn limit() -> u32 {\n    10\n}\n\n#[cfg(any())]\nfn limit() -> u32 {\n    20\n}\n\nfn main() {\n    println!("{}", limit() + 1);\n}',
          ['11', '21', '10', '31'],
          0,
          'not(any()) is true, so the first limit is kept and the second is removed.',
        ),
        choose(
          'What happens to a function marked #[cfg(any())]?',
          [
            'It is compiled but never called',
            'It is left out of the build entirely',
            'It runs only after main returns',
            'It is compiled and type-checked, then hidden',
          ],
          1,
          'A false cfg predicate removes the item before it is compiled.',
        ),
        choose(
          'Why can the example define two functions named mode?',
          [
            'Rust picks the one defined last when the program runs',
            'Only one survives cfg, so only one is ever compiled',
            'The second definition silently overrides the first',
            'Functions may share a name if their bodies differ',
          ],
          1,
          'After cfg removes the excluded item, the program contains a single mode.',
        ),
        predictOutput(
          'What is the output of this program?',
          '#[cfg(all(not(any()), all()))]\nfn greeting() -> &\'static str {\n    "hi"\n}\n\n#[cfg(not(all()))]\nfn greeting() -> &\'static str {\n    "bye"\n}\n\nfn main() {\n    println!("{}", greeting());\n}',
          ['hi', 'bye', 'hibye', 'bye hi'],
          0,
          'all(not(any()), all()) combines two true predicates, while not(all()) is false.',
        ),
      ],
    },
    {
      title: 'cfg decides per build, not per run',
      explanation: [
        'An if chooses while the program runs, and both of its branches must compile. A cfg attribute chooses during compilation, and the removed item is never compiled, so it may even refer to things that do not exist on this platform.',
        'The cfg! macro evaluates the same predicates to a plain true or false constant. With if cfg!(...), both branches are still compiled. No value computed at run time can change a cfg decision.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    if cfg!(any()) {\n        println!("never chosen");\n    } else {\n        println!("chosen");\n    }\n    println!("{}", cfg!(all()));\n}',
        output: 'chosen\ntrue',
        explanation:
          'cfg!(any()) is the constant false, so the else branch runs; cfg!(all()) is the constant true.',
      },
      questions: [
        choose(
          'A program needs different code on Windows and Linux, and the Windows code calls functions that do not exist on Linux. Which tool fits?',
          [
            '#[cfg(...)] on each version, so only one is compiled',
            'An if on a variable holding the OS name',
            'Two functions with the same name and no attributes',
            'A match on a string typed in by the user',
          ],
          0,
          'Only cfg removes the code for the other platform, so its missing functions never need to compile.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = cfg!(all());\n    let b = cfg!(any());\n    let c = cfg!(not(any()));\n    println!("{} {} {}", a, b, c);\n}',
          [
            'true false true',
            'false true false',
            'true true true',
            'true false false',
          ],
          0,
          'all() with no conditions is true, any() with no conditions is false, and not flips it.',
        ),
        choose(
          'How does if cfg!(test) { ... } else { ... } differ from #[cfg(test)] on a function?',
          [
            'cfg! is checked at run time, #[cfg] at compile time',
            'There is no difference; both remove unused code',
            'With cfg!, both branches compile; #[cfg] removes the item',
            '#[cfg] may only be placed on main',
          ],
          2,
          'cfg! produces a compile-time boolean, but the code in both branches must still be valid.',
        ),
        choose(
          'Can a value computed while the program runs change which #[cfg] items exist?',
          [
            'No; cfg decisions are fixed when the program is compiled',
            'Yes, if the value is stored in a global variable',
            'Yes, because cfg re-checks its predicate on each call',
            'Only for items declared inside main',
          ],
          0,
          'By the time the program runs, the excluded items are already gone from it.',
        ),
      ],
    },
  ],
  'rust-boundary-tests': [
    {
      title: 'Test at the limit and just past it',
      explanation: [
        'Bugs gather at boundaries: writing < where <= was meant, or starting a count at 1 instead of 0. For a rule like "at most capacity", test exactly capacity (allowed), capacity + 1 (refused), and the smallest input.',
        'A value in the middle of the range cannot tell a correct comparison from an off-by-one one, because both give the same answer there.',
      ],
      example: {
        language: 'rust',
        code: 'fn fits(size: u32, capacity: u32) -> bool {\n    size <= capacity\n}\n\nfn main() {\n    let capacity = 5;\n    println!("{} {} {}", fits(4, capacity), fits(5, capacity), fits(6, capacity));\n}',
        output: 'true true false',
        explanation:
          'The three inputs sit just below, exactly at, and just past the limit, which pins down the comparison.',
      },
      questions: [
        predictOutput(
          'This version has a bug. What does the program print?',
          'fn fits(size: u32, capacity: u32) -> bool {\n    size < capacity\n}\n\nfn main() {\n    println!("{} {} {}", fits(0, 5), fits(5, 5), fits(6, 5));\n}',
          [
            'true true false',
            'false false false',
            'true false false',
            'true true true',
          ],
          2,
          'With <, a size equal to the capacity is refused, which only the middle test reveals.',
        ),
        choose(
          'A function should accept ages 18 through 65 inclusive. Which test inputs best check its boundaries?',
          [
            '20, 30, 40, 50',
            '18 and 65 only',
            '17, 18, 65, 66',
            '0 and 100 only',
          ],
          2,
          'Each limit is tested at the edge and one step outside it.',
        ),
        choose(
          'fits(size, capacity) uses size < capacity but should allow size == capacity. Which test exposes the bug?',
          [
            'fits(2, 5) should be true',
            'fits(9, 5) should be false',
            'fits(5, 5) should be true',
            'fits(0, 5) should be true',
          ],
          2,
          'Only the case exactly at the limit separates < from <=.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let max_len = 3;\n    let valid = |name: &str| name.len() > 0 && name.len() <= max_len;\n    println!("{} {} {} {}", valid(""), valid("a"), valid("abc"), valid("abcd"));\n}',
          [
            'false true true false',
            'true true true false',
            'false true false false',
            'false true true true',
          ],
          0,
          'The four inputs probe both limits: empty is too short, 1 and 3 are inside, 4 is too long.',
        ),
      ],
    },
    {
      title: 'Include overflow at the numeric edge',
      explanation: [
        'used + extra <= capacity looks safe, but the addition itself can overflow when used is near the type’s maximum. A debug build panics there, and a release build wraps around to a small number that may wrongly pass.',
        'checked_add returns None on overflow. Treating None as "does not fit" is correct, because the real total exceeds every capacity. is_some_and(|total| total <= capacity) is true only for Some values that pass the test.',
      ],
      example: {
        language: 'rust',
        code: 'fn fits(used: u32, extra: u32, capacity: u32) -> bool {\n    used.checked_add(extra).is_some_and(|total| total <= capacity)\n}\n\nfn main() {\n    println!("{} {}", fits(3, 2, 5), fits(u32::MAX, 1, u32::MAX));\n}',
        output: 'true false',
        explanation:
          'The second call would overflow, so checked_add gives None and the request is refused.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn fits(used: u8, extra: u8, capacity: u8) -> bool {\n    used.checked_add(extra).is_some_and(|total| total <= capacity)\n}\n\nfn main() {\n    println!("{} {} {}", fits(200, 55, 255), fits(200, 56, 255), fits(0, 0, 0));\n}',
          [
            'true true true',
            'false false true',
            'true false false',
            'true false true',
          ],
          3,
          '200 + 55 is exactly 255; 200 + 56 overflows u8; 0 + 0 fits a capacity of 0.',
        ),
        choose(
          'Why test fits(u32::MAX, 1, u32::MAX) in addition to fits(3, 3, 5)?',
          [
            'u32::MAX is the most common capacity in practice',
            'It is the only way to test the <= comparison',
            'The addition overflows there, which ordinary sizes never reach',
            'Large numbers execute more lines of the function',
          ],
          2,
          'Overflow is a boundary of the integer type itself, separate from the capacity limit.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let used: u8 = 250;\n    let extra: u8 = 10;\n    println!("{} {}", used.wrapping_add(extra), used.checked_add(extra).is_some());\n}',
          ['4 false', '260 true', '255 false', '4 true'],
          0,
          'wrapping_add shows what a release build does: 260 wraps to 4. checked_add reports the overflow as None.',
        ),
        choose(
          'In a capacity check, what should happen when used + extra overflows?',
          [
            'Refuse the request: the true total exceeds any capacity',
            'Accept it, since the wrapped total is small',
            'Clamp the total to the capacity and accept',
            'Ignore the case, because u32 never overflows',
          ],
          0,
          'An overflowing sum is larger than the type can hold, so it cannot fit.',
        ),
      ],
    },
  ],
  'rust-table-tests': [
    {
      title: 'Run one check over a table of cases',
      explanation: [
        'Instead of repeating the same check for each input, list (input, expected) pairs in an array and loop over them, unpacking each pair with a tuple pattern. Every case goes through identical logic, and adding a case is one line.',
        'Counting or reporting every mismatch shows all failing cases at once. When a case fails, decide whether the function or the table entry is wrong; never edit the expected value just to match the output.',
      ],
      example: {
        language: 'rust',
        code: 'fn sign(n: i32) -> i32 {\n    if n > 0 {\n        1\n    } else if n < 0 {\n        -1\n    } else {\n        0\n    }\n}\n\nfn main() {\n    let cases = [(5, 1), (0, 0), (-3, -1), (-1, -1)];\n    let mut failures = 0;\n    for (input, expected) in cases {\n        if sign(input) != expected {\n            failures += 1;\n        }\n    }\n    println!("{} cases, {} failures", cases.len(), failures);\n}',
        output: '4 cases, 0 failures',
        explanation:
          'The loop applies the same comparison to every row, and all four rows agree with sign.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn clamp_small(n: i32) -> i32 {\n    if n > 2 {\n        2\n    } else {\n        n\n    }\n}\n\nfn main() {\n    let cases = [(9, 2), (2, 2), (0, 0), (-2, -2), (-9, -2)];\n    let mut failed = 0;\n    for (input, expected) in cases {\n        if clamp_small(input) != expected {\n            failed += 1;\n        }\n    }\n    println!("{}", failed);\n}',
          ['0', '2', '1', '5'],
          2,
          'clamp_small never raises small values, so only the -9 row fails.',
        ),
        choose(
          'What is the main advantage of checking a table of (input, expected) pairs in one loop?',
          [
            'Every case uses the same check, and adding one is a single line',
            'The loop makes the function under test run faster',
            'Only the first case in the table has to be correct',
            'Expected values can be computed by the function itself',
          ],
          0,
          'The table separates the data from the checking logic, which is written once.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn double(n: i32) -> i32 {\n    n + n\n}\n\nfn main() {\n    let cases = [(1, 2), (0, 0), (3, 7), (-4, -8)];\n    for (input, expected) in cases {\n        if double(input) != expected {\n            println!("double({}) gave {}, expected {}", input, double(input), expected);\n        }\n    }\n    println!("done");\n}',
          [
            'done',
            'double(3) gave 6, expected 7\ndone',
            'double(3) gave 7, expected 6\ndone',
            'double(1) gave 2, expected 2\ndone',
          ],
          1,
          'Only the row (3, 7) disagrees, and here the table entry, not the function, is wrong.',
        ),
        choose(
          'A table case fails because the function mishandles 0. What should you do?',
          [
            'Change the expected value to what the function returns',
            'Fix the function so the 0 case passes',
            'Delete the 0 case because the other cases pass',
            'Move the 0 case to the end of the table',
          ],
          1,
          'The table states the intended behavior; a failing row points at the code under test.',
        ),
      ],
    },
    {
      title: 'Give the table rows for every branch',
      explanation: [
        'A table is only as strong as its rows. Include ordinary values, zero, negative values, and both sides of every limit, so each branch of the function runs at least once.',
        'A table containing only positive numbers can pass while the negative branch is broken.',
      ],
      example: {
        language: 'rust',
        code: 'fn bucket(n: i32) -> &\'static str {\n    match n {\n        n if n < 0 => "negative",\n        0 => "zero",\n        n if n < 10 => "small",\n        _ => "large",\n    }\n}\n\nfn main() {\n    let rows = [(-5, "negative"), (0, "zero"), (1, "small"), (9, "small"), (10, "large")];\n    let mut passed = 0;\n    for (n, want) in rows {\n        if bucket(n) == want {\n            passed += 1;\n        }\n    }\n    println!("{}/{}", passed, rows.len());\n}',
        output: '5/5',
        explanation:
          'The rows hit every arm, including both sides of the 10 limit.',
      },
      questions: [
        choose(
          'A table for an absolute-value function has the rows (3, 3), (10, 10), and (7, 7). Which new row would improve it most?',
          ['(5, 5)', '(100, 100)', '(8, 8)', '(-4, 4)'],
          3,
          'Every existing row takes the non-negative path; a negative input exercises the other branch.',
        ),
        predictOutput(
          'What does this program print?',
          'fn abs(n: i32) -> i32 {\n    if n < -1 {\n        -n\n    } else {\n        n\n    }\n}\n\nfn count_failures(rows: &[(i32, i32)]) -> usize {\n    let mut failures = 0;\n    for &(input, expected) in rows {\n        if abs(input) != expected {\n            failures += 1;\n        }\n    }\n    failures\n}\n\nfn main() {\n    let positive_only = [(3, 3), (10, 10)];\n    let with_edges = [(3, 3), (0, 0), (-1, 1), (-7, 7)];\n    println!("{} {}", count_failures(&positive_only), count_failures(&with_edges));\n}',
          ['0 0', '1 1', '0 1', '0 2'],
          2,
          'The bug only affects -1, which the positive-only table never tries.',
        ),
        choose(
          'Which inputs exercise every branch of if n > 100 { "big" } else if n > 0 { "pos" } else { "other" } at its limits?',
          ['50, 60, 70', '101 and 0 only', '1, 2, 3, 4', '101, 100, 1, 0'],
          3,
          'These rows sit on both sides of 100 and of 0, so each branch runs.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn positive(n: i32) -> Option<i32> {\n    if n >= 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    let rows = [(4, Some(4)), (0, None), (-2, None), (1, Some(1))];\n    let mut ok = 0;\n    for (input, expected) in rows {\n        if positive(input) == expected {\n            ok += 1;\n        }\n    }\n    println!("{} of {}", ok, rows.len());\n}',
          ['4 of 4', '3 of 4', '2 of 4', '1 of 4'],
          1,
          'The function treats 0 as positive, so the (0, None) row is the one that fails.',
        ),
      ],
    },
  ],
  'rust-invariants': [
    {
      title: 'An invariant holds for every input',
      explanation: [
        'An invariant is a relationship that should be true for a whole family of inputs, not one hard-coded answer: reversing twice gives back the original, sorting keeps the length, deduplicating twice equals deduplicating once.',
        'Checking it across many generated inputs, for example every length from 0 to 20, catches bugs that a single example misses.',
      ],
      example: {
        language: 'rust',
        code: 'fn reverse_copy(values: &[i32]) -> Vec<i32> {\n    values.iter().rev().copied().collect()\n}\n\nfn main() {\n    let mut all_hold = true;\n    for n in 0..10 {\n        let input: Vec<i32> = (0..n).collect();\n        all_hold = all_hold && reverse_copy(&reverse_copy(&input)) == input;\n    }\n    println!("{}", all_hold);\n}',
        output: 'true',
        explanation:
          'For every length from 0 to 9, reversing twice restores the input, so the flag stays true.',
      },
      questions: [
        choose(
          'Which statement is an invariant of a correct sort function?',
          [
            'sort of [3, 1, 2] returns [1, 2, 3]',
            'The first element of the output is 1',
            'The output has the same length as the input',
            'The function finishes in under a second',
          ],
          2,
          'The length relationship holds for every input; the others are single examples or unrelated to correctness.',
        ),
        predictOutput(
          'What does this program print?',
          'fn buggy_reverse(values: &[i32]) -> Vec<i32> {\n    values.iter().skip(1).rev().copied().collect()\n}\n\nfn main() {\n    let held = (0..5)\n        .filter(|n| {\n            let input: Vec<i32> = (0..*n).collect();\n            buggy_reverse(&buggy_reverse(&input)) == input\n        })\n        .count();\n    println!("{}", held);\n}',
          ['1', '0', '5', '4'],
          0,
          'The bug drops an element, so the round trip only survives for the empty input.',
        ),
        choose(
          'A test checks only that reverse of [1, 2, 3] is [3, 2, 1]. What does an invariant check over many inputs add?',
          [
            'Confidence across many cases, such as every length up to 20',
            'A proof that reverse is correct for every possible input',
            'A guarantee that reverse never allocates memory',
            'Nothing; one example already covers every length',
          ],
          0,
          'Many generated cases make a bug much harder to miss, though they are still a finite sample.',
        ),
        choose(
          'Which property should hold for every input of a correct function that removes repeated values from a list?',
          [
            'The output is always shorter than the input',
            'The output always has exactly one element',
            'The output is sorted in descending order',
            'Applying it twice gives the same result as once',
          ],
          3,
          'After one pass there are no repeats left, so a second pass changes nothing. Lists without repeats keep their length.',
        ),
      ],
    },
    {
      title: 'Check round trips on content, not just length',
      explanation: [
        'A round trip pairs an operation with its inverse: shift_down(shift_up(x)) == x. Compare whole outputs; a function can return the right length with the wrong values and still pass a length-only check.',
        'Passing many generated cases is strong evidence, but not a proof. Inputs outside the sample, such as very large values, may still break the invariant.',
      ],
      example: {
        language: 'rust',
        code: 'fn shift_up(values: &[i32]) -> Vec<i32> {\n    values.iter().map(|v| v + 10).collect()\n}\n\nfn shift_down(values: &[i32]) -> Vec<i32> {\n    values.iter().map(|v| v - 10).collect()\n}\n\nfn main() {\n    let mut all_hold = true;\n    for n in 0..6 {\n        let input: Vec<i32> = (-n..n).collect();\n        all_hold = all_hold && shift_down(&shift_up(&input)) == input;\n    }\n    println!("{}", all_hold);\n}',
        output: 'true',
        explanation:
          'Each generated list, including negative values, comes back unchanged after the pair of shifts.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn bad_reverse(values: &[i32]) -> Vec<i32> {\n    values.iter().copied().collect()\n}\n\nfn main() {\n    let input = vec![1, 2, 3];\n    let out = bad_reverse(&input);\n    println!("{} {}", out.len() == input.len(), out[0] == input[2]);\n}',
          ['true false', 'true true', 'false false', 'false true'],
          0,
          'The broken function keeps the length, so only a check on the content catches it.',
        ),
        choose(
          'A round-trip check passes for every list of length 0 to 50. What has it shown?',
          [
            'That the functions are correct for every possible input',
            'Nothing, because round trips can never fail',
            'Strong evidence for those cases, not a proof for all inputs',
            'That the functions are fast enough for real use',
          ],
          2,
          'A finite sample cannot rule out failures for inputs it never tried.',
        ),
        predictOutput(
          'This function claims to return its input unchanged. What does the program print?',
          'fn cap(values: &[i32]) -> Vec<i32> {\n    values.iter().map(|v| (*v).min(5)).collect()\n}\n\nfn main() {\n    let held = (0..10)\n        .filter(|n| {\n            let input: Vec<i32> = (0..*n).collect();\n            cap(&input) == input\n        })\n        .count();\n    println!("{}", held);\n}',
          ['6', '10', '7', '5'],
          2,
          'Lists 0..n for n up to 6 contain no value above 5, so they pass; longer lists include 6 or more and fail.',
        ),
        choose(
          'Why compare whole outputs instead of only their lengths?',
          [
            'Comparing lengths is slower than comparing contents',
            'A wrong function can keep the length while changing values',
            'The lengths of two vectors cannot be compared',
            'Whole outputs only matter for empty inputs',
          ],
          1,
          'Length is one property; equality of contents is the actual round-trip claim.',
        ),
      ],
    },
  ],
  'rust-panic-contracts': [
    {
      title: 'Return Option instead of panicking',
      explanation: [
        'a / b panics when b is 0, and also for i32::MIN / -1, whose true result does not fit in an i32. a.checked_div(b) returns an Option instead: Some(quotient), or None for those inputs.',
        'A function that returns Option<i32> states in its type that some inputs have no answer, and the caller must decide what to do with None instead of the program stopping.',
      ],
      example: {
        language: 'rust',
        code: 'fn share(total: i32, people: i32) -> Option<i32> {\n    total.checked_div(people)\n}\n\nfn main() {\n    println!("{:?} {:?}", share(12, 4), share(12, 0));\n}',
        output: 'Some(3) None',
        explanation:
          'The valid division returns Some; dividing by zero returns None rather than panicking.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a: i32 = -8;\n    println!("{:?} {:?}", a.checked_div(2), i32::MIN.checked_div(-1));\n}',
          [
            'Some(-4) Some(2147483648)',
            'Some(4) None',
            'None None',
            'Some(-4) None',
          ],
          3,
          '-8 / 2 is fine. i32::MIN / -1 would be 2147483648, which does not fit in an i32, so checked_div returns None.',
        ),
        choose(
          'Which i32 division overflows even though the divisor is not zero?',
          ['i32::MIN / -1', 'i32::MAX / 1', '0 / -1', '-8 / 2'],
          0,
          'Negating the most negative i32 gives a value one larger than i32::MAX.',
        ),
        choose(
          'Why is fn average(total: i32, count: i32) -> Option<i32> a better contract than returning i32?',
          [
            'Callers must handle count == 0 instead of a panic',
            'Option values make the division run faster',
            'It lets the function skip the division entirely',
            'An i32 return type cannot hold negative averages',
          ],
          0,
          'The signature makes the impossible case visible, and the caller handles it explicitly.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let scores = [70, 85, 90];\n    println!("{:?} {:?}", scores.get(1), scores.get(3));\n}',
          ['Some(70) None', 'Some(85) Some(90)', '85 None', 'Some(85) None'],
          3,
          'get checks the index: 1 is valid, while 3 is past the end and gives None where scores[3] would panic.',
        ),
      ],
    },
    {
      title: 'Test the inputs that would have panicked',
      explanation: [
        'A contract that promises None for invalid input must be tested with exactly those inputs: zero divisors, overflow cases, out-of-range indexes. Normal inputs alone never reach the dangerous paths.',
        'Catching a panic is not a substitute for such a contract. The panic may leave data half-updated, and nothing in the function’s type warns the caller that it can fail.',
      ],
      example: {
        language: 'rust',
        code: 'fn safe_quotient(a: i32, b: i32) -> Option<i32> {\n    a.checked_div(b)\n}\n\nfn main() {\n    let cases = [(9, 3), (9, 0), (i32::MIN, -1)];\n    for case in cases {\n        println!("{:?}", safe_quotient(case.0, case.1));\n    }\n}',
        output: 'Some(3)\nNone\nNone',
        explanation:
          'The table covers a normal division, a zero divisor, and the single overflowing division.',
      },
      questions: [
        choose(
          'A function promises None for a zero divisor. Which tests check that promise?',
          [
            'Only inputs where b is positive',
            'Only the single input (10, 2)',
            'Inputs where a is 0 and b is nonzero',
            'b = 0, plus normal and overflow cases',
          ],
          3,
          'The promise is about b = 0, so the tests must include it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn previous(index: usize) -> Option<usize> {\n    index.checked_sub(1)\n}\n\nfn main() {\n    println!("{:?} {:?}", previous(3), previous(0));\n}',
          ['Some(2) Some(0)', '2 None', 'Some(4) None', 'Some(2) None'],
          3,
          'usize cannot go below 0, so 0 - 1 has no answer and checked_sub returns None.',
        ),
        choose(
          'Why is catching a panic a poor replacement for returning Option?',
          [
            'State may be half-updated, and the type hides the failure',
            'A panic can never be caught by the code that called it',
            'Catching a panic is always slower than dividing',
            'A caught panic turns the result into Some(0)',
          ],
          0,
          'An Option result is part of the contract; a panic is an interruption the type does not mention.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let totals: [i32; 3] = [10, 0, 7];\n    let counts = [2, 5, 0];\n    println!(\n        "{:?} {:?} {:?}",\n        totals[0].checked_div(counts[0]),\n        totals[1].checked_div(counts[1]),\n        totals[2].checked_div(counts[2])\n    );\n}',
          [
            'Some(5) Some(0) None',
            'Some(5) None None',
            'Some(5) Some(0) Some(0)',
            '5 0 None',
          ],
          0,
          'Dividing 0 by 5 is a valid 0. Only the zero divisor in the last pair gives None.',
        ),
      ],
    },
  ],
  'rust-box': [
    {
      title: 'Box owns one value on the heap',
      explanation: [
        'Box::new(v) moves v into a heap allocation and returns a Box that owns it. *b reaches the value inside; with let mut, *b can also change it. Printing and method calls look through the Box automatically.',
        'A Box has exactly one owner. Moving it moves ownership of the allocation, so the old binding cannot be used, and the heap value is freed when its owner goes away.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut score = Box::new(10);\n    *score += 5;\n    let total = *score * 2;\n    println!("{} {}", score, total);\n}',
        output: '15 30',
        explanation:
          '*score changes the i32 inside the Box to 15, and reading it again gives 30 for the doubled value.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = Box::new(7);\n    let b = Box::new(3);\n    println!("{}", *a - *b * 2);\n}',
          ['8', '4', '-1', '1'],
          3,
          'Each * reads the boxed value, and multiplication happens before subtraction: 7 - 6.',
        ),
        choose(
          'first is a Box<String>. What happens on let second = first;?',
          [
            'The heap String is copied, so each Box owns one',
            'first and second share the String and count owners',
            'Ownership moves to second; first can no longer be used',
            'second borrows from first until first is dropped',
          ],
          2,
          'A Box is the single owner of its allocation, so assignment moves it like any owned value.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn double(mut boxed: Box<i32>) -> Box<i32> {\n    *boxed *= 2;\n    boxed\n}\n\nfn main() {\n    let start = Box::new(6);\n    let result = double(double(start));\n    println!("{}", result);\n}',
          ['24', '12', '6', '36'],
          0,
          'Each call takes ownership of the Box, doubles the value inside, and hands the Box back.',
        ),
        choose(
          'Given let mut b = Box::new(1);, why is *b += 1 written instead of b += 1?',
          [
            'Box values can only be changed through methods',
            'b += 1 would allocate a second Box',
            '* copies the value out so the Box is unchanged',
            'b is the Box; * reaches the i32 stored inside it',
          ],
          3,
          'Arithmetic applies to the i32, and dereferencing the Box is how you reach it.',
        ),
      ],
    },
    {
      title: 'Lend the boxed value as a reference',
      explanation: [
        'A Box<T> dereferences to T, so &b can be passed where a &T is expected and &mut b where a &mut T is expected. The compiler inserts the dereference for you.',
        'The Box keeps ownership. The function only borrows the value inside, and afterwards b is still usable.',
      ],
      example: {
        language: 'rust',
        code: 'fn show(n: &i32) -> i32 {\n    *n + 1\n}\n\nfn add_ten(n: &mut i32) {\n    *n += 10;\n}\n\nfn main() {\n    let mut b = Box::new(5);\n    add_ten(&mut b);\n    println!("{} {}", show(&b), b);\n}',
        output: '16 15',
        explanation:
          '&mut b lends the boxed i32 to add_ten, which makes it 15; show then borrows it to compute 16.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn triple(n: &mut i32) {\n    *n *= 3;\n}\n\nfn main() {\n    let mut b = Box::new(2);\n    triple(&mut b);\n    triple(&mut b);\n    println!("{}", b);\n}',
          ['18', '6', '12', '2'],
          0,
          'Both calls change the same boxed value: 2, then 6, then 18.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn shout_len(text: &str) -> usize {\n    text.len() + 1\n}\n\nfn main() {\n    let boxed = Box::new(String::from("hey"));\n    println!("{} {}", shout_len(&boxed), boxed);\n}',
          ['3 hey', '4', '4 hey', '4 "hey"'],
          2,
          '&boxed is turned into a &str view of the String inside, and boxed itself is still printed afterwards.',
        ),
        choose(
          'After add_ten(&mut b) returns, who owns the heap value?',
          [
            'Still b; the function only borrowed the value',
            'add_ten, which received the Box by reference',
            'Nobody; the borrow freed the allocation',
            'A copy of b made for the call',
          ],
          0,
          'Passing a reference lends the value; ownership never left b.',
        ),
        choose(
          'Given fn read(n: &i32) -> i32 and let b = Box::new(9);, which call compiles?',
          ['read(&b)', 'read(b)', 'read(*b)', 'read(Box::new(9))'],
          0,
          '&b is a &Box<i32>, which the compiler converts to &i32. The others pass a Box or an i32 by value.',
        ),
      ],
    },
  ],
  'rust-rc': [
    {
      title: 'Rc::clone adds an owner, not a copy',
      explanation: [
        'std::rc::Rc::new(v) stores v in an allocation together with a count of owners. Rc::clone(&a) makes another pointer to the same value and adds one to the count; the value itself is not copied.',
        'Rc::strong_count(&a) reads the count. Every owner sees the same value, and all of them get shared, read-only access to it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let first = std::rc::Rc::new(String::from("config"));\n    let second = std::rc::Rc::clone(&first);\n    let third = std::rc::Rc::clone(&second);\n    println!("{} {}", third, std::rc::Rc::strong_count(&first));\n}',
        output: 'config 3',
        explanation:
          'All three pointers share one String, so the count seen through any of them is 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = std::rc::Rc::new(5);\n    let b = std::rc::Rc::clone(&a);\n    let c = std::rc::Rc::clone(&a);\n    println!("{} {}", std::rc::Rc::strong_count(&b), *a + *c);\n}',
          ['2 10', '3 10', '3 15', '1 10'],
          1,
          'There are three owners of one value 5, and a and c both point to it.',
        ),
        choose(
          'a is an Rc<String> holding a long text. What does Rc::clone(&a) copy?',
          [
            'The whole String, into a new allocation',
            'Nothing; it returns a borrowed &String',
            'The String, but only the first time it is used',
            'Only the pointer; the owner count goes up by one',
          ],
          3,
          'Cloning an Rc shares the existing value and records one more owner.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let shared = std::rc::Rc::new(String::from("map"));\n    let owners = (std::rc::Rc::clone(&shared), std::rc::Rc::clone(&shared));\n    println!("{} {}", owners.0, std::rc::Rc::strong_count(&shared));\n}',
          ['map 2', 'map 1', 'map 3', 'mapmap 3'],
          2,
          'The tuple holds two more owners besides shared, all pointing at one String.',
        ),
        choose(
          'Two Rc<String> pointers were made from a single Rc::new followed by one Rc::clone. How many Strings exist?',
          [
            'Two, one for each pointer',
            'None until a pointer is dereferenced',
            'One for each call to strong_count',
            'One, shared by both pointers',
          ],
          3,
          'Rc::new allocates the value once; clones only point to it.',
        ),
      ],
    },
    {
      title: 'The value lives until its last owner goes',
      explanation: [
        'When an Rc owner is dropped, for example when a function that received it by value returns, the count goes down by one. The value is freed only when the count reaches zero.',
        'Moving an Rc to a new binding does not change the count, because the number of owners stays the same. Rc gives shared access only, so the value cannot be changed through it.',
      ],
      example: {
        language: 'rust',
        code: 'fn count_inside(handle: std::rc::Rc<i32>) -> usize {\n    std::rc::Rc::strong_count(&handle)\n}\n\nfn main() {\n    let a = std::rc::Rc::new(1);\n    let inside = count_inside(std::rc::Rc::clone(&a));\n    let after = std::rc::Rc::strong_count(&a);\n    println!("{} {}", inside, after);\n}',
        output: '2 1',
        explanation:
          'While count_inside runs, its parameter is a second owner. It is dropped when the function returns.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn owners(handle: std::rc::Rc<String>) -> usize {\n    std::rc::Rc::strong_count(&handle)\n}\n\nfn main() {\n    let name = std::rc::Rc::new(String::from("ada"));\n    let keep = std::rc::Rc::clone(&name);\n    let during = owners(std::rc::Rc::clone(&name));\n    println!("{} {}", during, std::rc::Rc::strong_count(&keep));\n}',
          ['2 2', '3 3', '3 2', '2 1'],
          2,
          'During the call there are three owners; after it returns, name and keep remain.',
        ),
        choose(
          'When is the value inside an Rc freed?',
          [
            'When the first Rc created for it is dropped',
            'When the last Rc pointing to it is dropped',
            'Whenever strong_count is called',
            'Only when the program exits',
          ],
          1,
          'The count tracks owners, and the value is freed when it reaches zero.',
        ),
        choose(
          'Why is let shared = Rc::new(String::from("a")); shared.push_str("b"); rejected?',
          [
            'Rc gives only shared access, so its value cannot be changed',
            'push_str requires the String to be cloned first',
            'Rc values must be dereferenced with * before any call',
            'A String cannot be stored inside an Rc',
          ],
          0,
          'Several owners may read the value at once, so Rc never hands out a mutable reference.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let a = std::rc::Rc::new(3);\n    let b = std::rc::Rc::clone(&a);\n    let c = b;\n    println!("{}", std::rc::Rc::strong_count(&a));\n}',
          ['3', '1', '2', '0'],
          2,
          'let c = b moves an existing owner rather than adding one, so the count stays at 2.',
        ),
      ],
    },
  ],
  'rust-arc': [
    {
      title: 'Arc is Rc with an atomic count',
      explanation: [
        'std::sync::Arc works like Rc: Arc::new, Arc::clone, and Arc::strong_count do the same jobs. The difference is that Arc updates its count with atomic operations, which stay correct even when several threads clone and drop pointers at once.',
        'Rc’s plain count is cheaper, but the compiler refuses to send an Rc to another thread. Use Arc only when ownership really is shared across threads.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let config = std::sync::Arc::new(String::from("v2"));\n    let worker_copy = std::sync::Arc::clone(&config);\n    println!("{} {}", worker_copy, std::sync::Arc::strong_count(&config));\n}',
        output: 'v2 2',
        explanation:
          'Arc::clone adds a second owner of the same String, exactly as Rc::clone would.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn count(shared: std::sync::Arc<u32>) -> usize {\n    std::sync::Arc::strong_count(&shared)\n}\n\nfn main() {\n    let a = std::sync::Arc::new(8);\n    let b = std::sync::Arc::clone(&a);\n    let during = count(std::sync::Arc::clone(&b));\n    println!("{} {} {}", during, std::sync::Arc::strong_count(&a), *b);\n}',
          ['2 2 8', '3 3 8', '3 2 8', '3 2 16'],
          2,
          'The parameter is a third owner during the call and is dropped when count returns.',
        ),
        choose(
          'Why would a program choose Arc over Rc?',
          [
            'It allows the shared value to be changed',
            'It avoids counting owners entirely',
            'It copies the value for each owner',
            'Its clones may be shared with other threads safely',
          ],
          3,
          'Atomic counting is what makes it safe for threads to share ownership.',
        ),
        choose(
          'What does Arc cost compared with Rc?',
          [
            'A full copy of the value on every clone',
            'An extra thread that manages the count',
            'Atomic count updates, which are slower than plain ones',
            'Nothing; Arc is always the faster choice',
          ],
          2,
          'Atomic operations coordinate between processor cores, which takes more work than a plain increment.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let a = std::sync::Arc::new(String::from("log"));\n    let b = a.clone();\n    let c = (*a).clone();\n    println!("{} {}", std::sync::Arc::strong_count(&a), c);\n}',
          ['3 log', '1 log', '2 log', '2 loglog'],
          2,
          'a.clone() clones the Arc pointer, adding an owner. (*a).clone() clones the String inside, which is a separate value.',
        ),
      ],
    },
    {
      title: 'Arc shares reads; changes need another tool',
      explanation: [
        'Like Rc, Arc only hands out shared references, so every owner can read the value but none can change it through the Arc.',
        'Changing shared data requires a type that controls mutation from inside, such as a Mutex, placed inside the Arc. Arc answers who owns the value; it does not answer who may modify it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let readings = std::sync::Arc::new([3, 4, 5]);\n    let reader = std::sync::Arc::clone(&readings);\n    println!("{} {}", reader[0] + reader[2], readings[1]);\n}',
        output: '8 4',
        explanation:
          'Both pointers read the same array; indexing looks through the Arc to the array inside.',
      },
      questions: [
        choose(
          'A program writes let shared = Arc::new(5); *shared += 1;. What happens?',
          [
            'Rejected: Arc gives only read-only access',
            'It compiles, and shared now holds 6',
            'It compiles, but other clones still see 5',
            'It panics at run time because the count is 1',
          ],
          0,
          'Arc never hands out a mutable reference to its value.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let text = std::sync::Arc::new(String::from("shared"));\n    let copy = std::sync::Arc::clone(&text);\n    let owned = (*copy).clone();\n    println!("{} {}", owned.len(), std::sync::Arc::strong_count(&text));\n}',
          ['6 3', '6 1', '6 2', '12 2'],
          2,
          'Cloning the String inside makes an independent value, so the Arc count stays at 2.',
        ),
        choose(
          'Several Arc owners share a String that must sometimes change. What is needed?',
          [
            'Arc::clone, which returns a mutable copy',
            'Declaring every Arc binding with let mut',
            'Dereferencing with * before calling push_str',
            'A Mutex or similar type inside the Arc',
          ],
          3,
          'Arc provides shared ownership only; synchronized mutation comes from the type it wraps.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn total(values: std::sync::Arc<[i32; 3]>) -> i32 {\n    values[0] + values[1] + values[2]\n}\n\nfn main() {\n    let data = std::sync::Arc::new([2, 4, 6]);\n    let sum = total(std::sync::Arc::clone(&data));\n    println!("{} {}", sum, std::sync::Arc::strong_count(&data));\n}',
          ['12 2', '12 1', '6 1', '12 0'],
          1,
          'total reads through its own owner, which is dropped when it returns, leaving only data.',
        ),
      ],
    },
  ],
  'rust-weak': [
    {
      title: 'A Weak pointer does not keep the value alive',
      explanation: [
        'Rc::downgrade(&strong) makes a Weak pointer to the same value. It raises the weak count but not the strong count, and only strong owners keep the value alive.',
        'weak.upgrade() returns Option<Rc<T>>: Some with a new strong pointer while the value still exists, and None once the last strong owner has been dropped.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let strong = std::rc::Rc::new(String::from("cache"));\n    let weak = std::rc::Rc::downgrade(&strong);\n    println!("{} {}", std::rc::Rc::strong_count(&strong), std::rc::Rc::weak_count(&strong));\n    drop(strong);\n    println!("{}", weak.upgrade().is_none());\n}',
        output: '1 1\ntrue',
        explanation:
          'The Weak is counted separately. Dropping the only strong owner frees the String, so upgrade gives None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = std::rc::Rc::new(1);\n    let b = std::rc::Rc::clone(&a);\n    let w1 = std::rc::Rc::downgrade(&a);\n    let w2 = std::rc::Rc::downgrade(&b);\n    println!("{} {}", std::rc::Rc::strong_count(&a), std::rc::Rc::weak_count(&a));\n}',
          ['4 0', '2 0', '2 2', '4 2'],
          2,
          'a and b are strong owners; the two downgrades add to the weak count only.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let a = std::rc::Rc::new(5);\n    let b = std::rc::Rc::clone(&a);\n    let w = std::rc::Rc::downgrade(&a);\n    drop(a);\n    let first = w.upgrade().is_some();\n    drop(b);\n    let second = w.upgrade().is_some();\n    println!("{} {}", first, second);\n}',
          ['true false', 'false false', 'true true', 'false true'],
          0,
          'After dropping a, b still keeps the value alive. Once b is dropped too, upgrade fails.',
        ),
        choose(
          'What does weak.upgrade() return?',
          [
            'The value T itself, copied out of the allocation',
            'An Rc that is guaranteed to be valid',
            'Option<Rc<T>>: Some while a strong owner exists, else None',
            'A bool saying whether the value still exists',
          ],
          2,
          'Upgrading can fail, so the result is an Option that must be checked.',
        ),
        choose(
          'Why does a Weak pointer not keep its value alive?',
          [
            'It is not counted in strong_count, which decides when to free',
            'It copies the value, so the original may be freed',
            'It holds a borrow that ends on the next line',
            'Weak pointers always free the value first',
          ],
          0,
          'The value is freed when the strong count reaches zero, whatever the weak count is.',
        ),
      ],
    },
    {
      title: 'Check upgrade before using the value',
      explanation: [
        'Code holding a Weak must handle both outcomes of upgrade: match on Some to use the value, and choose a fallback for None.',
        'A successful upgrade returns a real Rc, which counts as a strong owner. While that Rc is held, the value cannot be freed.',
      ],
      example: {
        language: 'rust',
        code: 'fn describe(handle: &std::rc::Weak<String>) -> String {\n    match handle.upgrade() {\n        Some(text) => format!("alive: {}", text),\n        None => String::from("gone"),\n    }\n}\n\nfn main() {\n    let owner = std::rc::Rc::new(String::from("doc"));\n    let handle = std::rc::Rc::downgrade(&owner);\n    println!("{}", describe(&handle));\n    drop(owner);\n    println!("{}", describe(&handle));\n}',
        output: 'alive: doc\ngone',
        explanation:
          'The first upgrade finds the String. After the only owner is dropped, the same handle upgrades to None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let owner = std::rc::Rc::new(9);\n    let weak = std::rc::Rc::downgrade(&owner);\n    let extra = weak.upgrade();\n    println!("{}", std::rc::Rc::strong_count(&owner));\n}',
          ['1', '2', '3', '0'],
          1,
          'The upgraded pointer stored in extra is a strong owner, alongside owner.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn describe(handle: &std::rc::Weak<String>) -> String {\n    match handle.upgrade() {\n        Some(text) => format!("alive: {}", text),\n        None => String::from("gone"),\n    }\n}\n\nfn main() {\n    let owner = std::rc::Rc::new(String::from("img"));\n    let handle = std::rc::Rc::downgrade(&owner);\n    let backup = std::rc::Rc::clone(&owner);\n    drop(owner);\n    println!("{}", describe(&handle));\n    drop(backup);\n    println!("{}", describe(&handle));\n}',
          [
            'gone\ngone',
            'alive: img\nalive: img',
            'gone\nalive: img',
            'alive: img\ngone',
          ],
          3,
          'backup keeps the String alive after owner is dropped; only dropping backup frees it.',
        ),
        choose(
          'A Weak handle is kept in a long-lived cache. What must code do before reading through it?',
          [
            'Dereference it directly with *',
            'Check strong_count once and assume it stays valid',
            'Clone the Weak to turn it into a strong owner',
            'Call upgrade and handle the None case',
          ],
          3,
          'Only upgrade gives access, and the value may already be gone.',
        ),
        choose(
          'While code holds the Rc returned by a successful upgrade, what is guaranteed?',
          [
            'The value is freed when the Weak is dropped',
            'The value stays alive at least as long as that Rc',
            'Other owners can no longer read the value',
            'The weak count drops to zero',
          ],
          1,
          'The upgraded Rc is a strong owner, so the count cannot reach zero while it exists.',
        ),
      ],
    },
  ],
  'rust-cell': [
    {
      title: 'Change a value through a shared reference with get and set',
      explanation: [
        'A & reference normally cannot change what it points to. std::cell::Cell<T> is an exception: cell.set(v) replaces the value and cell.get() returns a copy of it, both through a shared reference.',
        'get requires T to be Copy, because Cell never hands out a reference to its inside, only copies. That is what keeps the mutation safe within one thread.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let visits = std::cell::Cell::new(0);\n    let a = &visits;\n    let b = &visits;\n    a.set(a.get() + 1);\n    b.set(b.get() + 1);\n    println!("{}", visits.get());\n}',
        output: '2',
        explanation:
          'Both shared references update the same Cell, and nothing is declared mut.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn record(counter: &std::cell::Cell<i32>, amount: i32) {\n    counter.set(counter.get() + amount);\n}\n\nfn main() {\n    let total = std::cell::Cell::new(10);\n    record(&total, 5);\n    record(&total, -3);\n    println!("{}", total.get());\n}',
          ['10', '15', '12', '7'],
          2,
          'record only receives a shared reference, yet each call updates the Cell: 10 + 5 - 3.',
        ),
        choose(
          'Why does Cell::get require the value type to be Copy?',
          [
            'get returns a copy, never a reference to the inside',
            'Cell always stores its value on the heap',
            'Only Copy types can be changed at all',
            'get must also reset the cell to zero',
          ],
          0,
          'Handing out copies means no reference into the Cell can outlive a later set.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let level = std::cell::Cell::new(1);\n    let before = level.get();\n    level.set(5);\n    println!("{} {}", before, level.get());\n}',
          ['5 5', '1 5', '1 1', '5 1'],
          1,
          'before is a copy taken earlier, so it keeps 1 after the Cell changes.',
        ),
        choose(
          'A Cell<i32> is reachable through two shared references. Which is true?',
          [
            'Either reference can set a new value',
            'Neither can change it, because & is read-only',
            'Only the first reference may call set',
            'Both must be turned into &mut first',
          ],
          0,
          'Cell is designed for mutation through shared references.',
        ),
      ],
    },
    {
      title: 'Move values in and out with replace and take',
      explanation: [
        'For types that are not Copy, such as String, Cell cannot offer get. It still works by moving whole values: replace(new) stores new and returns the old value, and take() returns the value and leaves the type’s default (an empty String, 0) behind.',
        'Either way, the caller receives an owned value and no reference into the Cell exists.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let slot = std::cell::Cell::new(String::from("first"));\n    let old = slot.replace(String::from("second"));\n    let now = slot.take();\n    println!("{} {} [{}]", old, now, slot.take());\n}',
        output: 'first second []',
        explanation:
          'replace hands back first, take hands back second and leaves an empty String, which the last take returns.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let c = std::cell::Cell::new(4);\n    let a = c.replace(9);\n    let b = c.replace(a + c.get());\n    println!("{} {} {}", a, b, c.get());\n}',
          ['9 13 13', '4 9 13', '4 4 13', '4 9 9'],
          1,
          'The first replace returns 4 and stores 9. The second stores 4 + 9 and returns the 9 it replaced.',
        ),
        choose(
          'Why does Cell<String> offer no get method?',
          [
            'String is not Copy, and get returns a copy',
            'A String cannot be stored inside a Cell',
            'get would need a mutable reference to the String',
            'A String inside a Cell is always empty',
          ],
          0,
          'Without Copy, the only safe ways out are moving the value with replace or take.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let name = std::cell::Cell::new(String::from("kay"));\n    let taken = name.take();\n    let rest = name.take();\n    println!("{} {} {}", taken, rest.len(), taken.len());\n}',
          ['kay 3 3', 'kay 3 0', 'kay 0 3', '0 kay 3'],
          2,
          'The first take moves kay out and leaves an empty String, which the second take returns.',
        ),
        choose(
          'What does cell.replace(new) return?',
          [
            'The value the cell held before',
            'The new value just stored',
            'A reference to the stored value',
            'Nothing; it only stores the new value',
          ],
          0,
          'replace swaps the values and gives the caller the old one.',
        ),
      ],
    },
  ],
  'rust-refcell': [
    {
      title: 'borrow and borrow_mut are checked while the program runs',
      explanation: [
        'std::cell::RefCell<T> gives out a shared reference with borrow() or a mutable one with borrow_mut(), even through a shared reference to the RefCell itself.',
        'The usual rule still applies, any number of readers or one writer, but RefCell checks it at run time by counting active borrows. Breaking the rule panics instead of failing to compile.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let log = std::cell::RefCell::new(Vec::new());\n    log.borrow_mut().push("start");\n    log.borrow_mut().push("stop");\n    println!("{} {}", log.borrow().len(), log.borrow()[0]);\n}',
        output: '2 start',
        explanation:
          'Each borrow_mut lasts only for its statement, so the pushes and the later reads never overlap with a writer.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn add(list: &std::cell::RefCell<Vec<i32>>, value: i32) {\n    list.borrow_mut().push(value * 2);\n}\n\nfn main() {\n    let list = std::cell::RefCell::new(vec![1]);\n    add(&list, 3);\n    add(&list, 4);\n    println!("{} {}", list.borrow().len(), list.borrow()[2]);\n}',
          ['3 4', '2 8', '3 6', '3 8'],
          3,
          'add only needs a shared reference to push. The vector becomes [1, 6, 8].',
        ),
        choose(
          'When are RefCell’s borrowing rules checked?',
          [
            'At run time, on each borrow or borrow_mut',
            'At compile time, like ordinary references',
            'Never; RefCell switches the borrow rules off',
            'Only when the RefCell is dropped',
          ],
          0,
          'RefCell keeps a count of active borrows and checks it on every request.',
        ),
        choose(
          'What happens if borrow_mut() is called while a guard from borrow() is still alive?',
          [
            'The compiler rejects the program',
            'borrow_mut waits until the guard is dropped',
            'Both work, and the reader sees the old data',
            'The program panics with a borrow error',
          ],
          3,
          'A writer cannot coexist with a reader, and RefCell enforces that by panicking.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let names = std::cell::RefCell::new(vec![String::from("ana")]);\n    let snapshot = names.borrow().clone();\n    names.borrow_mut().push(String::from("bo"));\n    println!("{} {}", snapshot.len(), names.borrow().len());\n}',
          ['2 2', '1 1', '2 1', '1 2'],
          3,
          'snapshot is an independent clone taken before the push, and its borrow ended right away.',
        ),
      ],
    },
    {
      title: 'Drop each guard before the next conflicting borrow',
      explanation: [
        'A guard returned by borrow_mut() keeps the borrow active as long as the guard exists. An unnamed guard ends with its statement; a guard stored in a variable lasts until that variable goes out of scope.',
        'To make several changes and then read, keep the stored guard inside an inner block so it is dropped before the next borrow.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let cell = std::cell::RefCell::new(vec![1]);\n    {\n        let mut guard = cell.borrow_mut();\n        guard.push(2);\n        guard.push(3);\n    }\n    let len = cell.borrow().len();\n    println!("{}", len);\n}',
        output: '3',
        explanation:
          'guard is dropped at the end of the inner block, so the following borrow succeeds.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It runs normally, and reader sees 5',
            'It panics: guard is still active',
            'The compiler rejects the second borrow',
            'reader waits until guard is dropped',
          ],
          1,
          'guard lives until the end of main, so the shared borrow conflicts with it at run time.',
          'fn main() {\n    let cell = std::cell::RefCell::new(5);\n    let guard = cell.borrow_mut();\n    let reader = cell.borrow();\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let cell = std::cell::RefCell::new(String::from("a"));\n    cell.borrow_mut().push(\'b\');\n    let first = cell.borrow().len();\n    cell.borrow_mut().push_str("cd");\n    println!("{} {}", first, cell.borrow());\n}',
          ['4 abcd', '2 ab', '1 abcd', '2 abcd'],
          3,
          'Each unnamed guard ends with its statement. first records the length before cd is added.',
        ),
        choose(
          'Code stores let mut guard = cell.borrow_mut(); and later needs cell.borrow() in the same function. What lets that work?',
          [
            'Call borrow() twice so the second call waits',
            'Declare cell itself with let mut',
            'Keep the guard in an inner block',
            'Clone the guard before borrowing again',
          ],
          2,
          'Ending the guard’s scope ends the mutable borrow.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let scores = std::cell::RefCell::new(vec![10, 20]);\n    {\n        let mut s = scores.borrow_mut();\n        s[0] += 5;\n        s.push(30);\n    }\n    let s = scores.borrow();\n    println!("{} {}", s[0], s.len());\n}',
          ['15 3', '10 3', '15 2', '10 2'],
          0,
          'Both changes go through the guard inside the block; the read afterwards sees them.',
        ),
      ],
    },
  ],
  'rust-try-borrow': [
    {
      title: 'try_borrow reports a conflict as Err',
      explanation: [
        'borrow() panics on a conflict. try_borrow() returns a Result instead: Ok with a guard, or Err when a mutable guard is active. try_borrow_mut() returns Err when any guard, shared or mutable, is active.',
        'A conflict then becomes an ordinary value the program can match on, instead of a crash.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let cell = std::cell::RefCell::new(10);\n    let writer = cell.borrow_mut();\n    match cell.try_borrow() {\n        Ok(value) => println!("read {}", value),\n        Err(_) => println!("busy"),\n    }\n    drop(writer);\n    match cell.try_borrow() {\n        Ok(value) => println!("read {}", value),\n        Err(_) => println!("busy"),\n    };\n}',
        output: 'busy\nread 10',
        explanation:
          'While writer exists, reading is refused with Err. After drop(writer), the same call succeeds.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let cell = std::cell::RefCell::new(String::from("x"));\n    let reader = cell.borrow();\n    let first = match cell.try_borrow_mut() {\n        Ok(_) => "ok",\n        Err(_) => "blocked",\n    };\n    let second = match cell.try_borrow() {\n        Ok(_) => "ok",\n        Err(_) => "blocked",\n    };\n    println!("{} {}", first, second);\n}',
          ['ok ok', 'blocked blocked', 'ok blocked', 'blocked ok'],
          3,
          'An active reader blocks a writer but allows another reader.',
        ),
        choose(
          'What does try_borrow do that borrow does not?',
          [
            'It waits until the conflicting guard ends',
            'It checks the borrow at compile time',
            'It returns a copy of the value instead of a guard',
            'It returns Err on a conflict instead of panicking',
          ],
          3,
          'The check is the same; only the way a conflict is reported differs.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let cell = std::cell::RefCell::new(3);\n    let a = cell.borrow();\n    let b = cell.try_borrow();\n    let c = cell.try_borrow_mut();\n    println!("{} {}", b.is_ok(), c.is_ok());\n}',
          ['true false', 'false false', 'true true', 'false true'],
          0,
          'With reader a active, a second reader is fine but a writer is refused.',
        ),
        choose(
          'When does try_borrow_mut return Err?',
          [
            'While any borrow or borrow_mut guard is still alive',
            'When the value inside is zero',
            'When the RefCell was declared without mut',
            'After try_borrow was called and its guard dropped',
          ],
          0,
          'A mutable borrow needs exclusive access, so any live guard blocks it.',
        ),
      ],
    },
    {
      title: 'Release the guard, then try again',
      explanation: [
        'A conflict lasts exactly as long as the blocking guard. drop(guard), or the end of the guard’s scope, releases the borrow, and a retry then succeeds.',
        'A function can wrap the attempt and report success as a bool or Result, leaving the decision about conflicts to its caller.',
      ],
      example: {
        language: 'rust',
        code: 'fn try_add(cell: &std::cell::RefCell<i32>, amount: i32) -> bool {\n    match cell.try_borrow_mut() {\n        Ok(mut value) => {\n            *value += amount;\n            true\n        }\n        Err(_) => false,\n    }\n}\n\nfn main() {\n    let cell = std::cell::RefCell::new(1);\n    let reader = cell.borrow();\n    let first = try_add(&cell, 5);\n    drop(reader);\n    let second = try_add(&cell, 5);\n    println!("{} {} {}", first, second, cell.borrow());\n}',
        output: 'false true 6',
        explanation:
          'The first attempt fails because reader is active. After drop(reader), the second attempt adds 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn try_add(cell: &std::cell::RefCell<i32>, amount: i32) -> bool {\n    match cell.try_borrow_mut() {\n        Ok(mut value) => {\n            *value += amount;\n            true\n        }\n        Err(_) => false,\n    }\n}\n\nfn main() {\n    let cell = std::cell::RefCell::new(10);\n    let guard = cell.borrow_mut();\n    let a = try_add(&cell, 1);\n    drop(guard);\n    let b = try_add(&cell, 2);\n    let c = try_add(&cell, 3);\n    println!("{} {} {} {}", a, b, c, cell.borrow());\n}',
          [
            'false true true 15',
            'false true true 16',
            'true true true 16',
            'false false true 13',
          ],
          0,
          'Only the attempt made while guard existed fails, so 2 and 3 are added to 10.',
        ),
        choose(
          'Inside try_add, when is the guard from Ok(mut value) released?',
          [
            'Only when the program exits',
            'When the caller drops the RefCell',
            'Immediately after try_borrow_mut returns',
            'At the end of its match arm',
          ],
          3,
          'The guard lives in value, which ends with its arm, so the next attempt is not blocked by it.',
        ),
        choose(
          'Why might a program prefer try_borrow over borrow?',
          [
            'try_borrow is checked by the compiler instead',
            'borrow cannot read values stored inside a RefCell',
            'A conflict is expected sometimes and should be handled, not crash',
            'try_borrow clones the value so no guard exists',
          ],
          2,
          'When overlapping access is a normal situation, a Result lets the code choose what to do.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let cell = std::cell::RefCell::new(vec![1, 2]);\n    let during;\n    {\n        let _writer = cell.borrow_mut();\n        during = cell.try_borrow().is_err();\n    }\n    let after = cell.try_borrow().is_err();\n    println!("{} {}", during, after);\n}',
          ['true false', 'false false', 'true true', 'false true'],
          0,
          '_writer is a named binding, so the guard lives until the block ends; afterwards reading succeeds.',
        ),
      ],
    },
  ],
  'rust-thread-move': [
    {
      title: 'Spawn a thread and join it for its result',
      explanation: [
        'std::thread::spawn(closure) starts a new thread that runs the closure and returns a JoinHandle at once. Main keeps running while the thread works.',
        'handle.join() waits for the thread to finish and returns a Result holding the closure’s return value, or Err if the thread panicked; unwrap takes the value out. Without join, main might finish before the thread does.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let handle = std::thread::spawn(|| 6 * 7);\n    let answer = handle.join().unwrap();\n    println!("{}", answer);\n}',
        output: '42',
        explanation:
          'The thread computes 42; join waits for it and hands the closure’s return value back to main.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = std::thread::spawn(|| 10 + 5);\n    let b = std::thread::spawn(|| 10 * 5);\n    let second = b.join().unwrap();\n    let first = a.join().unwrap();\n    println!("{} {}", first, second);\n}',
          ['15 50', '50 15', '15 15', '50 50'],
          0,
          'Each handle returns its own thread’s result, whatever order the joins happen in.',
        ),
        choose(
          'A thread’s closure returns a String. What does handle.join() return?',
          [
            'The String itself, with no wrapper around it',
            'Nothing; join only waits for the thread',
            'A Result holding the String, or Err if the thread panicked',
            'An Option that is None while the thread still runs',
          ],
          2,
          'join reports whether the thread finished normally, so the value comes wrapped in a Result.',
        ),
        choose(
          'Why must main call join before using a value computed by a thread?',
          [
            'join waits for the thread, so its result exists',
            'join starts the thread, which otherwise never runs',
            'join copies the thread’s local variables into main',
            'join makes the thread run on a faster core',
          ],
          0,
          'The thread starts at spawn; join is the point where main waits for it and receives its result.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let handle = std::thread::spawn(|| {\n        let mut total = 0;\n        for n in 1..=4 {\n            total += n;\n        }\n        total\n    });\n    println!("before join");\n    println!("{}", handle.join().unwrap());\n}',
          [
            'before join\n10',
            '10\nbefore join',
            'before join\n4',
            'before join',
          ],
          0,
          'Only main prints. It prints its first line, then waits in join for the thread’s sum of 1 to 4.',
        ),
      ],
    },
    {
      title: 'Move owned data into the thread',
      explanation: [
        'A spawned thread may keep running after the function that started it returns, so its closure is not allowed to borrow that function’s local variables.',
        'Writing move || moves each captured value into the closure, and with it into the thread. The original binding can no longer be used; clone the value first if main still needs it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let name = String::from("worker");\n    let handle = std::thread::spawn(move || format!("{} done", name));\n    println!("{}", handle.join().unwrap());\n}',
        output: 'worker done',
        explanation:
          'name moves into the thread, which builds the message and returns it through join.',
      },
      questions: [
        choose(
          'Why is this program rejected?',
          [
            'Strings cannot be used by other threads at all',
            'The thread might outlive text, so it cannot borrow it',
            'len cannot be called inside a closure',
            'spawn requires the closure to return ()',
          ],
          1,
          'Without move, the closure borrows text, and spawn requires captures that stay valid for as long as the thread might run.',
          'fn main() {\n    let text = String::from("abc");\n    let handle = std::thread::spawn(|| text.len());\n    println!("{}", handle.join().unwrap());\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let text = String::from("hello");\n    let copy = text.clone();\n    let handle = std::thread::spawn(move || copy.len() * 10);\n    println!("{} {}", handle.join().unwrap(), text);\n}',
          ['50 hello', '5 hello', 'hello 50', '50 hellohello'],
          0,
          'Only the clone moves into the thread, so main can still print text.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    for i in 1..=3 {\n        let result = std::thread::spawn(move || i * i).join().unwrap();\n        println!("{}", result);\n    }\n}',
          ['1\n4\n9', '1\n2\n3', '9\n4\n1', '2\n4\n6'],
          0,
          'Each pass moves its own i into a new thread and joins it before the next pass starts.',
        ),
        choose(
          'After let h = std::thread::spawn(move || name.len());, where name is a String, what can main do with name?',
          [
            'Read it, since the closure only calls len',
            'Change it, and the thread sees the change',
            'Use it again after join hands it back',
            'Nothing; it was moved into the thread’s closure',
          ],
          3,
          'move transfers ownership into the closure even if the body only reads the value.',
        ),
      ],
    },
  ],
  'rust-scoped-threads': [
    {
      title: 'Scoped threads may borrow local data',
      explanation: [
        'std::thread::scope(|s| { ... }) creates a scope, and s.spawn(...) starts threads inside it. The scope does not return until every thread spawned in it has finished.',
        'Because of that guarantee, scoped threads may borrow local variables directly, with no move and no clone. The value the closure passed to scope returns becomes the result of the whole scope call.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let values = [1, 2, 3, 4];\n    let total = std::thread::scope(|s| {\n        let handle = s.spawn(|| values.iter().sum::<i32>());\n        handle.join().unwrap()\n    });\n    println!("{} {}", total, values.len());\n}',
        output: '10 4',
        explanation:
          'The thread borrows values to sum it; main still owns values afterwards.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let data = [3, 1, 4, 1, 5, 9];\n    let total = std::thread::scope(|s| {\n        let a = s.spawn(|| data[..3].iter().sum::<i32>());\n        let b = s.spawn(|| data[3..].iter().sum::<i32>());\n        a.join().unwrap() * 100 + b.join().unwrap()\n    });\n    println!("{}", total);\n}',
          ['23', '1508', '815', '800'],
          2,
          'The two threads borrow different halves: 3 + 1 + 4 is 8 and 1 + 5 + 9 is 15.',
        ),
        choose(
          'Why may a scoped thread borrow a local array when a std::thread::spawn thread may not?',
          [
            'Scoped threads copy every local variable they use',
            'Scoped threads run on the same thread as main',
            'The scope waits for its threads, so the borrow stays valid',
            'spawn threads may not read any data at all',
          ],
          2,
          'The borrowed data outlives every thread in the scope, which is exactly what borrowing requires.',
        ),
        choose(
          'When does std::thread::scope(|s| { ... }) return?',
          [
            'Immediately after its last spawn call',
            'As soon as the first thread finishes',
            'Once every thread in it has finished',
            'Only when the whole program returns',
          ],
          2,
          'Waiting for all of its threads is what the scope promises.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let message = String::from("scoped");\n    let length = std::thread::scope(|s| s.spawn(|| message.len()).join().unwrap());\n    println!("{} {}", message, length);\n}',
          ['6 scoped', 'scoped 7', 'scoped 6', '6'],
          2,
          'The thread only borrowed message, so main prints both the String and its length.',
        ),
      ],
    },
    {
      title: 'Join scoped results in a fixed order',
      explanation: [
        'Several scoped threads may borrow the same data at once. They can finish in any order, but each result comes back through its own handle, so joining the handles in a fixed order gives the same output every run.',
        'Threads that are never joined explicitly are still waited for when the scope ends.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let words = ["red", "green", "blue"];\n    let lengths = std::thread::scope(|s| {\n        let first = s.spawn(|| words[0].len());\n        let second = s.spawn(|| words[1].len());\n        let third = s.spawn(|| words[2].len());\n        [first.join().unwrap(), second.join().unwrap(), third.join().unwrap()]\n    });\n    println!("{} {} {}", lengths[0], lengths[1], lengths[2]);\n}',
        output: '3 5 4',
        explanation:
          'Whichever thread finishes first, the array is filled from the handles in spawn order.',
      },
      questions: [
        choose(
          'The three threads in the example may finish in any order. Why is the output still fixed?',
          [
            'Scoped threads always finish in the order they were spawned',
            'The scope sorts the results by finishing time',
            'Results are collected by joining the handles in a fixed order',
            'Each thread waits for the previous one to print',
          ],
          2,
          'The order of the results comes from the code that joins, not from the timing of the threads.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let scores = [72, 95, 64, 88];\n    let summary = std::thread::scope(|s| {\n        let total = s.spawn(|| scores.iter().sum::<i32>());\n        let count = s.spawn(|| scores.len());\n        (total.join().unwrap(), count.join().unwrap())\n    });\n    println!("{} {}", summary.0, summary.1);\n}',
          ['4 319', '319 3', '319 4', '72 4'],
          2,
          'Two threads read the same array at once; the tuple places the total first and the count second.',
        ),
        choose(
          'A scope spawns threads but never calls join on them. What happens at the end of the scope?',
          [
            'The scope waits for them before returning',
            'The threads are stopped where they are',
            'The program exits without waiting',
            'The compiler rejects the scope',
          ],
          0,
          'A scope always joins its remaining threads automatically.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let name = String::from("ivy");\n    std::thread::scope(|s| {\n        s.spawn(|| println!("hello {}", name));\n    });\n    println!("bye {}", name);\n}',
          ['bye ivy\nhello ivy', 'hello ivy\nbye ivy', 'bye ivy', 'hello ivy'],
          1,
          'The scope does not return until the thread has printed, so hello always comes first.',
        ),
      ],
    },
  ],
  'rust-mutex': [
    {
      title: 'lock returns a guard with exclusive access',
      explanation: [
        'std::sync::Mutex<T> wraps a value. m.lock() waits until no one else holds the lock and returns a Result containing a guard; unwrap takes the guard. Through the guard, *guard reads or changes the value.',
        'The lock is released when the guard is dropped: at the end of the statement for an unnamed guard, or at the end of the block for a guard stored in a variable. There is no separate unlock call.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let counter = std::sync::Mutex::new(0);\n    {\n        let mut guard = counter.lock().unwrap();\n        *guard += 5;\n    }\n    *counter.lock().unwrap() += 2;\n    println!("{}", counter.lock().unwrap());\n}',
        output: '7',
        explanation:
          'The named guard releases the lock at the end of its block, so the next lock call can proceed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn deposit(account: &std::sync::Mutex<i32>, amount: i32) {\n    *account.lock().unwrap() += amount;\n}\n\nfn main() {\n    let account = std::sync::Mutex::new(100);\n    deposit(&account, 50);\n    deposit(&account, -30);\n    println!("{}", account.lock().unwrap());\n}',
          ['100', '120', '150', '70'],
          1,
          'deposit only needs a shared reference: the lock provides the exclusive access to change the value.',
        ),
        choose(
          'What does m.lock() do while another thread holds the lock?',
          [
            'Returns Err immediately without waiting',
            'Waits for the release, then returns a guard',
            'Returns a copy of the protected value',
            'Panics with a deadlock error message',
          ],
          1,
          'lock blocks the calling thread until the mutex is free.',
        ),
        choose(
          'When is a Mutex’s lock released?',
          [
            'When unlock is called on the Mutex',
            'Only when the Mutex itself is dropped',
            'After a fixed timeout',
            'When the guard returned by lock is dropped',
          ],
          3,
          'The guard represents the held lock; dropping it unlocks.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let log = std::sync::Mutex::new(String::from("a"));\n    log.lock().unwrap().push_str("b");\n    {\n        let mut entry = log.lock().unwrap();\n        entry.push_str("c");\n        entry.push_str("d");\n    }\n    println!("{}", log.lock().unwrap().len());\n}',
          ['3', '4', '1', '2'],
          1,
          'Every change goes through a guard, and each guard ends before the next lock call.',
        ),
      ],
    },
    {
      title: 'Share the Mutex with a thread, and unlock before joining',
      explanation: [
        'A spawned thread needs ownership of what it uses, so the Mutex goes inside an Arc and each thread receives an Arc clone. The Mutex makes sure only one thread changes the value at a time.',
        'Release your own guard before waiting for a thread that needs the same lock. If main holds the guard while joining, the thread waits for main and main waits for the thread.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(10));\n    let worker = std::sync::Arc::clone(&shared);\n    let handle = std::thread::spawn(move || {\n        *worker.lock().unwrap() *= 3;\n    });\n    handle.join().unwrap();\n    println!("{}", shared.lock().unwrap());\n}',
        output: '30',
        explanation:
          'The thread locks through its Arc clone. main locks only after join, when the thread is done.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let shared = std::sync::Arc::new(std::sync::Mutex::new(1));\n    for step in 1..=3 {\n        let worker = std::sync::Arc::clone(&shared);\n        std::thread::spawn(move || {\n            *worker.lock().unwrap() += step;\n        })\n        .join()\n        .unwrap();\n    }\n    println!("{}", shared.lock().unwrap());\n}',
          ['6', '4', '7', '10'],
          2,
          'Each thread adds its step to the same protected value: 1 + 1 + 2 + 3.',
        ),
        choose(
          'main holds let guard = shared.lock().unwrap(); and then joins a thread that also calls shared.lock(). What happens?',
          [
            'They wait for each other forever: a deadlock',
            'The thread reads the value through main’s guard',
            'lock returns Err inside the thread',
            'join releases main’s guard automatically',
          ],
          0,
          'The thread cannot get the lock until main drops its guard, and main does not continue until the thread ends.',
        ),
        choose(
          'Why is the Mutex wrapped in an Arc before it is given to a spawned thread?',
          [
            'Arc is what makes the value changeable',
            'A Mutex cannot be created without an Arc',
            'Each thread needs its own handle to one Mutex',
            'Arc lets every lock call skip the wait',
          ],
          2,
          'Arc provides shared ownership; the Mutex inside provides the exclusive access.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let text = std::sync::Arc::new(std::sync::Mutex::new(String::from("go")));\n    let worker = std::sync::Arc::clone(&text);\n    std::thread::spawn(move || worker.lock().unwrap().push_str("!"))\n        .join()\n        .unwrap();\n    let final_text = text.lock().unwrap().clone();\n    println!("{} {}", final_text, std::sync::Arc::strong_count(&text));\n}',
          ['go! 2', 'go 1', 'go! 1', 'go!! 1'],
          2,
          'The thread’s change is visible after join, and its Arc clone was dropped when the thread finished.',
        ),
      ],
    },
  ],
  'rust-channels': [
    {
      title: 'send moves a message to the receiver',
      explanation: [
        'let (tx, rx) = std::sync::mpsc::channel(); makes a sender and a receiver. tx.send(value) moves the value into the channel, and rx.recv() waits for the next message and returns it in an Ok.',
        'Messages from one sender arrive in the order they were sent. recv returns Err only once every sender is gone and no messages remain.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    let producer = std::thread::spawn(move || {\n        for n in 1..=3 {\n            tx.send(n * 10).unwrap();\n        }\n    });\n    let first = rx.recv().unwrap();\n    let second = rx.recv().unwrap();\n    producer.join().unwrap();\n    println!("{} {}", first, second);\n}',
        output: '10 20',
        explanation:
          'The producer sends 10, 20, 30 in order; main receives the first two.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    std::thread::spawn(move || {\n        tx.send(String::from("first")).unwrap();\n        tx.send(String::from("second")).unwrap();\n    })\n    .join()\n    .unwrap();\n    let a = rx.recv().unwrap();\n    let b = rx.recv().unwrap();\n    println!("{} {}", b, a);\n}',
          ['first second', 'second second', 'second first', 'first first'],
          2,
          'The messages queue up in send order; the program then prints them swapped.',
        ),
        choose(
          'After tx.send(message), where message is a String, what can the sending thread do with message?',
          [
            'Read it, since send only borrows it',
            'Change it, and the receiver sees the change',
            'Nothing; send moved it into the channel',
            'Send it again to deliver a second copy',
          ],
          2,
          'send takes the value by ownership and hands it to the receiving side.',
        ),
        choose(
          'What does rx.recv() do when no message has arrived yet but a sender still exists?',
          [
            'Returns Err immediately',
            'Returns the previous message again',
            'Returns Ok with a default value',
            'Waits until a message arrives',
          ],
          3,
          'While a sender exists, a message may still come, so recv blocks.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    std::thread::spawn(move || tx.send(5).unwrap()).join().unwrap();\n    let a = rx.recv();\n    let b = rx.recv();\n    println!("{} {}", a.is_ok(), b.is_ok());\n}',
          ['true true', 'false false', 'true false', 'false true'],
          2,
          'The only sender was moved into the finished thread and dropped, so after the one message recv reports Err.',
        ),
      ],
    },
    {
      title: 'Receive until every sender is gone',
      explanation: [
        'A for loop over the receiver, for msg in rx, keeps receiving until every sender has been dropped and the channel is empty. A sender that stays alive keeps such a loop waiting.',
        'tx.clone() gives each producer its own sender. Each sender’s messages stay in order, but messages from different senders can interleave, so deterministic programs combine them with a sum or count, or join producers one at a time.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    let tx2 = tx.clone();\n    let a = std::thread::spawn(move || {\n        for n in [1, 2, 3] {\n            tx.send(n).unwrap();\n        }\n    });\n    let b = std::thread::spawn(move || {\n        for n in [10, 20] {\n            tx2.send(n).unwrap();\n        }\n    });\n    a.join().unwrap();\n    b.join().unwrap();\n    let mut total = 0;\n    let mut count = 0;\n    for value in rx {\n        total += value;\n        count += 1;\n    }\n    println!("{} messages, total {}", count, total);\n}',
        output: '5 messages, total 36',
        explanation:
          'Both senders were moved into threads that have finished, so the loop ends after the five queued messages.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    let producer = std::thread::spawn(move || {\n        for word in ["a", "b", "c"] {\n            tx.send(word).unwrap();\n        }\n    });\n    let mut joined = String::new();\n    for word in rx {\n        joined.push_str(word);\n    }\n    producer.join().unwrap();\n    println!("{}", joined);\n}',
          ['cba', 'abc', 'a', 'ab'],
          1,
          'One sender keeps its order, and the loop ends when the producer finishes and drops tx.',
        ),
        choose(
          'A loop for msg in rx { ... } never ends. What is the likely cause?',
          [
            'The channel holds too many messages',
            'for loops can never end on a receiver',
            'A sender, like tx in main, is still alive',
            'The receiver was cloned by mistake',
          ],
          2,
          'The loop only ends when no sender could send again; one forgotten tx keeps it waiting.',
        ),
        choose(
          'Two producer threads send into one channel at the same time. What does the receiver see?',
          [
            'Each sender’s messages in order, possibly interleaved',
            'All of the first thread’s messages before the second’s',
            'Messages sorted by value',
            'A random order even within one sender',
          ],
          0,
          'The channel preserves order per sender but not across senders.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let (tx, rx) = std::sync::mpsc::channel();\n    let tx2 = tx.clone();\n    std::thread::spawn(move || tx.send(4).unwrap()).join().unwrap();\n    std::thread::spawn(move || tx2.send(9).unwrap()).join().unwrap();\n    let total: i32 = rx.iter().sum();\n    println!("{}", total);\n}',
          ['9', '13', '4', '49'],
          1,
          'Both senders are dropped with their threads, so the receiver’s iterator ends after the two messages.',
        ),
      ],
    },
  ],
  'rust-atomic-load-store': [
    {
      title: 'store and load one shared integer',
      explanation: [
        'std::sync::atomic::AtomicU32 is an integer that can be read with load and written with store through a shared reference. Each access happens as one indivisible step, so threads sharing it never cause a data race.',
        'Every atomic operation takes an Ordering. Ordering::Relaxed is enough when only this one value matters; it does not make other memory written earlier visible to other threads.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let level = AtomicU32::new(3);\n    level.store(8, Ordering::Relaxed);\n    let seen = level.load(Ordering::Relaxed);\n    println!("{}", seen);\n}',
        output: '8',
        explanation:
          'store replaces the value and load reads the current one; no mut binding is needed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn reset(value: &AtomicU32) {\n    value.store(0, Ordering::Relaxed);\n}\n\nfn main() {\n    let value = AtomicU32::new(42);\n    let before = value.load(Ordering::Relaxed);\n    reset(&value);\n    println!("{} {}", before, value.load(Ordering::Relaxed));\n}',
          ['0 0', '42 42', '42 0', '0 42'],
          2,
          'before is a plain copy read earlier; reset changes the atomic through a shared reference.',
        ),
        choose(
          'Why can store change an AtomicU32 through a shared & reference?',
          [
            'Atomics allow indivisible changes through &',
            'store quietly clones the atomic first',
            'The compiler turns & into &mut for atomics',
            'Changes made through & are invisible to others',
          ],
          0,
          'Atomic types are designed so that concurrent loads and stores through shared references are safe.',
        ),
        choose(
          'What do atomic loads and stores guarantee that plain unsynchronized reads and writes from several threads do not?',
          [
            'That threads see writes in the order of their thread ids',
            'No data race: each access happens as one indivisible step',
            'That the value never changes once stored',
            'That all memory written before the store is visible too',
          ],
          1,
          'Atomicity covers this one value. Publishing other memory needs stronger orderings than Relaxed.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicBool, Ordering};\n\nfn main() {\n    let done = AtomicBool::new(false);\n    let before = done.load(Ordering::Relaxed);\n    done.store(true, Ordering::Relaxed);\n    println!("{} {}", before, done.load(Ordering::Relaxed));\n}',
          ['true true', 'false false', 'false true', 'true false'],
          2,
          'AtomicBool works the same way as AtomicU32: the first load sees false, the second sees the stored true.',
        ),
      ],
    },
    {
      title: 'Share an atomic between threads',
      explanation: [
        'A static atomic, such as static STATUS: AtomicU32 = AtomicU32::new(1);, lives for the whole program, so any thread may use it without moving or cloning anything.',
        'After join, main sees every store the thread made. A load followed by a separate store is not one step, though: another thread’s store can land between them.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic STATUS: AtomicU32 = AtomicU32::new(1);\n\nfn main() {\n    std::thread::spawn(|| STATUS.store(5, Ordering::Relaxed))\n        .join()\n        .unwrap();\n    println!("{}", STATUS.load(Ordering::Relaxed));\n}',
        output: '5',
        explanation:
          'The thread stores into the static atomic; after join, main loads the new value.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic LAST: AtomicU32 = AtomicU32::new(0);\n\nfn main() {\n    for id in [3, 7, 2] {\n        std::thread::spawn(move || LAST.store(id, Ordering::Relaxed))\n            .join()\n            .unwrap();\n    }\n    println!("{}", LAST.load(Ordering::Relaxed));\n}',
          ['7', '2', '12', '3'],
          1,
          'Each thread is joined before the next starts, so the last store wins.',
        ),
        choose(
          'Two threads each run let v = X.load(Relaxed); X.store(v + 1, Relaxed); on a shared atomic starting at 0. After both finish, what can X hold?',
          [
            '1 or 2, since a store can land between a load and a store',
            'Always 2, because each access is atomic',
            'Always 1, because the second store is ignored',
            '0, because Relaxed stores may be discarded',
          ],
          0,
          'Both threads may load 0 before either stores, and then both store 1.',
        ),
        choose(
          'When is Ordering::Relaxed enough?',
          [
            'When the store must publish a buffer filled just before',
            'Never; Relaxed allows half-written values',
            'When no other data depends on this value',
            'Only for values that fit in a single byte',
          ],
          2,
          'Relaxed keeps each access atomic but makes no promise about other memory.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicBool, Ordering};\n\nstatic DONE: AtomicBool = AtomicBool::new(false);\n\nfn main() {\n    let before = DONE.load(Ordering::Relaxed);\n    std::thread::spawn(|| DONE.store(true, Ordering::Relaxed))\n        .join()\n        .unwrap();\n    let after = DONE.load(Ordering::Relaxed);\n    println!("{} {}", before, after);\n}',
          ['true true', 'false true', 'false false', 'true false'],
          1,
          'The thread sets the flag; the load after join sees it.',
        ),
      ],
    },
  ],
  'rust-atomic-fetch': [
    {
      title: 'fetch_add updates in one step and returns the old value',
      explanation: [
        'x.fetch_add(n, ordering) adds n as a single indivisible step, so no other thread can slip in between reading and writing. It returns the value from before the addition.',
        'Related methods work the same way: fetch_sub subtracts, and fetch_max keeps the larger value. Each returns the previous value.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let tickets = AtomicU32::new(100);\n    let mine = tickets.fetch_add(1, Ordering::Relaxed);\n    let yours = tickets.fetch_add(1, Ordering::Relaxed);\n    println!("{} {} {}", mine, yours, tickets.load(Ordering::Relaxed));\n}',
        output: '100 101 102',
        explanation:
          'Each call returns the number before its own increment, and the atomic ends two higher.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let stock = AtomicU32::new(10);\n    let a = stock.fetch_sub(3, Ordering::Relaxed);\n    let b = stock.fetch_add(5, Ordering::Relaxed);\n    println!("{} {} {}", a, b, stock.load(Ordering::Relaxed));\n}',
          ['7 12 12', '10 10 12', '10 7 12', '7 2 12'],
          2,
          'fetch_sub returns 10 and leaves 7; fetch_add returns 7 and leaves 12.',
        ),
        choose(
          'What does fetch_add return?',
          [
            'The value after the addition',
            'Nothing; it only updates',
            'The value before the addition',
            'true if the addition succeeded',
          ],
          2,
          'Returning the previous value tells each caller exactly which value it replaced.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let best = AtomicU32::new(40);\n    let a = best.fetch_max(25, Ordering::Relaxed);\n    let b = best.fetch_max(70, Ordering::Relaxed);\n    println!("{} {} {}", a, b, best.load(Ordering::Relaxed));\n}',
          ['40 70 70', '40 40 70', '25 70 70', '40 25 70'],
          1,
          '25 does not beat 40, so the first call changes nothing; 70 does, and the second call returns the old 40.',
        ),
        choose(
          'Why use fetch_add instead of a load followed by a store of the value plus one?',
          [
            'A thread could update between them, losing a count',
            'load and store cannot be used on the same atomic',
            'fetch_add needs no memory ordering argument',
            'store cannot write a value larger than the old one',
          ],
          0,
          'fetch_add makes the read and the write one indivisible operation.',
        ),
      ],
    },
    {
      title: 'Concurrent increments add up exactly',
      explanation: [
        'When many threads call fetch_add on one atomic, every increment is counted, whatever order the threads run in. After joining them all, the total is exact.',
        'Because each call returns the previous value, concurrent callers also receive distinct numbers, which makes fetch_add a simple source of unique ids.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic HITS: AtomicU32 = AtomicU32::new(0);\n\nfn main() {\n    let mut handles = Vec::new();\n    for _ in 0..4 {\n        handles.push(std::thread::spawn(|| {\n            for _ in 0..1000 {\n                HITS.fetch_add(1, Ordering::Relaxed);\n            }\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", HITS.load(Ordering::Relaxed));\n}',
        output: '4000',
        explanation:
          'Four threads add 1000 each. Interleaving changes nothing, because each increment is atomic.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic TOTAL: AtomicU32 = AtomicU32::new(0);\n\nfn main() {\n    let mut handles = Vec::new();\n    for _ in 0..3 {\n        handles.push(std::thread::spawn(|| {\n            for _ in 0..250 {\n                TOTAL.fetch_add(2, Ordering::Relaxed);\n            }\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", TOTAL.load(Ordering::Relaxed));\n}',
          ['750', '1500', '500', '1000'],
          1,
          'Three threads each add 2 a total of 250 times: 3 * 250 * 2.',
        ),
        choose(
          'Four threads each run let id = NEXT.fetch_add(1, Ordering::Relaxed); on an atomic that starts at 0. What is guaranteed?',
          [
            'The first thread spawned always gets 0',
            'Two threads may receive the same id',
            'Every thread receives the value 4',
            'Each gets a distinct id from 0 to 3',
          ],
          3,
          'Each fetch_add sees a different previous value, but which thread gets which depends on timing.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic NEXT: AtomicU32 = AtomicU32::new(10);\n\nfn main() {\n    let mut handles = Vec::new();\n    for _ in 0..3 {\n        handles.push(std::thread::spawn(|| NEXT.fetch_add(1, Ordering::Relaxed)));\n    }\n    let mut sum = 0;\n    for handle in handles {\n        sum += handle.join().unwrap();\n    }\n    println!("{} {}", sum, NEXT.load(Ordering::Relaxed));\n}',
          ['30 13', '36 13', '33 13', '33 12'],
          2,
          'The threads receive 10, 11, and 12 in some order, so their sum is fixed at 33, and NEXT ends at 13.',
        ),
        choose(
          'Why is Relaxed enough for a hit counter that main reads only after joining every thread?',
          [
            'join makes the final count visible',
            'Relaxed makes fetch_add skip atomicity',
            'Counters must always use SeqCst',
            'Relaxed makes the threads run in order',
          ],
          0,
          'The counter publishes no other data, and joining a thread makes its effects visible to main.',
        ),
      ],
    },
  ],
  'rust-compare-exchange': [
    {
      title: 'Store only if the value is what you expect',
      explanation: [
        'x.compare_exchange(expected, new, success, failure) checks and swaps in one step. If the current value equals expected, it stores new and returns Ok(previous). Otherwise it changes nothing and returns Err(actual).',
        'The two orderings apply to the success and failure cases; Ordering::SeqCst for both is a safe default.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let state = AtomicU32::new(0);\n    let first = state.compare_exchange(0, 1, Ordering::SeqCst, Ordering::SeqCst);\n    let second = state.compare_exchange(0, 2, Ordering::SeqCst, Ordering::SeqCst);\n    println!("{:?} {:?} {}", first, second, state.load(Ordering::SeqCst));\n}',
        output: 'Ok(0) Err(1) 1',
        explanation:
          'The first call finds 0 and stores 1. The second expects 0 but finds 1, so it stores nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn main() {\n    let slot = AtomicU32::new(5);\n    let a = slot.compare_exchange(5, 9, Ordering::SeqCst, Ordering::SeqCst);\n    let b = slot.compare_exchange(9, 3, Ordering::SeqCst, Ordering::SeqCst);\n    let c = slot.compare_exchange(9, 4, Ordering::SeqCst, Ordering::SeqCst);\n    println!("{:?} {:?} {:?}", a, b, c);\n}',
          [
            'Ok(9) Ok(3) Err(3)',
            'Ok(5) Ok(9) Err(3)',
            'Ok(5) Ok(9) Ok(3)',
            'Ok(5) Err(9) Err(3)',
          ],
          1,
          'Ok carries the replaced value. The third call expects 9, but the slot already holds 3.',
        ),
        choose(
          'compare_exchange returns Err(7). What happened?',
          [
            'Nothing was stored; the value was 7',
            'The new value was stored, and 7 was the old value',
            'The atomic was reset to the value 7',
            'The store will be retried automatically later',
          ],
          0,
          'Err means the comparison failed, and it reports the value that was actually there.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn claim(lock: &AtomicU32, id: u32) -> String {\n    match lock.compare_exchange(0, id, Ordering::SeqCst, Ordering::SeqCst) {\n        Ok(_) => format!("{} claimed", id),\n        Err(owner) => format!("{} saw owner {}", id, owner),\n    }\n}\n\nfn main() {\n    let lock = AtomicU32::new(0);\n    println!("{}", claim(&lock, 7));\n    println!("{}", claim(&lock, 9));\n}',
          [
            '7 claimed\n9 claimed',
            '7 saw owner 0\n9 saw owner 7',
            '7 claimed\n9 saw owner 7',
            '7 claimed\n9 saw owner 9',
          ],
          2,
          'Only the first claim finds 0. The second finds 7 and reports it through Err.',
        ),
        choose(
          'Why is if x.load(..) == 0 { x.store(1, ..) } weaker than x.compare_exchange(0, 1, ..)?',
          [
            'load results cannot be compared with ==',
            'store always fails right after a load',
            'Another thread can change x between the load and the store',
            'compare_exchange skips the comparison to be faster',
          ],
          2,
          'compare_exchange performs the check and the store as one atomic step.',
        ),
      ],
    },
    {
      title: 'Retry in a loop to apply any update',
      explanation: [
        'To apply an arbitrary change atomically, read the current value, compute the new one, and call compare_exchange(current, new, ..). If it returns Err(actual), another thread got there first: recompute from actual and try again.',
        'while let Err(actual) = ... { current = actual; } expresses this retry loop directly.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn add_capped(x: &AtomicU32, amount: u32, cap: u32) -> u32 {\n    let mut current = x.load(Ordering::SeqCst);\n    while let Err(actual) = x.compare_exchange(\n        current,\n        (current + amount).min(cap),\n        Ordering::SeqCst,\n        Ordering::SeqCst,\n    ) {\n        current = actual;\n    }\n    (current + amount).min(cap)\n}\n\nfn main() {\n    let level = AtomicU32::new(7);\n    println!("{} {}", add_capped(&level, 2, 10), add_capped(&level, 5, 10));\n}',
        output: '9 10',
        explanation:
          'Each call computes the capped sum from the value it saw and stores it only if that value is still current.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nfn double(x: &AtomicU32) -> u32 {\n    let mut current = x.load(Ordering::SeqCst);\n    while let Err(actual) =\n        x.compare_exchange(current, current * 2, Ordering::SeqCst, Ordering::SeqCst)\n    {\n        current = actual;\n    }\n    current * 2\n}\n\nfn main() {\n    let x = AtomicU32::new(3);\n    double(&x);\n    println!("{} {}", double(&x), x.load(Ordering::SeqCst));\n}',
          ['6 12', '6 6', '12 12', '12 24'],
          2,
          'The first call stores 6; the second doubles 6 to 12 and returns it.',
        ),
        choose(
          'In a compare_exchange retry loop, what should happen after Err(actual)?',
          [
            'Store the new value anyway with store',
            'Give up, since another thread owns the value',
            'Retry with the same expected value as before',
            'Recompute the new value from actual and try again',
          ],
          3,
          'The update must be based on the value that is really there now.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::sync::atomic::{AtomicU32, Ordering};\n\nstatic LEVEL: AtomicU32 = AtomicU32::new(0);\n\nfn add_capped(amount: u32, cap: u32) {\n    let mut current = LEVEL.load(Ordering::SeqCst);\n    while let Err(actual) = LEVEL.compare_exchange(\n        current,\n        (current + amount).min(cap),\n        Ordering::SeqCst,\n        Ordering::SeqCst,\n    ) {\n        current = actual;\n    }\n}\n\nfn main() {\n    let mut handles = Vec::new();\n    for _ in 0..4 {\n        handles.push(std::thread::spawn(|| add_capped(3, 10)));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", LEVEL.load(Ordering::SeqCst));\n}',
          ['12', '10', '3', '9'],
          1,
          'The four updates of 3 would reach 12, but every update respects the cap, whatever order they run in.',
        ),
        choose(
          'Why might the body of a compare_exchange retry loop run more than once?',
          [
            'Another thread changed the value after it was read',
            'compare_exchange always fails on its first attempt',
            'The loop must run once per thread in the program',
            'SeqCst ordering requires two attempts',
          ],
          0,
          'A retry happens only when the value moved underneath the computation.',
        ),
      ],
    },
  ],
  'rust-acquire-release': [
    {
      title: 'A release store publishes earlier writes to an acquire load',
      explanation: [
        'Storing a flag with Ordering::Release and loading it with Ordering::Acquire forms a pair. Once the acquire load reads the value written by the release store, everything the writer did before that store is visible to the reader.',
        'With Relaxed on both sides, the reader may see the flag yet still see old values of the data written before it.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};\n\nstatic DATA: AtomicU32 = AtomicU32::new(0);\nstatic READY: AtomicBool = AtomicBool::new(false);\n\nfn main() {\n    let writer = std::thread::spawn(|| {\n        DATA.store(42, Ordering::Relaxed);\n        READY.store(true, Ordering::Release);\n    });\n    while !READY.load(Ordering::Acquire) {}\n    println!("{}", DATA.load(Ordering::Relaxed));\n    writer.join().unwrap();\n}',
        output: '42',
        explanation:
          'main waits until its acquire load sees true. That load synchronizes with the release store, so the earlier write of 42 is visible.',
      },
      questions: [
        choose(
          'In the example, what guarantees that main prints 42 rather than 0?',
          [
            'Its Acquire load read the value written by the Release store',
            'DATA is written before READY in the source, so order is automatic',
            'Relaxed loads always see the newest value',
            'join is called at the end of main',
          ],
          0,
          'The release/acquire pair is what carries the earlier write across threads; join happens too late to matter.',
        ),
        choose(
          'Which ordering belongs on the store that announces that the data is ready?',
          ['Acquire', 'Relaxed', 'None; stores take no ordering', 'Release'],
          3,
          'Release goes on the store that publishes; Acquire goes on the load that observes.',
        ),
        choose(
          'Both the flag store and the flag load use Relaxed. What may the reader observe?',
          [
            'Nothing; the flag never changes',
            'A compile error about missing orderings',
            'The flag set, but stale data',
            'Always the new data, only more slowly',
          ],
          2,
          'Relaxed orders nothing but the flag itself, so the data writes are not guaranteed to be visible.',
        ),
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};\n\nstatic A: AtomicU32 = AtomicU32::new(0);\nstatic B: AtomicU32 = AtomicU32::new(0);\nstatic READY: AtomicBool = AtomicBool::new(false);\n\nfn main() {\n    let writer = std::thread::spawn(|| {\n        A.store(3, Ordering::Relaxed);\n        B.store(4, Ordering::Relaxed);\n        READY.store(true, Ordering::Release);\n    });\n    while !READY.load(Ordering::Acquire) {}\n    println!("{}", A.load(Ordering::Relaxed) * 10 + B.load(Ordering::Relaxed));\n    writer.join().unwrap();\n}',
          ['0', '30', '7', '34'],
          3,
          'Both writes come before the release store, so both are visible after the acquire load sees true.',
        ),
      ],
    },
    {
      title: 'The guarantee needs the acquire to see the release',
      explanation: [
        'Synchronization only happens when the Acquire load actually reads the value the Release store wrote. If the load still sees the old flag, the reader learns nothing and must not touch the data.',
        'So a reader checks the flag first and reads the data only after seeing it set. Release belongs on stores and Acquire on loads.',
      ],
      example: {
        language: 'rust',
        code: 'use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};\n\nstatic DATA: AtomicU32 = AtomicU32::new(0);\nstatic READY: AtomicBool = AtomicBool::new(false);\n\nfn try_read() -> Option<u32> {\n    if READY.load(Ordering::Acquire) {\n        Some(DATA.load(Ordering::Relaxed))\n    } else {\n        None\n    }\n}\n\nfn main() {\n    let before = try_read();\n    std::thread::spawn(|| {\n        DATA.store(42, Ordering::Relaxed);\n        READY.store(true, Ordering::Release);\n    })\n    .join()\n    .unwrap();\n    println!("{:?} {:?}", before, try_read());\n}',
        output: 'None Some(42)',
        explanation:
          'Before the writer runs, the flag is false and try_read refuses to read DATA. Afterwards it sees the flag and the data.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};\n\nstatic DATA: AtomicU32 = AtomicU32::new(0);\nstatic READY: AtomicBool = AtomicBool::new(false);\n\nfn try_read() -> Option<u32> {\n    if READY.load(Ordering::Acquire) {\n        Some(DATA.load(Ordering::Relaxed))\n    } else {\n        None\n    }\n}\n\nfn main() {\n    DATA.store(5, Ordering::Relaxed);\n    let first = try_read();\n    std::thread::spawn(|| {\n        DATA.store(9, Ordering::Relaxed);\n        READY.store(true, Ordering::Release);\n    })\n    .join()\n    .unwrap();\n    println!("{:?} {:?}", first, try_read());\n}',
          ['Some(5) Some(9)', 'None Some(9)', 'None Some(5)', 'Some(5) None'],
          1,
          'Data written without setting the flag is never handed out; the reader waits for the published 9.',
        ),
        choose(
          'A reader’s Acquire load of the flag returns false. What does it know about the data?',
          [
            'The data is ready, but the flag is stale',
            'The data is certainly still zero',
            'The writer has already finished',
            'Nothing; it must not assume the data is ready',
          ],
          3,
          'Only observing the released value creates the guarantee.',
        ),
        choose(
          'Which pair of operations establishes the guarantee?',
          [
            'An Acquire store and a Release load',
            'A Release store read by an Acquire load',
            'Two Relaxed operations on the same flag',
            'A Release store and any later Relaxed load',
          ],
          1,
          'The release side publishes and the acquire side, reading that value, receives.',
        ),
        choose(
          'Why does the reader load the flag before loading the data?',
          [
            'Only reads after the Acquire load are covered',
            'Loading the data first makes the flag load fail',
            'The order of the two loads never matters',
            'Data loads are slower, so they should go last',
          ],
          0,
          'The acquire load is the point after which the writer’s earlier writes become visible.',
        ),
      ],
    },
  ],
  'rust-send': [
    {
      title: 'Send marks values that may move to another thread',
      explanation: [
        'Send is a marker trait: a type is Send if its values may be moved to another thread. Integers, String, and tuples of Send types are Send. std::rc::Rc is not, because its owner count is updated without atomic operations.',
        "std::thread::spawn requires its closure to be Send + 'static, so everything a move closure captures must be Send and must not borrow local data.",
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let owned = String::from("payload");\n    let length = std::thread::spawn(move || owned.len()).join().unwrap();\n    println!("{}", length);\n}',
        output: '7',
        explanation:
          'A String is Send and owned, so the closure capturing it may run on another thread.',
      },
      questions: [
        choose(
          'Which value can be captured by a move closure passed to std::thread::spawn?',
          [
            'An Rc<String>',
            'A reference to a local String in main',
            'A String',
            'A tuple containing an Rc<u32>',
          ],
          2,
          "Rc is not Send, a tuple holding one is not either, and a local borrow is not 'static.",
        ),
        choose(
          'Why is Rc<T> not Send?',
          [
            'Rc values always live on the stack',
            'Rc values cannot be cloned at all',
            'Rc requires its T to be a Copy type',
            'Its owner count is not updated atomically',
          ],
          3,
          'Clones in two threads could update the plain count at the same time.',
        ),
        choose(
          "What does the 'static bound on spawn’s closure rule out?",
          [
            'Capturing any String value at all',
            'Returning a value from the thread',
            'Capturing borrows of local variables',
            'Using integers inside the thread',
          ],
          2,
          'The thread may outlive the current function, so it may only hold data that cannot dangle.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let parts = (String::from("ab"), 3);\n    let result = std::thread::spawn(move || format!("{}{}", parts.0, parts.1))\n        .join()\n        .unwrap();\n    println!("{}", result);\n}',
          ['ab 3', 'ab3', '3ab', 'ab'],
          1,
          'A tuple of a String and an integer is Send, so it moves into the thread whole.',
        ),
      ],
    },
    {
      title: "Put Send + 'static on generic thread helpers",
      explanation: [
        "A generic function that moves a T into a spawned thread must promise T: Send + 'static, or the compiler rejects the spawn. A value the thread returns through join must be Send as well.",
        'Callers then get a clear error when they pass a type such as Rc, instead of a data race at run time.',
      ],
      example: {
        language: 'rust',
        code: 'fn in_thread<T: Send + \'static>(value: T) -> T {\n    std::thread::spawn(move || value).join().unwrap()\n}\n\nfn main() {\n    let a = in_thread(5);\n    let b = in_thread(String::from("echo"));\n    println!("{} {}", a + 1, b);\n}',
        output: '6 echo',
        explanation:
          'Both i32 and String meet the bound, so each value travels to a thread and back.',
      },
      questions: [
        choose(
          'fn run<T>(value: T) { std::thread::spawn(move || value); } is rejected. What fixes it?',
          [
            'Add the bound T: Copy + Clone',
            'Take &T instead of an owned T',
            "Add the bound T: Send + 'static",
            "Add the bound T: Clone + 'static",
          ],
          2,
          "spawn needs everything it captures to be Send and 'static, so the generic T must promise both.",
        ),
        predictOutput(
          'What does this program print?',
          'fn background<F: FnOnce() -> R + Send + \'static, R: Send + \'static>(job: F) -> R {\n    std::thread::spawn(job).join().unwrap()\n}\n\nfn main() {\n    let base = 10;\n    let a = background(move || base * 2);\n    let b = background(|| String::from("ok"));\n    println!("{} {}", a, b);\n}',
          ['20 ok', '10 ok', 'ok 20', '20'],
          0,
          'Each closure runs on its own thread, and its Send result returns through join.',
        ),
        choose(
          'Calling in_thread(std::rc::Rc::new(1)) is rejected. Why?',
          [
            "Rc<i32> does not live for 'static",
            'Rc<i32> does not implement Send',
            'in_thread only accepts Copy types',
            'A thread can never return a value',
          ],
          1,
          "Rc<i32> owns its data, so it is 'static; the failing part is Send.",
        ),
        choose(
          'Which type is Send?',
          [
            'std::rc::Rc<String>',
            'std::rc::Weak<String>',
            '(u32, std::rc::Rc<u8>)',
            '(String, u32)',
          ],
          3,
          'Rc and its Weak pointers are not Send, and a tuple is Send only if every element is.',
        ),
      ],
    },
  ],
  'rust-sync': [
    {
      title: 'Sync means &T may be shared between threads',
      explanation: [
        'A type T is Sync when a shared reference &T may be used from several threads at once. Types without interior mutability, such as i32, String, and arrays of them, are Sync, so scoped threads can all borrow them together.',
        'std::cell::Cell and RefCell are not Sync: they allow changes through & without any locking, which would race. Thread-safe types such as Mutex and the atomics are Sync.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let table = [2, 4, 6];\n    let total = std::thread::scope(|s| {\n        let a = s.spawn(|| table[0] + table[1]);\n        let b = s.spawn(|| table[2] * 10);\n        a.join().unwrap() + b.join().unwrap()\n    });\n    println!("{}", total);\n}',
        output: '66',
        explanation:
          'Both threads hold &table at the same time, which is allowed because arrays of i32 are Sync.',
      },
      questions: [
        choose(
          'Two scoped threads both borrow a std::cell::Cell<u32>. Why is that rejected?',
          [
            'Cell values cannot be borrowed at all',
            'Cell is not Sync; unlocked changes through & would race',
            'Scoped threads may only borrow integers',
            'Cell is not Send, so it cannot exist in main',
          ],
          1,
          'Sharing &Cell across threads would let two threads set it at once without coordination.',
        ),
        choose(
          'What does it mean for a type T to be Sync?',
          [
            'A T may be moved to one other thread',
            'T may only be used by the thread that created it',
            'A &T may be used from several threads at once',
            'T is copied for each thread that uses it',
          ],
          2,
          'Sync is about sharing references; Send is about moving values.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let text = String::from("shared text");\n    let facts = std::thread::scope(|s| {\n        let len = s.spawn(|| text.len());\n        let has = s.spawn(|| text.contains("text"));\n        (len.join().unwrap(), has.join().unwrap())\n    });\n    println!("{} {}", facts.0, facts.1);\n}',
          ['11 false', '10 true', '2 true', '11 true'],
          3,
          'String is Sync, so both threads read it through shared references at the same time.',
        ),
        choose(
          'Which type may be shared by reference among scoped threads that all change it?',
          [
            'std::sync::Mutex<u32>',
            'std::cell::Cell<u32>',
            'std::cell::RefCell<u32>',
            'A plain u32 changed through &',
          ],
          0,
          'Mutex is Sync because its lock coordinates the changes; the cell types are not.',
        ),
      ],
    },
    {
      title: 'Bound generic thread code by Sync and Send',
      explanation: [
        'A generic function that lends &T to scoped threads needs T: Sync, because several threads hold that reference. If a thread also returns a T, that value moves back across threads, so T: Send is needed too.',
        'An Arc<T> may be sent to another thread only when T is both Send and Sync, because every clone gives another thread a shared reference to the same T.',
      ],
      example: {
        language: 'rust',
        code: 'fn split_len<T: Sync>(items: &[T]) -> (usize, usize) {\n    let mid = items.len() / 2;\n    std::thread::scope(|s| {\n        let left = s.spawn(|| items[..mid].len());\n        let right = s.spawn(|| items[mid..].len());\n        (left.join().unwrap(), right.join().unwrap())\n    })\n}\n\nfn main() {\n    let r = split_len(&["a", "b", "c", "d", "e"]);\n    println!("{} {}", r.0, r.1);\n}',
        output: '2 3',
        explanation:
          'Each thread borrows part of items, which the T: Sync bound allows.',
      },
      questions: [
        choose(
          'Removing T: Sync from split_len makes it fail to compile. Why?',
          [
            'Sharing &[T] across threads needs T: Sync',
            'len can only be called on Sync types',
            'Slices cannot be split without Sync',
            'scope requires every type parameter to be Copy',
          ],
          0,
          'Without the bound, T might be something like Cell that is unsafe to share.',
        ),
        predictOutput(
          'What does this program print?',
          'fn peek<T: Sync + Send + Copy>(value: &T) -> T {\n    std::thread::scope(|s| s.spawn(|| *value).join().unwrap())\n}\n\nfn main() {\n    let n = 21;\n    let pair = (1, 2);\n    println!("{} {}", peek(&n) * 2, peek(&pair).1);\n}',
          ['21 2', '42 2', '42 1', '42 12'],
          1,
          'Each thread copies the borrowed value and returns it through join.',
        ),
        choose(
          'In peek<T: Sync + Send + Copy>(value: &T) -> T, why is Send needed as well as Sync?',
          [
            'Sync types can never be copied',
            'The returned T moves across threads',
            'Send is what allows the thread to borrow value',
            'Copy types are always rejected without Send',
          ],
          1,
          'Sync covers the shared borrow; Send covers the owned value coming back.',
        ),
        choose(
          'Can a std::sync::Arc<std::cell::RefCell<u32>> be sent to another thread?',
          [
            'Yes: Arc makes anything thread-safe',
            'No: Arc<T> is Send only if T is Sync, and RefCell is not',
            'Yes, because RefCell checks borrows at run time',
            'No: an Arc can never be sent between threads',
          ],
          1,
          'Clones of the Arc would give two threads &RefCell at once, and RefCell’s checks are not thread-safe.',
        ),
      ],
    },
  ],
  'rust-arc-mutex': [
    {
      title: 'Give each worker an Arc clone and lock only to update',
      explanation: [
        'The pattern is Arc<Mutex<T>>: each worker thread gets its own Arc clone before spawning, and locks the Mutex only for the moment it changes the value.',
        'After joining every worker, main locks once more to read the final result. All worker clones are gone by then, so the Arc count is back to one.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let total = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for worker in 1..=4 {\n        let total = std::sync::Arc::clone(&total);\n        handles.push(std::thread::spawn(move || {\n            *total.lock().unwrap() += worker;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", total.lock().unwrap());\n}',
        output: '10',
        explanation:
          'Four workers add 1, 2, 3, and 4 in some order; the lock makes each addition safe, so the sum is always 10.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let names = std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));\n    let mut handles = Vec::new();\n    for n in 0..5 {\n        let names = std::sync::Arc::clone(&names);\n        handles.push(std::thread::spawn(move || {\n            names.lock().unwrap().push(n);\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", names.lock().unwrap().len());\n}',
          ['5', '4', '1', '0'],
          0,
          'Every worker pushes exactly once under the lock, so none of the five pushes is lost.',
        ),
        choose(
          'Why does each worker receive std::sync::Arc::clone(&total) instead of total itself?',
          [
            'The first closure would take the only Arc',
            'clone copies the counter so workers do not interfere',
            'A Mutex needs a fresh Arc for every lock call',
            'Arc::clone releases the lock for the new worker',
          ],
          0,
          'Each thread must own a handle, and cloning the Arc makes another handle to the same Mutex.',
        ),
        choose(
          'A worker computes a slow result and then adds it to a shared total. Which lock scope is best?',
          [
            'Lock first and hold the lock during the computation',
            'Lock once in main on behalf of all workers',
            'Compute first, then lock just for the addition',
            'Skip the lock, since Arc already protects the total',
          ],
          2,
          'Holding the lock only for the update lets other workers compute in parallel.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let count = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for _ in 0..3 {\n        let count = std::sync::Arc::clone(&count);\n        handles.push(std::thread::spawn(move || {\n            for _ in 0..100 {\n                *count.lock().unwrap() += 1;\n            }\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{} {}", count.lock().unwrap(), std::sync::Arc::strong_count(&count));\n}',
          ['300 1', '300 4', '100 1', '3 1'],
          0,
          'All 300 increments are counted, and the workers’ Arc clones were dropped when they finished.',
        ),
      ],
    },
    {
      title: 'Neither Arc nor Mutex is enough alone',
      explanation: [
        'Arc alone gives several threads ownership but only read access, so *arc += 1 is rejected. A Mutex alone allows changes but has a single owner, so it cannot be moved into several threads.',
        'Combined as Arc<Mutex<T>>, they give shared ownership and exclusive changes. The final value is exact, but the order in which threads applied their changes is not fixed.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let words = ["alpha", "be", "gamma"];\n    let letters = std::sync::Arc::new(std::sync::Mutex::new(0));\n    let mut handles = Vec::new();\n    for word in words {\n        let letters = std::sync::Arc::clone(&letters);\n        handles.push(std::thread::spawn(move || {\n            let n = word.len();\n            *letters.lock().unwrap() += n;\n        }));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", letters.lock().unwrap());\n}',
        output: '12',
        explanation:
          'Each worker computes its word length without the lock and adds it under the lock: 5 + 2 + 5.',
      },
      questions: [
        choose(
          'Why doesn’t a std::sync::Arc<u32> alone work for a counter that workers increment?',
          [
            'An Arc cannot be moved into a thread',
            'Arc gives only shared read access',
            'A u32 cannot be stored in an Arc',
            'Each worker would have to clone the u32',
          ],
          1,
          'Shared ownership does not include permission to mutate.',
        ),
        choose(
          'A plain std::sync::Mutex<u32> created in main is captured by the first of four move closures. What goes wrong?',
          [
            'A Mutex cannot be used from a spawned thread',
            'That closure takes ownership, so no other worker can use it',
            'lock works only on the thread that created the Mutex',
            'A Mutex can be locked only once in total',
          ],
          1,
          'The Mutex has one owner; wrapping it in an Arc lets every worker own a handle.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let text = std::sync::Arc::new(std::sync::Mutex::new(String::new()));\n    let mut handles = Vec::new();\n    for piece in ["ab", "cde", "f"] {\n        let text = std::sync::Arc::clone(&text);\n        handles.push(std::thread::spawn(move || text.lock().unwrap().push_str(piece)));\n    }\n    for handle in handles {\n        handle.join().unwrap();\n    }\n    println!("{}", text.lock().unwrap().len());\n}',
          ['3', '6', '2', '0'],
          1,
          'All three pieces are appended under the lock, giving 2 + 3 + 1 bytes.',
        ),
        choose(
          'In that program, which statement about the final text is true?',
          [
            'It is always exactly "abcdef"',
            'Length 6, with the pieces in any order',
            'Pieces may be split up, as in "acbdef"',
            'It may be shorter if two threads lock at once',
          ],
          1,
          'Each push_str happens whole under the lock, but the threads may take the lock in any order.',
        ),
      ],
    },
  ],
  'rust-deadlock-scope': [
    {
      title: 'A guard holds the lock until it is dropped',
      explanation: [
        'std’s Mutex is not reentrant: if a thread calls lock() again while its own guard is still alive, the second call never succeeds. A guard stored in a variable lives to the end of its block.',
        'Keep each guard in a small block, or use it as a temporary inside a single statement, so it is dropped before the next lock. try_lock returns Err instead of waiting, which makes a held lock visible.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let value = std::sync::Mutex::new(4);\n    {\n        let mut guard = value.lock().unwrap();\n        *guard += 1;\n    }\n    *value.lock().unwrap() *= 10;\n    println!("{}", value.lock().unwrap());\n}',
        output: '50',
        explanation:
          'The first guard ends with its block, and the second is a temporary that ends with its statement.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'again shares the lock with guard',
            'The compiler rejects the second lock call',
            'The second call releases guard automatically',
            'The second lock never succeeds',
          ],
          3,
          'The same thread is waiting for a lock that only it can release.',
          'fn main() {\n    let value = std::sync::Mutex::new(1);\n    let guard = value.lock().unwrap();\n    let again = value.lock().unwrap();\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let m = std::sync::Mutex::new(0);\n    let while_held;\n    {\n        let _guard = m.lock().unwrap();\n        while_held = m.try_lock().is_ok();\n    }\n    let after = m.try_lock().is_ok();\n    println!("{} {}", while_held, after);\n}',
          ['true true', 'false true', 'false false', 'true false'],
          1,
          '_guard keeps the lock until the block ends; afterwards try_lock succeeds.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn add(m: &std::sync::Mutex<i32>, n: i32) {\n    *m.lock().unwrap() += n;\n}\n\nfn main() {\n    let m = std::sync::Mutex::new(1);\n    add(&m, 2);\n    let doubled = *m.lock().unwrap() * 2;\n    add(&m, doubled);\n    println!("{}", m.lock().unwrap());\n}',
          ['6', '9', '12', '3'],
          1,
          'The temporary guard in the let statement is dropped before add locks again: 3, then 3 + 6.',
        ),
        choose(
          'A function holds let mut g = m.lock().unwrap(); and then calls a helper that also locks m. How can it be fixed?',
          [
            'End g’s scope first, or change the value through g',
            'Call the helper twice so the second call succeeds',
            'Declare m with let mut',
            'Clone the Mutex before calling the helper',
          ],
          0,
          'Either release the guard before relocking or keep working through the guard already held.',
        ),
      ],
    },
    {
      title: 'Never wait for one lock while holding another',
      explanation: [
        'If thread 1 holds lock A and waits for B while thread 2 holds B and waits for A, neither can ever continue: a deadlock.',
        'Two habits prevent it: hold at most one lock at a time, as in a transfer that finishes with one account before locking the other, or always take several locks in one agreed order.',
      ],
      example: {
        language: 'rust',
        code: 'fn transfer(from: &std::sync::Mutex<i32>, to: &std::sync::Mutex<i32>, amount: i32) {\n    *from.lock().unwrap() -= amount;\n    *to.lock().unwrap() += amount;\n}\n\nfn main() {\n    let a = std::sync::Arc::new(std::sync::Mutex::new(100));\n    let b = std::sync::Arc::new(std::sync::Mutex::new(50));\n    let first = {\n        let (a, b) = (std::sync::Arc::clone(&a), std::sync::Arc::clone(&b));\n        std::thread::spawn(move || transfer(&a, &b, 30))\n    };\n    let second = {\n        let (a, b) = (std::sync::Arc::clone(&a), std::sync::Arc::clone(&b));\n        std::thread::spawn(move || transfer(&b, &a, 10))\n    };\n    first.join().unwrap();\n    second.join().unwrap();\n    println!("{} {}", a.lock().unwrap(), b.lock().unwrap());\n}',
        output: '80 70',
        explanation:
          'The threads transfer in opposite directions, but each statement in transfer holds only one lock, so they cannot block each other.',
      },
      questions: [
        choose(
          'Thread 1 holds lock A and waits for B; thread 2 holds B and waits for A. What is this?',
          [
            'A data race on the values in A and B',
            'A panic that unwrap reports at once',
            'A deadlock: neither thread can ever continue',
            'Ordinary waiting that resolves itself',
          ],
          2,
          'Each thread waits for a lock the other will never release.',
        ),
        choose(
          'Two functions each need mutexes x and y at the same time. Which rule prevents a deadlock between them?',
          [
            'Both always lock x before y',
            'Each locks them in whichever order is convenient',
            'Each locks every mutex twice to be sure',
            'Both use try_lock and ignore failures',
          ],
          0,
          'With one global order, no thread can hold the second lock while waiting for the first.',
        ),
        predictOutput(
          'What does this program print?',
          'fn transfer(from: &std::sync::Mutex<i32>, to: &std::sync::Mutex<i32>, amount: i32) {\n    *from.lock().unwrap() -= amount;\n    *to.lock().unwrap() += amount;\n}\n\nfn main() {\n    let a = std::sync::Mutex::new(10);\n    let b = std::sync::Mutex::new(0);\n    let c = std::sync::Mutex::new(5);\n    transfer(&a, &b, 4);\n    transfer(&b, &c, 3);\n    transfer(&c, &a, 8);\n    println!("{} {} {}", a.lock().unwrap(), b.lock().unwrap(), c.lock().unwrap());\n}',
          ['6 1 8', '14 4 0', '10 1 0', '14 1 0'],
          3,
          'a gives 4 and receives 8; b receives 4 and gives 3; c receives 3 and gives 8.',
        ),
        choose(
          'Why can’t the one-lock-at-a-time transfer deadlock, even with threads moving money in opposite directions?',
          [
            'Mutexes detect transfers in opposite directions',
            'The threads always run one after another',
            'unwrap retries the lock until it succeeds',
            'Each lock is released before the next is taken',
          ],
          3,
          'A thread never waits while holding a lock, so no cycle of waiting can form.',
        ),
      ],
    },
  ],
  'rust-future-pin': [
    {
      title: 'Box::pin makes any future pollable',
      explanation: [
        'An async block, async { ... }, is a future whose body runs only when it is polled. poll takes self as Pin<&mut Self>. Pin::new works only for futures that are fine to move (Unpin), and an async block’s future is not.',
        'Box::pin(fut) moves the future to the heap and returns a Pin<Box<F>>. fut.as_mut() then gives the Pin<&mut F> that poll needs, as many times as required.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut fut = Box::pin(async { 6 * 7 });\n    let mut cx = Context::from_waker(Waker::noop());\n    match fut.as_mut().poll(&mut cx) {\n        Poll::Ready(value) => println!("ready {}", value),\n        Poll::Pending => println!("pending"),\n    }\n}',
        output: 'ready 42',
        explanation:
          'The boxed, pinned async block can be polled through as_mut, and its body finishes on the first poll.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let base = 5;\n    let mut fut = Box::pin(async move { base * 3 });\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(v) = fut.as_mut().poll(&mut cx) {\n        println!("{}", v + 1);\n    }\n}',
          ['15', '18', '5', '16'],
          3,
          'async move captures base; polling runs the body, which produces 15.',
        ),
        choose(
          'Why does Pin::new(&mut fut).poll(&mut cx) fail to compile when fut is an async block?',
          [
            'Async blocks cannot be polled at all',
            'Pin::new only accepts integer futures',
            'The async block’s future is not Unpin',
            'The Context must be boxed first',
          ],
          2,
          'Pin::new is only for types that are safe to move; Box::pin works for any future.',
        ),
        choose(
          'What does Box::pin(fut) return?',
          [
            'A Pin<Box<F>> owning the future on the heap',
            'A Box<F> that can be moved out freely',
            'The future’s output, after polling it once',
            'A Pin<&mut F> borrowing a local variable',
          ],
          0,
          'The future lives in the box, and the Pin promises it will not be moved out again.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut fut = Box::pin(async {\n        println!("inside");\n        9\n    });\n    println!("created");\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(v) = fut.as_mut().poll(&mut cx) {\n        println!("got {}", v);\n    }\n}',
          [
            'inside\ncreated\ngot 9',
            'created\ngot 9',
            'inside\ngot 9\ncreated',
            'created\ninside\ngot 9',
          ],
          3,
          'Creating the async block runs none of its body; poll runs it.',
        ),
      ],
    },
    {
      title: 'A pinned future stays where it is',
      explanation: [
        'An async block may hold references to its own local variables across an await, so once polled it must stay at one address. Pin guarantees that: safe code cannot move a non-Unpin value back out of its Pin.',
        'Moving the Pin<Box<F>> itself is fine, because only the pointer moves. std::pin::pin!(fut) pins a future in the current function’s stack frame instead of on the heap.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut fut = std::pin::pin!(async { "stack pinned" });\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(text) = fut.as_mut().poll(&mut cx) {\n        println!("{}", text);\n    }\n}',
        output: 'stack pinned',
        explanation:
          'pin! gives a Pin<&mut F> to a future stored in main itself, which as_mut can poll without a heap allocation.',
      },
      questions: [
        choose(
          'Why may an async block’s future need to stay at one address once polled?',
          [
            'Heap memory can never be moved',
            'Moving it would run its body a second time',
            'It may hold references to its own local variables',
            'The Waker stores the future’s address',
          ],
          2,
          'A reference into the future itself would dangle if the future moved.',
        ),
        choose(
          'How does Box::pin(fut) differ from std::pin::pin!(fut)?',
          [
            'pin! allows moving the future later; Box::pin does not',
            'Box::pin polls the future immediately',
            'Box::pin pins on the heap; pin! pins in the current stack frame',
            'They are identical; both allocate on the heap',
          ],
          2,
          'Both give a pinned future; they differ in where it is stored and how long it can live.',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut fut = Box::pin(async { 2 + 2 });\n    let mut cx = Context::from_waker(Waker::noop());\n    let first = match fut.as_mut().poll(&mut cx) {\n        Poll::Ready(v) => v,\n        Poll::Pending => 0,\n    };\n    let moved_box = fut;\n    println!("{}", first);\n}',
          ['0', '2', '4', '22'],
          2,
          'The future is ready on its first poll. Moving the Pin<Box> afterwards only moves the pointer.',
        ),
        choose(
          'fut has type Pin<Box<F>>, where F is an async block. Which operation does safe Rust refuse?',
          [
            'Moving the Pin<Box<F>> into another variable',
            'Taking the F out of the box by value',
            'Calling fut.as_mut().poll(&mut cx)',
            'Dropping fut',
          ],
          1,
          'Moving the future itself out would break the pin’s promise; the other operations keep it in place.',
        ),
      ],
    },
  ],
  'rust-future-pending': [
    {
      title: 'Implement Future by writing poll',
      explanation: [
        'impl Future for Countdown { type Output = ...; fn poll(...) -> Poll<...> } turns a struct into a future. The associated type Output is what Poll::Ready carries when the future finishes.',
        'Each call to poll either finishes with Ready or reports Pending. Progress between polls is kept in the struct’s own fields, changed through self. For a struct with ordinary fields, Pin::new(&mut fut) is enough to poll it.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::{Context, Poll, Waker};\n\nstruct Countdown {\n    left: u32,\n}\n\nimpl Future for Countdown {\n    type Output = &\'static str;\n\n    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<\'_>) -> Poll<&\'static str> {\n        if self.left == 0 {\n            Poll::Ready("liftoff")\n        } else {\n            self.left -= 1;\n            cx.waker().wake_by_ref();\n            Poll::Pending\n        }\n    }\n}\n\nfn main() {\n    let mut fut = Countdown { left: 2 };\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut polls = 1;\n    let mut result = Pin::new(&mut fut).poll(&mut cx);\n    while result.is_pending() {\n        polls += 1;\n        result = Pin::new(&mut fut).poll(&mut cx);\n    }\n    println!("{:?} after {} polls", result, polls);\n}',
        output: 'Ready("liftoff") after 3 polls',
        explanation:
          'The first two polls count left down to 0 and return Pending; the third finds 0 and returns Ready.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::{Context, Poll, Waker};\n\nstruct Countdown {\n    left: u32,\n}\n\nimpl Future for Countdown {\n    type Output = &\'static str;\n\n    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<\'_>) -> Poll<&\'static str> {\n        if self.left == 0 {\n            Poll::Ready("liftoff")\n        } else {\n            self.left -= 1;\n            cx.waker().wake_by_ref();\n            Poll::Pending\n        }\n    }\n}\n\nfn polls_needed(left: u32) -> u32 {\n    let mut fut = Countdown { left };\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut polls = 1;\n    while Pin::new(&mut fut).poll(&mut cx).is_pending() {\n        polls += 1;\n    }\n    polls\n}\n\nfn main() {\n    println!("{} {}", polls_needed(0), polls_needed(3));\n}',
          ['0 3', '1 3', '0 4', '1 4'],
          3,
          'A countdown starting at n returns Pending n times and is Ready on poll n + 1.',
        ),
        choose(
          "In impl Future for Countdown, what does type Output = &'static str; decide?",
          [
            'The type of the Context passed to poll',
            'How many times poll may be called',
            'The type that Poll::Ready carries',
            'The type of Countdown’s fields',
          ],
          2,
          'Output is the result type of the future, so poll returns Poll<Self::Output>.',
        ),
        choose(
          'Where does a hand-written future keep its progress between polls?',
          [
            'In its own fields, updated through self in poll',
            'In poll’s local variables, which persist between calls',
            'In the Context, which remembers each future',
            'Nowhere; every poll starts from scratch',
          ],
          0,
          'Locals vanish when poll returns, so state that must survive goes in the struct.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::{Context, Poll, Waker};\n\nstruct Sum {\n    next: u32,\n    total: u32,\n}\n\nimpl Future for Sum {\n    type Output = u32;\n\n    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<\'_>) -> Poll<u32> {\n        if self.next > 3 {\n            Poll::Ready(self.total)\n        } else {\n            let next = self.next;\n            self.total += next;\n            self.next += 1;\n            cx.waker().wake_by_ref();\n            Poll::Pending\n        }\n    }\n}\n\nfn main() {\n    let mut fut = Sum { next: 1, total: 0 };\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut pending = 0;\n    let mut result = Pin::new(&mut fut).poll(&mut cx);\n    while result.is_pending() {\n        pending += 1;\n        result = Pin::new(&mut fut).poll(&mut cx);\n    }\n    println!("{:?} {}", result, pending);\n}',
          ['Ready(6) 4', 'Ready(10) 3', 'Ready(3) 3', 'Ready(6) 3'],
          3,
          'Three Pending polls add 1, 2, and 3; the fourth poll finds next above 3 and returns the total.',
        ),
      ],
    },
    {
      title: 'Return Pending only with a wakeup arranged',
      explanation: [
        'An executor polls a task again only after the task’s waker is woken. So before returning Pending, poll must make sure someone will wake it: call cx.waker().wake_by_ref() if progress is possible right away, or store cx.waker().clone() where a timer or socket will call wake later.',
        'A future that returns Pending with no wakeup arranged may never be polled again. The examples here use Waker::noop(), which ignores wakes, and simply poll again by hand.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::{Context, Poll, Waker};\n\nstruct Later {\n    value: i32,\n    waiting: bool,\n    wakes: u32,\n}\n\nimpl Future for Later {\n    type Output = i32;\n\n    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<\'_>) -> Poll<i32> {\n        if self.waiting {\n            self.waiting = false;\n            self.wakes += 1;\n            cx.waker().wake_by_ref();\n            Poll::Pending\n        } else {\n            Poll::Ready(self.value)\n        }\n    }\n}\n\nfn main() {\n    let mut fut = Later { value: 8, waiting: true, wakes: 0 };\n    let mut cx = Context::from_waker(Waker::noop());\n    let first = Pin::new(&mut fut).poll(&mut cx);\n    let second = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?} {:?} {}", first, second, fut.wakes);\n}',
        output: 'Pending Ready(8) 1',
        explanation:
          'The first poll records its state change, wakes the task, and returns Pending; the second poll is Ready.',
      },
      questions: [
        choose(
          'A future returns Poll::Pending without waking or storing the waker. What can happen under a real executor?',
          [
            'The task is never polled again and never finishes',
            'The executor polls it again immediately anyway',
            'The future is dropped and its output is 0',
            'The compiler rejects the poll method',
          ],
          0,
          'Executors rely on wakeups to know when polling is worthwhile.',
        ),
        choose(
          'A future waits for a network message that will arrive later. What should poll do before returning Pending?',
          [
            'Call wake_by_ref in a loop until the message arrives',
            'Block the thread until the message arrives',
            'Return Ready with a placeholder value instead',
            'Store cx.waker().clone() where the message handler will wake it',
          ],
          3,
          'The event source should wake the task exactly when progress becomes possible.',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::{Context, Poll, Waker};\n\nstruct Later {\n    value: i32,\n    waiting: bool,\n    wakes: u32,\n}\n\nimpl Future for Later {\n    type Output = i32;\n\n    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<\'_>) -> Poll<i32> {\n        if self.waiting {\n            self.waiting = false;\n            self.wakes += 1;\n            cx.waker().wake_by_ref();\n            Poll::Pending\n        } else {\n            Poll::Ready(self.value)\n        }\n    }\n}\n\nfn main() {\n    let mut fut = Later { value: -3, waiting: true, wakes: 0 };\n    let mut cx = Context::from_waker(Waker::noop());\n    let a = Pin::new(&mut fut).poll(&mut cx).is_ready();\n    let b = Pin::new(&mut fut).poll(&mut cx).is_ready();\n    println!("{} {} {}", a, b, fut.wakes);\n}',
          ['true true 0', 'false false 1', 'false true 1', 'false true 2'],
          2,
          'Only the first poll waits and wakes; the second finds waiting false and finishes.',
        ),
        choose(
          'Why can calling cx.waker().wake_by_ref() and then returning Pending be correct?',
          [
            'It makes poll count as returning Ready',
            'It cancels the task and drops it',
            'It schedules another poll right away',
            'It never is; waking and Pending contradict each other',
          ],
          2,
          'Waking right away schedules another poll, which suits a future that can continue immediately.',
        ),
      ],
    },
  ],
  'rust-await': [
    {
      title: 'await takes the output of another future',
      explanation: [
        'Inside an async block or async fn, fut.await polls fut and, once it is Ready, evaluates to its output. That lets async code use futures like ordinary values, one after another.',
        '.await is allowed only inside async code. Calling an async fn, as in double(5), returns a future and runs none of its body until that future is polled.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut task = Box::pin(async {\n        let a = std::future::ready(3).await;\n        let b = std::future::ready(4).await;\n        a * b\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(v) = task.as_mut().poll(&mut cx) {\n        println!("{}", v);\n    }\n}',
        output: '12',
        explanation:
          'Each await yields the ready future’s value, and the block returns their product.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nasync fn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn main() {\n    let mut task = Box::pin(async { double(double(5).await).await + 1 });\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(v) = task.as_mut().poll(&mut cx) {\n        println!("{}", v);\n    }\n}',
          ['21', '11', '20', '22'],
          0,
          'The inner await gives 10, the outer await doubles that to 20, and 1 is added.',
        ),
        choose(
          'Where can .await be written?',
          [
            'Inside an async block or async fn',
            'Anywhere, including a plain fn main',
            'Only on futures made by std::future::ready',
            'Only inside a match on Poll',
          ],
          0,
          'await needs an enclosing future that can suspend, which only async code provides.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut task = Box::pin(async {\n        println!("start");\n        let x = std::future::ready(10).await;\n        println!("got {}", x);\n        x + 1\n    });\n    println!("before poll");\n    let mut cx = Context::from_waker(Waker::noop());\n    if let Poll::Ready(v) = task.as_mut().poll(&mut cx) {\n        println!("done {}", v);\n    }\n}',
          [
            'start\nbefore poll\ngot 10\ndone 11',
            'before poll\nstart\ndone 11',
            'start\ngot 10\nbefore poll\ndone 11',
            'before poll\nstart\ngot 10\ndone 11',
          ],
          3,
          'The body starts only at the poll, and the ready future lets it run to the end in one go.',
        ),
        choose(
          'What does calling double(5) return, for async fn double(n: i32) -> i32, before anything polls it?',
          [
            'The value 10, computed immediately',
            'A future whose body has not run yet',
            'Poll::Ready(10)',
            'A thread handle already running the body',
          ],
          1,
          'An async fn call only builds a future; polling it runs the body.',
        ),
      ],
    },
    {
      title: 'Awaiting a pending future suspends the whole task',
      explanation: [
        'If the awaited future returns Pending, the enclosing async block returns Pending from its own poll and remembers where it stopped. The next poll resumes at that await; the statements before it do not run again.',
        'Unlike a loop that keeps polling until Ready, await never busy-waits: the task simply stops until it is polled again.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut task = Box::pin(async {\n        println!("step 1");\n        let mut first = true;\n        let value = std::future::poll_fn(move |_cx| {\n            if first {\n                first = false;\n                Poll::Pending\n            } else {\n                Poll::Ready(5)\n            }\n        })\n        .await;\n        println!("step 2");\n        value * 2\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    println!("{:?}", task.as_mut().poll(&mut cx));\n    println!("{:?}", task.as_mut().poll(&mut cx));\n}',
        output: 'step 1\nPending\nstep 2\nReady(10)',
        explanation:
          'The first poll stops at the await. The second resumes there, so step 1 is not printed again.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut task = Box::pin(async {\n        println!("begin");\n        let mut left = 2;\n        let word = std::future::poll_fn(move |_cx| {\n            if left == 0 {\n                Poll::Ready("ok")\n            } else {\n                left -= 1;\n                Poll::Pending\n            }\n        })\n        .await;\n        println!("end");\n        word\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    for _ in 0..3 {\n        println!("{:?}", task.as_mut().poll(&mut cx));\n    }\n}',
          [
            'begin\nPending\nbegin\nPending\nbegin\nend\nReady("ok")',
            'begin\nPending\nPending\nReady("ok")',
            'begin\nend\nReady("ok")\nReady("ok")\nReady("ok")',
            'begin\nPending\nPending\nend\nReady("ok")',
          ],
          3,
          'The task is suspended twice at the await and resumes there each time, so begin prints once.',
        ),
        choose(
          'An async block awaits a future that returns Pending. What does polling the block return?',
          [
            'Pending, and the next poll resumes at that await',
            'Pending, and the next poll restarts the block from the top',
            'Ready with a default value',
            'Nothing until the inner future is ready, blocking the thread',
          ],
          0,
          'The block’s state records where it stopped, so it continues from the await.',
        ),
        choose(
          'How does .await differ from a loop that polls a future until it is Ready?',
          [
            'await polls the future on a new thread',
            'await never polls the inner future',
            'await suspends the task instead of spinning',
            'They are the same; await is a busy loop',
          ],
          2,
          'Suspending frees the executor to run other tasks until a wakeup arrives.',
        ),
        predictOutput(
          'What is the output of this program?',
          'use std::future::Future;\nuse std::task::{Context, Poll, Waker};\n\nfn main() {\n    let mut task = Box::pin(async {\n        let a = std::future::ready(2).await;\n        let b = std::future::ready(a + 3).await;\n        a * b\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut polls = 1;\n    while task.as_mut().poll(&mut cx).is_pending() {\n        polls += 1;\n    }\n    println!("{}", polls);\n}',
          ['2', '3', '0', '1'],
          3,
          'Ready futures never return Pending, so both awaits complete within the first poll.',
        ),
      ],
    },
  ],
};
