import {
  Program,
  Type,
  Assignment,
  Call,
  Variable,
  Function,
  WhileStatement,
  PrintStatement,
  BinaryExpression,
  UnaryExpression,
  VariableDeclaration,
  FunctionDeclaration,
  BreakStatement,
  ReturnStatement,
  IfStatement,
  ForStatement,
  EmptyArray,
  ArrayExpression,
  SubscriptExpression,
  Token,
  //MapType,
  //DictionaryType,
  error,
} from "./core.js"

/**********************************************
 *  TYPE EQUIVALENCE AND COMPATIBILITY RULES  *
 *********************************************/

Object.assign(Type.prototype, {
  isEquivalentTo(target) {
    return this == target
  },
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

// Object.assign(ArrayExpression.prototype, {
//   isEquivalentTo(target) {
//     return (
//       target.constructor === ArrayExpression &&
//       this.baseType.isEquivalentTo(target.baseType)
//     )
//   },
//   isAssignableTo(target) {
//     return this.isEquivalentTo(target)
//   },
// })

// Object.assign(SubscriptExpression.prototype, {
//   isEquivalentTo(target) {
//     return (
//       target.constructor == SubscriptExpression &&
//       this.array.baseType.isEquivalentTo(target.array.baseType)
//     )
//   },
//   isAssignableTo(target) {
//     return this.isEquivalentTo(target)
//   },
// })

// Object.assign(Function.prototype, {
//   isEquivalentTo(target) {
//     return (
//       target.constructor === Function &&
//       this.paramCount === target.paramCount &&
//       this.readOnly === target.readOnly
//     )
//   },
//   isAssignableTo(target) {
//     return (
//       target.constructor === Function &&
//       this.paramCount === target.paramCount &&
//       this.readOnly === target.readOnly
//     )
//   },
// })

/**************************
 *  VALIDATION FUNCTIONS  *
 *************************/

function check(condition, message, entity) {
  if (!condition) error(message, entity)
}

function checkType(e, types, expectation) {
  check(types.includes(e.type), `Expected ${expectation}`)
}

function checkBoolean(e) {
  checkType(e, [Type.BOOLEAN], "a boolean")
}

function checkInteger(e) {
  checkType(e, [Type.INT], "an integer")
}

function checkString(e) {
  checkType(e, [Type.STRING], "a string")
}

function checkHaveSameType(e1, e2) {
  check(e1.type.isEquivalentTo(e2.type), "Operands do not have the same type")
}

function checkNumericOrString(e) {
  checkType(e, [Type.INT, Type.STRING], "a number or string")
}

function checkCallable(e) {
  check(e.constructor == Function, "Call of non-function")
}

function checkInLoop(context) {
  check(context.inLoop, "Break can only appear in a loop")
}

function checkInFunction(context) {
  check(context.function, "Return can only appear in a function")
}

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // Pop Culture allows for shadowing
    if (name in this.locals) error(`Identifier ${name} already declared`)
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    error(`Identifier ${name} not declared`)
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    this.analyze(p.statements)
  }
  VariableDeclaration(d) {
    this.analyze(d.initializer)
    d.variable.value = new Variable(
      d.variable.lexeme,
      d.modifier.lexeme === "stickIt"
    )
    d.variable.value.type = d.initializer.type // Type inference
    this.add(d.variable.lexeme, d.variable.value)
  }
  FunctionDeclaration(d) {
    d.fun.value = new Function(d.fun.lexeme, d.params.length, true)
    const childContext = this.newChildContext({
      inLoop: false,
      function: d.fun.value,
    })
    this.add(d.fun.lexeme, d.fun.value)
    childContext.analyze(d.body)
  }
  BreakStatement(s) {
    checkInLoop(this)
  }
  ReturnStatement(s) {
    checkInFunction(this)
    this.analyze(s.expression)
  }
  IfStatement(s) {
    this.analyze(s.test)
    checkBoolean(s.test)
    this.newChildContext().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      this.newChildContext().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context
      this.analyze(s.alternate)
    }
  }
  ShortIfStatement(s) {
    this.analyze(s.test)
    checkBoolean(s.test)
    this.newChildContext().analyze(s.consequent)
  }
  WhileStatement(s) {
    this.analyze(s.test)
    checkBoolean(s.test)
    this.newChildContext({ inLoop: true }).analyze(s.body)
  }
  PrintStatement(s) {
    this.analyze(s.expression)
  }
  BinaryExpression(e) {
    this.analyze(e.left)
    this.analyze(e.right)
    if (["&", "|", "^", "<<", ">>"].includes(e.op)) {
      e.type = Type.INT
    } else if (["+"].includes(e.op)) {
      e.type = e.left.type
    } else if (["-", "*", "/", "%", "**"].includes(e.op)) {
      e.type = e.left.type
    } else if (["<", "<=", ">", ">="].includes(e.op)) {
      e.type = Type.BOOLEAN
    } else if (["==", "!="].includes(e.op)) {
      e.type = Type.BOOLEAN
    } else if (["&&", "||"].includes(e.op)) {
      e.type = Type.BOOLEAN
    }
  }
  Call(c) {
    this.analyze(c.id)
    const callee = c.id?.value
    checkCallable(callee)
    this.analyze(c.args)
    // TODO ---> checkFunctionCallArguments(c.args, callee.type) check same # of args as parms
  }
  Array(a) {
    a.forEach((item) => this.analyze(item))
  }
  Token(t) {
    // For ids being used, not defined
    if (t.category === "Id") {
      t.value = this.lookup(t.lexeme)
      t.type = t.value.type
    }
    if (t.category === "Int") [t.value, t.type] = [BigInt(t.lexeme), Type.INT]
    if (t.category === "Str") [t.value, t.type] = [t.lexeme, Type.STRING]
    if (t.category === "Bool")
      [t.value, t.type] = [t.lexeme === "forRealz", Type.BOOLEAN]
  }
}

export default function analyze(node) {
  const initialContext = new Context({})
  //   for (const [name, type] of Object.entries(stdlib.contents)) {
  //     initialContext.add(name, type)
  //   }
  initialContext.analyze(node)
  return node
}
