import * as Expressions from './index'

interface ICreateOptions {
  allow?: string[]
  disallow?: string[]
}

export function create(expression: Expressions.IExpression, options: ICreateOptions = {}): Expressions.Expression {
  switch (typeof expression) {
    case 'object':
      if (!expression.classname) throw new Error(`expression class is not defined`)

      const CONSTRUCTOR = Expressions[expression.classname]

      if (!CONSTRUCTOR) {
        throw new Error(`expression '${expression.classname}' not supported`)
      }
      else if (options.allow && options.allow.indexOf(expression.classname) === -1) {
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
