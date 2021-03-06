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
   4 | BinaryExpression op='+' left=(Id, "counter") right=(Int, "1000")`

const source2 = `whatsYourFunction rollTwoDie(a, b){
    as if((a+b) >= 6) {
    	gimmeDat("You won");
    } ugh {
    	gimmeDat("You lost");
    }
};
rollTwoDie(2,4);`
const expected2 = `   1 | Program statements=[#2,#9]
   2 | FunctionDeclaration fun=(Id, "rollTwoDie") params=[(Id, "a"),(Id, "b")] body=[#3]
   3 | IfStatement test=[#4] consequents=[#6] alternate=[#8]
   4 | BinaryExpression op='>=' left=#5 right=(Int, "6")
   5 | BinaryExpression op='+' left=(Id, "a") right=(Id, "b")
   6 | Array 0=#7
   7 | ReturnStatement expression=[(String, ""You won"")]
   8 | ReturnStatement expression=[(String, ""You lost"")]
   9 | Call id=(Id, "rollTwoDie") args=[(Int, "2"),(Int, "4")]`

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
   3 | EmptyArray `

const source5 = `gimmeDat(6 * 7);`
const expected5 = `   1 | Program statements=[#2]
   2 | ReturnStatement expression=[#3]
   3 | BinaryExpression op='*' left=(Int, "6") right=(Int, "7")`

const source6 = `sayItWithYourChest 2;`
const expected6 = `   1 | Program statements=[#2]
   2 | PrintStatement expression=(Int, "2")`

const source7 = `lit decision = forRealz;
lit count = 0;
as if (decision == urDone) {
    count = count + 1;
    period;
} ugh {
    count =  count ** 2;
}`
const expected7 = `   1 | Program statements=[#2,#3,#4]
   2 | VariableDeclaration modifier='lit' variable=(Id, "decision") initializer=(Bool, "forRealz")
   3 | VariableDeclaration modifier='lit' variable=(Id, "count") initializer=(Int, "0")
   4 | IfStatement test=[#5] consequents=[#6] alternate=[#10]
   5 | BinaryExpression op='==' left=(Id, "decision") right=(Bool, "urDone")
   6 | Array 0=#7 1=#9
   7 | Assignment target=(Id, "count") source=#8
   8 | BinaryExpression op='+' left=(Id, "count") right=(Int, "1")
   9 | BreakStatement 
  10 | Assignment target=(Id, "count") source=#11
  11 | BinaryExpression op='**' left=(Id, "count") right=(Int, "2")`

const source8 = `sayItWithYourChest(5 << 2);`
const expected8 = `   1 | Program statements=[#2]
   2 | PrintStatement expression=#3
   3 | BinaryExpression op='<<' left=(Int, "5") right=(Int, "2")`

const source9 = `lit count = 0;
lit x = 0;
lit y = 1;
as if ((x > y) || (x < y)) {
    gimmeDat(0);
} ugh as if (x == y) {
    gimmeDat(3);
}`
const expected9 = `   1 | Program statements=[#2,#3,#4,#5]
   2 | VariableDeclaration modifier='lit' variable=(Id, "count") initializer=(Int, "0")
   3 | VariableDeclaration modifier='lit' variable=(Id, "x") initializer=(Int, "0")
   4 | VariableDeclaration modifier='lit' variable=(Id, "y") initializer=(Int, "1")
   5 | IfStatement test=[#6,#9] consequents=[#10,#12] alternate=null
   6 | BinaryExpression op='||' left=#7 right=#8
   7 | BinaryExpression op='>' left=(Id, "x") right=(Id, "y")
   8 | BinaryExpression op='<' left=(Id, "x") right=(Id, "y")
   9 | BinaryExpression op='==' left=(Id, "x") right=(Id, "y")
  10 | Array 0=#11
  11 | ReturnStatement expression=[(Int, "0")]
  12 | Array 0=#13
  13 | ReturnStatement expression=[(Int, "3")]`

const source10 = `whatsYourFunction forward(number) {
    gimmeDat(number);
};
forward(3 * 7 ?? 1 && 2);`
const expected10 = `   1 | Program statements=[#2,#4]
   2 | FunctionDeclaration fun=(Id, "forward") params=[(Id, "number")] body=[#3]
   3 | ReturnStatement expression=[(Id, "number")]
   4 | Call id=(Id, "forward") args=[#5]
   5 | BinaryExpression op='??' left=#6 right=#7
   6 | BinaryExpression op='*' left=(Int, "3") right=(Int, "7")
   7 | BinaryExpression op='&&' left=(Int, "1") right=(Int, "2")`

const source11 = `sayItWithYourChest(5 | 3);
sayItWithYourChest(5 & 3);
sayItWithYourChest(5 ^ 3);`
const expected11 = `   1 | Program statements=[#2,#4,#6]
   2 | PrintStatement expression=#3
   3 | BinaryExpression op='|' left=(Int, "5") right=(Int, "3")
   4 | PrintStatement expression=#5
   5 | BinaryExpression op='&' left=(Int, "5") right=(Int, "3")
   6 | PrintStatement expression=#7
   7 | BinaryExpression op='^' left=(Int, "5") right=(Int, "3")`

const source12 = `lit decision = urDone;
sayLess (!decision) {
    sayItWithYourChest 0;
}`
const expected12 = `   1 | Program statements=[#2,#3]
   2 | VariableDeclaration modifier='lit' variable=(Id, "decision") initializer=(Bool, "urDone")
   3 | WhileStatement expression=#4 body=[#5]
   4 | UnaryExpression op='!' operand=(Id, "decision")
   5 | PrintStatement expression=(Int, "0")`

// const source13 = `sayItWithYourChest(6)`
// const expected13 = `   
// Error: Line 1, col 22:
// > 1 | sayItWithYourChest(6)
//                            ^
// Expected ";"`

const source14 = `stickIt x1 = 20;`
const expected14 = `   1 | Program statements=[#2]
   2 | VariableDeclaration modifier='stickIt' variable=(Id, "x1") initializer=(Int, "20")`
describe("The AST generator", () => {
  it("Test 1: ", () => {
    assert.deepEqual(util.format(ast(source1)), expected1)
  })
  it("Test 2: ", () => {
    assert.deepEqual(util.format(ast(source2)), expected2)
  })
  it("Test 3: ", () => {
    assert.deepEqual(util.format(ast(source3)), expected3)
  })
  it("Test 4: ", () => {
    assert.deepEqual(util.format(ast(source4)), expected4)
  })
  it("Test 5: ", () => {
    assert.deepEqual(util.format(ast(source5)), expected5)
  })
  it("Test 6: ", () => {
    assert.deepEqual(util.format(ast(source6)), expected6)
  })
  it("Test 7: ", () => {
    assert.deepEqual(util.format(ast(source7)), expected7)
  })
  it("Test 8: ", () => {
    assert.deepEqual(util.format(ast(source8)), expected8)
  })
  it("Test 9: ", () => {
    assert.deepEqual(util.format(ast(source9)), expected9)
  })
  it("Test 10: ", () => {
    assert.deepEqual(util.format(ast(source10)), expected10)
  })
  it("Test 11: ", () => {
    assert.deepEqual(util.format(ast(source11)), expected11)
  })
  it("Test 12: ", () => {
    assert.deepEqual(util.format(ast(source12)), expected12)
  })
  // it("Test 13: ", () => {
  //   assert.deepEqual(util.format(ast(source13)), expected13)
  // })
  it("Test 14: ", () => {
    assert.deepEqual(util.format(ast(source14)), expected14)
  })
})
