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
error
} from core.js

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

export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.contents)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
}
