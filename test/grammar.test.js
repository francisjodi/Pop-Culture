import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"
import ast from "../src/ast.js"

const syntaxChecks = [
  ["all numeric literal forms", '("2 * 3.923");'],
  ["complex expressions", '("40 * ((((-((((10 / 21)))))))) + 3 - 2");'],
  ["all arithmetic operators", "lit x = (1) * 2 % 4 - (-9.3) + 8 ** 13 / 1;"],
  ["all binary operators", '("x && y != 3");'],
  [
    "all relational operators",
    '("3 <= 2 && 4 < 2 && 7 > 5 && 92.3 >= 4 && 3 != 2");',
  ],
  ["end of program inside comment", '("4 + 4");  shh this is a comment'],
  ["comments with no text are okay", '("what\'s the move") shh'],
]

const syntaxErrors = [
  ["non-letter in an identifier", "lit ayo😭t = 2", /Line 1, col 8/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["missing semicolon", '("This is a test")', /Line 1, col 19/],
  ["a missing left operand", '("6 7*2)")'],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/popCulture.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(!grammar.match(source).succeeded())
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
