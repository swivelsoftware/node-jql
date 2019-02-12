import { JQLError } from '../../../../utils/error'
import * as Expressions from './index'

interface ICreateOptions {
  allow?: string[]
  disallow?: string[]
}

export function create(expression: Expressions.IExpression, options: ICreateOptions = {}): Expressions.Expression {
  switch (typeof expression) {
    case 'object':
      if (!expression.classname) throw new JQLError('expression class is not defined')
      if (!expression.classname.startsWith('$')) throw new JQLError(`invalid expression '${expression.classname}'`)

      const CONSTRUCTOR = Expressions[expression.classname]
      if (!CONSTRUCTOR) {
        throw new JQLError(`expression '${expression.classname}' not supported`)
      }
      else if (options.allow && options.allow.indexOf(expression.classname) === -1) {
        throw new JQLError(`invalid expression '${expression.classname}'`)
      }
      else if (options.disallow && options.disallow.indexOf(expression.classname) > -1) {
        throw new JQLError(`invalid expression '${expression.classname}'`)
      }
      try {
        return new CONSTRUCTOR(expression)
      }
      catch (e) {
        throw new JQLError(`fail to create expression '${expression.classname}'`, e)
      }
    default:
      throw new JQLError(`invalid 'expression' object`)
  }
}
