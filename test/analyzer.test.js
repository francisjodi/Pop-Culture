import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  [
    "variable declarations",
    'whatsYourNumber x = 1; makeUpYourMind y = "false";',
  ],
  ["initialize with empty array", "let a = [](of int);"],
  ["empty list", "list a= []"][("assign arrays", "let b=[1];a=b;b=a;")],
  ["short return", "function f() { gimmeDat; }"],
  ["long return", "function f(): makeUpYourMind { gimmeDat true; }"],

  ["break in nested if", "say less false {if true {give me a break;}}"],
  [
    "long if",
    " as if true {sayItWithYourChest(1);} ugh {sayItWithYourChest(3);}",
  ],

  [
    "else if",
    "as if true {sayItWithYourChest(1);} ugh, as if true  {sayItWithYourChest(0);} ugh {sayItWithYourChest(3);}",
  ],
  ["||", "sayItWithYourChest(true||1<2||false||!true);"],
  ["&&", "sayItWithYourChest(true&&1<2&&false&&!true);"],
  ["bit ops", "sayItWithYourChest((1&2)|(9^3));"],
  ["relations", 'sayItWithYourChest(1<=2 && "x">"y" && 3.5<1.2);'],
  ["ok to == arrays", "sayItWithYourChest([1]==[5,8]);"],
  ["ok to != arrays", "sayItWithYourChest([1]!=[5,8]);"],
  ["shifts", "sayItWithYourChest(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "let x=1;sayItWithYourChest(2*3+5**-3/2-5%8);"],
  ["array length", "sayItWithYourChest(#[1,2,3]);"],
  ["variables", "let x=[[[[1]]]]; sayItWithYourChest(x[0][0][0][0]+2);"],
  ["recursive structs", "struct S {z: S?} let x = S(no S);"],

  ["assigned functions", "whatYourFunction f() {}\nlet g = f;g = f;"],
  [
    "call of assigned functions",
    "whatYourFunction f(x: int) {}\nlet g=f;g(1);",
  ],
  [
    "pass a function to a function",
    `whatYourFunction f(x: int, y: (boolean)->void): int { return 1; }
     whatYourFunction g(z: boolean) {}
     f(2, g);`,
  ],
  ["types in function type", "function f(g: (int?, float)->string) {}"],
  ["voids in fn type", "function f(g: (void)->void) {}"],
  ["outer variable", "let x=1; while(false) {sayItWithYourChest(x);}"],
  ["built-in constants", "sayItWithYourChest(25.0 * π);"],
  ["built-in sin", "sayItWithYourChest(sin(π));"],
  ["built-in cos", "sayItWithYourChest(cos(93.999));"],
  ["built-in hypot", "sayItWithYourChest(hypot(-4.0, 3.00001));"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [

  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true {function f() {break;}}",
    /Break can only appear in a loop/,
  ],
  [
    "return outside function",
    "return;",
    /Return can only appear in a function/,
  ],
  ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
  ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
  ["non-boolean while test", "while 1 {}", /Expected a boolean/],
  ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
  ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
  ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
  ["non-array in for", "for i in 100 {}", /Array expected/],
  ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
  [
    "diff types in conditional arms",
    "print(true?1:true);",
    /not have the same type/,
  ],
  ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for ||", "print(false||1);", /Expected a boolean/],
  ["bad types for &&", "print(false&&1);", /Expected a boolean/],
  [
    "bad types for ==",
    "print(false==1);",
    /Operands do not have the same type/,
  ],
  [
    "bad types for !=",
    "print(false==1);",
    /Operands do not have the same type/,
  ],
  ["bad types for +", "print(false+1);", /Expected a number or string/],
  ["bad types for -", "print(false-1);", /Expected a number/],
  ["bad types for *", "print(false*1);", /Expected a number/],
  ["bad types for /", "print(false/1);", /Expected a number/],
  ["bad types for **", "print(false**1);", /Expected a number/],
  ["bad types for <", "print(false<1);", /Expected a number or string/],
  ["bad types for <=", "print(false<=1);", /Expected a number or string/],
  ["bad types for >", "print(false>1);", /Expected a number or string/],
  ["bad types for >=", "print(false>=1);", /Expected a number or string/],
  ["bad types for ==", "print(2==2.0);", /not have the same type/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /Expected a number/],
  ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'print(!"hello");', /Expected a boolean/],
  ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
  ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  [
    "diff type array elements",
    "print([3,3.0]);",
    /Not all elements have the same type/,
  ],
  [
    "shadowing",
    "let x = 1;\nwhile true {let x = 1;}",
    /Identifier x already declared/,
  ],
  ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    "function f(x: int) {}\nf(1,2);",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "Too few args",
    "function f(x: int) {}\nf();",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `function f(x: int, y: (boolean)->void): int { return 1; }
     function g(z: boolean): int { return 5; }
     f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  [
    "bad call to stdlib sin()",
    "print(sin(true));",
    /Cannot assign a boolean to a float/,
  ],
  ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  [
    "Non-type in return type",
    "let x=1;function f():x{return 1;}",
    /Type expected/,
  ],
  ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(ast(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(ast(source)), errorMessagePattern)
    })
  }
})
