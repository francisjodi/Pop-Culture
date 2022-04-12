import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

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
  ["long if", " as if true {print(1);} ugh {print(3);}"],
  [
    "else if",
    " as if true {print(1);} ugh, as if true {print(0);} ugh {print(3);}",

  ["||", "sayItWithYourChest(true||1<2||false||!true);"],
  ["&&", "sayItWithYourChest(true&&1<2&&false&&!true);"],
  ["bit ops", "sayItWithYourChest((1&2)|(9^3));"],
  ["relations", 'sayItWithYourChest(1<=2 && "x">"y" && 3.5<1.2);'],
  ["ok to == arrays", "sayItWithYourChest([1]==[5,8]);"],
  ["ok to != arrays", "sayItWithYourChest([1]!=[5,8]);"],
  ["shifts", "sayItWithYourChest(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "let x=1;sayItWithYourChest(2*3+5**-3/2-5%8);"],
  ["array length", "sayItWithYourChest(#[1,2,3]);"],
  ["optional types", "let x = no int; x = some 100;"],
  ["variables", "let x=[[[[1]]]]; sayItWithYourChest(x[0][0][0][0]+2);"],
  ["recursive structs", "struct S {z: S?} let x = S(no S);"],
  
],

// const semanticErrors = [
 
//   ["non-int increment", "let x=false;x++;", /an integer/],
//   ["non-int decrement", 'let x=some[""];x++;', /an integer/],
//   ["undeclared id", "print(x);", /Identifier x not declared/],

//   ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
//   ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
//   [
//     "assign bad array type",
//     "let x=1;x=[true];",
//     /Cannot assign a \[boolean\] to a int/,
//   ],
//   [
//     "assign bad optional type",
//     "let x=1;x=some 2;",
//     /Cannot assign a int\? to a int/,
//   ],
//   ["break outside loop", "break;", /Break can only appear in a loop/],
//   [
//     "break inside function",
//     "while true {function f() {break;}}",
//     /Break can only appear in a loop/,
//   ],
//   [
//     "return outside function",
//     "return;",
//     /Return can only appear in a function/,
//   ],
//   [
//     "return value from void function",
//     "function f() {return 1;}",
//     /Cannot return a value here/,
//   ],
//   [
//     "return nothing from non-void",
//     "function f(): int {return;}",
//     /should be returned here/,
//   ]

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
