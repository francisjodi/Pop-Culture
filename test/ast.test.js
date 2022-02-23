import assert from "assert/strict"
import util from "util"
import ast from "../src/ast.js"

const source1 = ``

const expected1 = ``

describe("The AST generator", () => {
  it("Test 1: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source1)), expected1)
  })
})
