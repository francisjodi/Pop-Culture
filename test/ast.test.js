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



const source2 = `whatsYourFunction rollTwoDie(a, b){
    as if((a+b) >= 6) {
    	gimmeDat("You won");
    } ugh {
    	gimmeDat("You lost");
    }
};`
const expected2 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration fun=(Id, "rollTwoDie") params=[(Id, "a"),(Id, "b")] body=[#3]
   3 | IfStatement test=#4 consequent=[#6] alternate=[#7]
   4 | BinaryExpression left=#5 op='>=' right=(Int, "6")
   5 | BinaryExpression left=(Id, "a") op='+' right=(Id, "b")
   6 | ReturnStatement expression=[(String, ""You won"")]
   7 | ReturnStatement expression=[(String, ""You lost"")]`

const source3 = `lit fruitList = [apples, bananas, oranges];
keepItUp i innit fruitList {
	gimmeDat(fruitList[i]);
}`
const expected3 = `   1 | Program statements=[#2,#4]
   2 | VariableDeclaration modifier='lit' variable=(Id, "fruitList") initializer=#3
   3 | ArrayExpression elements=[(Id, "apples"),(Id, "bananas"),(Id, "oranges")]
   4 | ForStatement iterator='i' collection=(Id, "fruitList") body=[#5]
   5 | ReturnStatement expression=[#6]
   6 | SubscriptExpression array=(Id, "fruitList") index=(Id, "i")`

const source4 = `lit newArray = [];`
const expected4 = `   1 | Program statements=[#2]
   2 | VariableDeclaration modifier='lit' variable=(Id, "newArray") initializer=#3
   3 | EmptyArray`

const source5 = `gimmeDat(6 * 7);`
const expected5 = `   1 | Program statements=[#2]
   2 | ReturnStatement expression=[#3]
   3 | BinaryExpression left=(Int, "6") op='*' right=(Int, "7")`
   
describe("The AST generator", () => {
  it("Test 1: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source1)), expected1)
  })
  it("Test 2: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source2)), expected2)
  })
  it("Test 3: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source3)), expected3)
  })
  it("Test 4: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source4)), expected4)
  })
  it("Test 5: produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source5)), expected5)
  })
})
