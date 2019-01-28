import * as Expressions from './index'
import Expression = Expressions.IExpression

interface ICreateOptions {
  allow?: string[]
  disallow?: string[]
}

export function create(expression: Expression, options: ICreateOptions = {}): Expression {
  switch (typeof expression) {
    case 'object':
      const CONSTRUCTOR = Expressions[expression.classname]
      if (!CONSTRUCTOR) { throw new Error(`expression '${expression.classname}' not supported`) }
      if (options.allow && options.allow.indexOf(expression.classname) === -1) {
        throw new Error(`invalid expression '${expression.classname}'`)
      }
      else if (options.disallow && options.disallow.indexOf(expression.classname) > -1) {
        throw new Error(`invalid expression '${expression.classname}'`)
      }
      return new CONSTRUCTOR(expression)
    default:
      throw new Error(`invalid 'expression' object`)
  }
}
