import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const popCultureGrammar = ohm.grammar(fs.readFileSync("src/popCulture.ohm"))

const astBuilder = popCultureGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Statement_assign(variable, _eq, expression, _semicolon) {
    return new core.Assignment(variable.ast(), expression.ast())
  },
  Statement_call(call, _semicolon) {
    return call.ast()
  },
  Statement_vardec(modifier, id, _eq, initializer, _semicolon) {
    return new core.VariableDeclaration(
      modifier.sourceString,
      id.ast(),
      initializer.ast()
    )
  },
  Statement_fundec(_fun, id, _open, params, _close, body, _semicolon) {
    return new core.FunctionDeclaration(id.ast(), params.asIteration().ast(), body.ast())
  },
  Statement_break(_break, _semicolon) {
    return new core.BreakStatement()
  },
  Statement_return(_return, expression, _semicolon) {
    return new core.ReturnStatement(expression.ast())
  },
  Statement_print(_print, argument, _semicolon) {
    return new core.PrintStatement(argument.ast())
  },
  IfStmt_long(_if, test, consequent, _else, alternate) {
    return new core.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStmt_short(_if, test, consequent) {
    return new core.ShortIfStatement(test.ast(), consequent.ast())
  },
  LoopStmt_while(_while, test, body) {
    return new core.WhileStatement(test.ast(), body.ast())
  },
  LoopStmt_for(_for, id, _in, collection, body) {
    return new core.ForStatement(id.sourceString, collection.ast(), body.ast())
  },
  Block(_open, body, _close) {
    return body.ast()
  },
  Exp1_unwrapelse(unwrap, op, alternate) {
    return new core.BinaryExpression(
      op.sourceString,
      unwrap.ast(),
      alternate.ast()
    )
  },
  Exp2_or(left, _ops, right) {
    const operands = [left.ast(), ...right.ast()]
    return operands.reduce((x, y) => new core.BinaryExpression("||", x, y))
  },
  Exp2_and(left, _ops, right) {
    const operands = [left.ast(), ...right.ast()]
    return operands.reduce((x, y) => new core.BinaryExpression("&&", x, y))
  },
  Exp3_bitor(left, _ops, right) {
    const operands = [left.ast(), ...right.ast()]
    return operands.reduce((x, y) => new core.BinaryExpression("|", x, y))
  },
  Exp3_bitxor(left, _ops, right) {
    const operands = [left.ast(), ...right.ast()]
    return operands.reduce((x, y) => new core.BinaryExpression("^", x, y))
  },
  Exp3_bitand(left, _ops, right) {
    const operands = [left.ast(), ...right.ast()]
    return operands.reduce((x, y) => new core.BinaryExpression("&", x, y))
  },
  Exp4_compare(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp5_shift(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp6_add(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp7_multiply(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp8_power(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp8_unary(op, operand) {
    return new core.UnaryExpression(op.sourceString, operand.ast())
  },
  Exp9_emptyarray( _left, _right) {
    return new core.EmptyArray()
  },
  Exp9_arrayexp(_left, args, _right) {
    return new core.ArrayExpression(args.asIteration().ast())
  },
  Exp9_parens(_open, expression, _close) {
    return expression.ast()
  },
  Exp9_subscript(array, _left, subscript, _right) {
    return new core.SubscriptExpression(array.ast(), subscript.ast())
  },
  Exp9_call(callee, _left, args, _right) {
    return new core.Call(callee.ast(), args.asIteration().ast())
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source)
  },
  num(_digits) {
    return new core.Token("Int", this.source)
  },
  String(_openQuote, chars, _closeQuote) {
    return new core.Token("String", this.source)
  },
  _iter(...children) {
    return children.map(child => child.ast())
  }
})

export default function ast(sourceCode) {
  const match = popCultureGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
