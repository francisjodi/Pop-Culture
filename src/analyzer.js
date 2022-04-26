import { Type } from "js-yaml"
import {
Program,
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
ShortIfStatement,
ForStatement, 
EmptyArray,
ArrayExpression, 
SubscriptExpression, 
Token,
//MapType,
//DictionaryType, 
error
} from core.js

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

Object.assign(ArrayExpression.prototype, {
    isEquivalentTo(target) {
        return (
            target.constructor === ArrayExpression && this.baseType.isEquivalentTo(target.baseType)
        )
    },
    isAssignableTo(target) {
        return this.isEquivalentTo(target)
    }
})

Object.assign(SubscriptExpression.prototype, {
    isEquivalentTo(target) {
        return (
            target.constructor == SubscriptExpression && 
            this.array.baseType.isEquivalentTo(target.array.baseType)
        )
    },
    isAssignableTo(target) {
        return this.isEquivalentTo(target)
    }
})

Object.assign(Function.prototype, {
    isEquivalentTo(target) {
        return (
            target.constructor === Function &&
            this.paramCount === target.paramCount &&
            this.readOnly === target.readOnly
        )
    },
    isAssignableTo(target) {
        return (
            target.constructor === Function &&
            this.paramCount === target.paramCount &&
            this.readOnly === target.readOnly
        )
    }
})

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

//  function checkMap(e) {
//      check(e.type.contructor === MapType, "Map expected", e)
//  }

//  function checkDictionary(e) {
//      check(e.type.contructor === DictionaryType, "Dictrionaty expected", e) 
//  }

//   function checkInteger(e) {
//     checkType(e, [Type.INT], "an integer")
//   }

// function checkString(e) {
//     checkType(e, [Type.STRING], "a string")
// }

function checkIsAType(e) {
    check(e instanceof Type, "Type expected", e)
  }

  function checkMemberDeclared(field, { in: struct }) {
    check(struct.type.fields.map(f => f.name.lexeme).includes(field), "No such field")
  }
  
  function checkInLoop(context) {
    check(context.inLoop, "Break can only appear in a loop")
  }
  
  function checkInFunction(context) {
    check(context.function, "Return can only appear in a function")
  }  

//   function checkReturnsNothing(f) {
//     check(f.type.returnType === Type.VOID, "Something should be returned here")
//   }
  
  function checkReturnsSomething(f) {
    check(f.type.returnType !== Type.VOID, "Cannot return a value here")
  }

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

class Context{
    constructor({parent = null, locals = new Map(), inLoop = false, function: f = null }) {
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
    analyze(node) {
        return this[node.constructor.name](node)
    }
    Program(p) {
        this.analyze(p.statements)
    }
    BreakStatement(s) {
        checkInLoop(this)
    }
    ReturnStatement(s) {
        checkInFunction(this)
        checkReturnsSomething(this.function)
        this.analyze(s.expression)
        checkReturnable({ expression: s.expression, from: this.function })
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
    WhileStatement(s) {
        this.analyze(s.test)
        checkBoolean(s.test)
        this.newChildContext({ inLoop: true }).analyze(s.body)
    }

    Token(t) {
        // For ids being used, not defined
        if (t.category === "Id") {
          t.value = this.lookup(t.lexeme)
          t.type = t.value.type
        }
        // if (t.category === "Int") [t.value, t.type] = [BigInt(t.lexeme), Type.INT]
        // if (t.category === "Float") [t.value, t.type] = [Number(t.lexeme), Type.FLOAT]
        if (t.category === "Str") [t.value, t.type] = [t.lexeme, Type.STRING]
        if (t.category === "Bool") [t.value, t.type] = [t.lexeme === "true", Type.BOOLEAN]
      }
}

export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.contents)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
}
