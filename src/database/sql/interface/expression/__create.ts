import * as Expressions from "./index";
import Expression = Expressions.Expression

interface CreateExpressionOptions {
  allow?: string[]
  disallow?: string[]
}

export function create(expression: Expression, options: CreateExpressionOptions = {}): Expression {
  switch (typeof expression) {
    case 'object':
      const Constructor = Expressions[expression.classname]
      if (!Constructor) throw new Error(`expression '${expression.classname}' not supported`)
      if (options.allow && options.allow.indexOf(expression.classname) === -1) throw new Error(`invalid expression '${expression.classname}'`)
      else if (options.disallow && options.disallow.indexOf(expression.classname) > -1) throw new Error(`invalid expression '${expression.classname}'`)
      return new Constructor(expression)
    default:
      throw new Error(`invalid 'expression' object`)
  }
}