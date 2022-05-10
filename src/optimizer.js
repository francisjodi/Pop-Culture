import * as core from "./core.js"
import * as stdlib from "./stdlib.js"

export default function optimize(node) {
  console.log(node.constructor.name)
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable)
    d.initializer = optimize(d.initializer)
    return d
  },
  TypeDeclaration(d) {
    d.type = optimize(d.type)
    return d
  },

  FunctionDeclaration(d) {
    d.fun = optimize(d.fun)
    d.parameters = optimize(d.parameters)
    if (d.body) d.body = optimize(d.body)
    return d
  },
  Assignment(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return []
    }
    return s
  },
  BreakStatement(s) {
    return s
  },
  IfStatement(s) {
    s.test = optimize(s.test)
    s.consequents = optimize(s.consequents)
    s.alternate = optimize(s.alternate)
    // if (s.test.constructor === Boolean) {
    //   return s.test ? s.consequent : s.alternate
    // }
    return s
  },
  WhileStatement(s) {
    s.expression = optimize(s.expression)
    if (s.expression === false) {
      // while false is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  ForStatement(s) {
    s.collection = optimize(s.collection)
    s.body = optimize(s.body)
    if (s.collection.constructor === core.EmptyArray) {
      return []
    }
    return s
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression)
    return s
  },
  PrintStatement(s) {
    s.expression = optimize(s.expression)
    return s
  },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },
  BinaryExpression(e) {
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.op === "??") {
      // Coalesce Empty Optional Unwraps
      if (e.left.constructor === core.EmptyOptional) {
        return e.right
      }
    } else if (e.op === "&&") {
      // Optimize boolean constants in && and ||
      if (e.left === true) return e.right
      else if (e.right === true) return e.left
    } else if (e.op === "||") {
      if (e.left === false) return e.right
      else if (e.right === false) return e.left
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "**") return e.left ** e.right
        else if (e.op === "<") return e.left < e.right
        else if (e.op === "<=") return e.left <= e.right
        else if (e.op === "==") return e.left === e.right
        else if (e.op === "!=") return e.left !== e.right
        else if (e.op === ">=") return e.left >= e.right
        else if (e.op === ">") return e.left > e.right
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-")
        return new core.UnaryExpression("-", e.right)
      else if (e.left === 1 && e.op === "**") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
      else if (e.op === "*" && e.right === 0) return 0
      else if (e.op === "**" && e.right === 0) return 1
    }
    return e
  },
  UnaryExpression(e) {
    e.op = optimize(e.op)
    e.operand = optimize(e.operand)
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand
      }
    }
    return e
  },
  ArrayExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },
  Variable(v) {
    return v
  },
  Function(f) {
    return f
  },
  Boolean(e) {
    return e
  },
  String(e) {
    return e
  },
  Number(e) {
    return e
  },
  Token(t) {
    // All tokens get optimized away and basically replace with either their
    // value (obtained by the analyzer for literals and ids) or simply with
    // lexeme (if a plain symbol like an operator)
    return t.value ?? t.lexeme
  },
  Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
  },
}
