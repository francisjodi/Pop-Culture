import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"

// Programs that are semantically correct
const semanticChecks = [
  ["the printing of numbers", "sayItWithYourChest 2 ;"],
  ["the printing of strings", 'sayItWithYourChest "I’m dead 💀💀";'],
  ["the printing of booleans", "sayItWithYourChest forRealz;"],
  ["the printing of booleans", "sayItWithYourChest urDone;"],

  // [
  //   "else if",
  //   "as if 2< 3{gimmeDat forRealz ;} ugh as if 2>3{gimmeDat urDone;} ugh { gimmeDat urDone;}",
  // ],
  // ["while loop", "sayLess  !i {sayItWithYourChest 2;}"],
  // ["for loop", "keepItUp i innit 1 {sayItWithYourChest 0;}"],
  // ["break in while loop", "sayLess i {period;}"],
  ["short return", "whatsYourFunction f(){gimmeDat;};"],
  // ["loop through", ""]
  // ["variable declarations", 'lit x = 1; y = "false";'],
  // ["initialize with empty array", "let a = [](of int);"],
  //   "long if",
  //   " as if true {sayItWithYourChest(1);} ugh {sayItWithYourChest(3);}",
  // ],
  // [
  //   ["else if",
  //   "as if true {sayItWithYourChest(1);} ugh as if true  {sayItWithYourChest(0);} ugh {sayItWithYourChest(3);}",
  // ],

  ["||", "sayItWithYourChest(forRealz||urDone||forRealz);"],
  ["&&", "sayItWithYourChest(forRealz&&urDone&&forRealz);"],
  ["bit ops", "sayItWithYourChest((1&2)|(9^3));"],
  //["relations", 'sayItWithYourChest(1<=2 && "x">"y" && 3<1);'],
  // ["arithmetic", "let x=1;sayItWithYourChest(2*3+5**-3/2-5%8);"],
  // ["array length", "sayItWithYourChest(#[1,2,3]);"],
  // ["variables", "let x=[[[[1]]]]; sayItWithYourChest(x[0][0][0][0]+2);"],
  // ["recursive structs", "struct S {z: S?} let x = S(no S);"],

  ["recursion", "whatsYourFunction f(x) { \n f(1); \n };"],
  // ["types in function type", "function f(g: (int?, float)->string) {}"],
  // ["voids in fn type", "function f(g: (void)->void) {}"],
  // ["outer variable", "let x=1; while(false) {sayItWithYourChest(x);}"],
  // ["built-in constants", "sayItWithYourChest(25.0 * π);"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["undeclared identifier", "sayItWithYourChest youAreDone;", /./],
  ["break outside loop", "period;", /Break can only appear in a loop/],
  [
    "return outside function",
    "gimmeDat;",
    /Return can only appear in a function/,
  ],
  [
    ("too few calls",
    "lit i > 1( makeUpYourMind ); ",
    /Calls need an arguement/),
  ],

  // ["non-array in for", "keepItUp i in 100 {}", /Array expected/],
  // [
  //   "non-boolean conditional test",
  //   "sayItWithYourChest(1?2:3);",
  //   /Expected a boolean/,
  // ],
  // [
  //   "diff types in conditional arms",
  //   "sayItWithYourChest(true?1:true);",
  //   /not have the same type/,
  // ],
  // ["bad types for ||", "sayItWithYourChest(urDone||1);", /Expected a boolean/],

  // [
  //   "call of uncallable",
  //   "let x = 1;\nsayItWithYourChest(x());",
  //   /Call of non-function/,
  // ],
  // [
  //   "Too many args",
  //   " whatsYourFunction f(x) {;}}\nf(1,2);",
  //   /1 argument\(s\) required but 2 passed/,
  // ],
  // [
  //   "Too few args",
  //   "function f(x: int) {}\nf();",
  //   /1 argument\(s\) required but 0 passed/,
  // ],
  // ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
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
