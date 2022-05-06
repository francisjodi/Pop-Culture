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
  ["if statement", "as if x==1 { sayItWithYourChest forRealz || urDone; }"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "lit ayo😭t = 2", /Line 1, col 8/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["missing semicolon", "lit x = 1", /Line 1, col 10/],
  ["a missing left operand", "lit x = 1 *", /Line 1, col 12/],
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
