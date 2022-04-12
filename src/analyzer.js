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

Object.assign(ArrayExpression.prototype, {
    isEquivalentTo(target) {
        return (
            target.constructor === ArrayExpression && this.baseType.isEquivalentTo(target.baseTypegi)
        )
    },
    isAssignableTo(target) {
        return this.isEquivalentTo(target)
    }
})
