import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"
import ast from "../src/ast.js"

const syntaxChecks = [
  ["all numeric literal forms", "sayItWithYourChest (2 * 3);"],
  ["complex expressions", "lit x = 40 * (((((((10 / 21))))))) + 3 - 2;"],
  ["all arithmetic operators", "lit x = (1) * 2 % 4 - (-9) + 8 ** 13 / 1;"],
  ["all binary operators", "sayItWithYourChest x && y != 3;"],
  [
    "all relational operators",
    "lit x = 3 <= 2 && 4 < 2 && 7 > 5 && 92 >= 4 && 3 != 2;",
  ],
  ["end of program inside comment", "lit x=1;  shh this is a comment"],
  ["comments with no text are okay", 'lit x="what\'s the move"; shh'],
  ["short if statement", "as if x==1 { sayItWithYourChest forRealz || urDone; }"],
  ["long if statement", 'as if x==1 { sayItWithYourChest ("first"); } ugh { sayItWithYourChest ("second"); }'],
  ["longest if statement", 'as if x==1 { sayItWithYourChest("here");} ugh as if x==2 {sayItWithYourChest("there");} ugh {sayItWithYourChest("anywhere");}'],
  ["while loop with one statement block", 'sayLess x==1 { sayItWithYourChest("hey"); }'],
  ["while loop with empty block", "sayLess x==1 {}"],
  ["boolean literals", "lit x = forRealz || urDone;"],
  ["empty string", 'lit x = "";'],
  // ["for loop", "keepItUp ( lit i = 0; i < 5; i++ ) { i += 1; }"],
  // ["", ""],
]

const syntaxErrors = [
  ["non-letter in an identifier", "lit ayo😭t = 2;", /Line 1, col 8/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["missing semicolon", "lit x = 1", /Line 1, col 10/],
  ["a missing left operand", "lit x = 1 *;", /Line 1, col 12/],
  ["a missing right parenthesis", "lit x = (1 + 2;", /Line 1, col 15/],
  ["a missing left parenthesis", "lit x = 1 + 2);", /Line 1, col 14/],
  ["mixing ands and ors", "print(1 && 2 || 3);", /Line 1, col 15/],
  ["mixing ors and ands", "print(1 || 2 && 3);", /Line 1, col 15/],
  ["associating relational operators", "print(1 < 2 < 3);", /Line 1, col 13/],
  ["bad array literal", "lit x = [1,2,];", /Line 1, col 14/],
  ["reserved word as an identifier", "lit stickIt = 1;", /Line 1, col 5/],
  // ["missing identifier between two operators", "lit x = 7 + - 4;", /Line 1, col 12/],
        //this is currently allowed
  ["unbalanced brackets", "lit x = [1,2,3;", /Line 1, col 15/],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/popCulture.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }

  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source)
      assert(!match.succeeded())
      assert(new RegExp(errorMessagePattern).test(match.message))
    })
  }
})