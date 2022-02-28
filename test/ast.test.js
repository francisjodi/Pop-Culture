import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const source1 = `whatsYourFunction getMoney(counter) {
	gimmeDat(counter + 1000);
};
`

const expected1 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration fun=(Id, "getMoney") params=[(Id, "counter")] body=[#3]
   3 | ReturnStatement expression=[#4]
   4 | BinaryExpression left=(Id, "counter") op='+' right=(Int, "1000")`

describe("The AST generator", () => {
  it("Test 1: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source1)), expected1)
  })
})
