import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"
// not sure what classes we need based off of our grammar and 
// i think our grammar has to be fully finished before we start anything
// else

const popCultureGrammar = ohm.grammar(fs.readFileSync("src/popCulture.ohm"))

const astBuilder = popCultureGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Statement_assign(id, _eq, expression, _semicolon) {
    return new core.Assignment(id.ast(), expression.ast())
  },
  Call(callee, _left, args, _right) {
    return new core.Call(callee.ast(), args.asIteration().ast())
  },
  Statement_vardec() {
    return new core.VariableDeclaration()
  },
  Statement_funcdec() {

  },
  

})

export default function ast(sourceCode) {
  const match = popCultureGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
