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
  constructor(id, args) {
    Object.assign(this, { id, args })
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

export class Type {
  // Type of all basic type int, float, string, etc. and superclass of others
  static BOOLEAN = new Type("bool")
  static INT = new Type("int")
  static STRING = new Type("string")
  static ANY = new Type("any")
  constructor(description) {
    Object.assign(this, { description })
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
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

export class VariableDeclaration {
  constructor(modifier, variable, initializer) {
    Object.assign(this, { modifier, variable, initializer })
  }
}

export class FunctionDeclaration {
  constructor(fun, params, body) {
    Object.assign(this, { fun, params, body })
  }
}

export class BreakStatement {}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression
  }
}

export class IfStatement {
  constructor(test, consequents, alternate) {
    Object.assign(this, { test, consequents, alternate })
  }
}

export class ForStatement {
  constructor(iterator, collection, body) {
    Object.assign(this, { iterator, collection, body })
  }
}

export class EmptyArray {}

export class ArrayExpression {
  constructor(elements) {
    this.elements = elements
  }
}

export class SubscriptExpression {
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

export class Token {
  constructor(category, source) {
    Object.assign(this, { category, source })
  }
  get lexeme() {
    return this.source.contents
  }
  get description() {
    return this.source.contents
  }
}

export function error(message, token) {
  if (token) {
    throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

Program.prototype[util.inspect.custom] = function () {
  const tags = new Map()
  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    if (node.constructor === Token) {
      tag(node?.value)
    } else {
      tags.set(node, tags.size + 1)
      for (const child of Object.values(node)) {
        Array.isArray(child) ? child.forEach(tag) : tag(child)
      }
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (e?.constructor === Token) {
        return `(${e.category}, "${e.lexeme}"${
          e.value ? "," + view(e.value) : ""
        })`
      }
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
    }
  }

  tag(this)
  return [...lines()].join("\n")
}
