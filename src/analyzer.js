import {
    Assignment,
    Call,
    Variable,
    Function,
    ArrayExpression,
    SubscriptExpression,
    Token,
    error
} from "./core.js"

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