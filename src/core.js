import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class Variable {
  constructor(name, readOnly) {
    Object.assign(this, { name, readOnly })
  }
}

export class Function {
  constructor(name, paramCount, readOnly) {
    Object.assign(this, { name, paramCount, readOnly })
  }
}

export class WhileStatement {
  constructor(expression, body) {
    Object.assign(this, { expression, body })
  }
}

export class PrintStatement {
  constructor(expression) {
    this.expression = expression
  }
}

export class BinaryExpression {
  constructor(left, op, right) {
    Object.assign(this, { left, op, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class FunctionDeclaration {
  constructor(func, params, body) {
    Object.assign(this, { func, params, body })
  }
}
