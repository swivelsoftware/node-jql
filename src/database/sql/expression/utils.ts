import { JQLError } from '../../../utils/error'
import { getType } from '../../schema'
import { Expression } from './core'
import * as Expressions from './core'
import { ValueExpression } from './value'

export function parseExpression(value: any): Expression {
  if (value instanceof Expression) {
    return value
  }
  else if (typeof value === 'object' && !Array.isArray(value)) {
    if (!value.classname) throw new JQLError('Unknown expression without classname')
    const CONSTRUCTOR = Expressions[value.classname]
    if (!CONSTRUCTOR) throw new JQLError(`Unknown expression with classname '${value.classname}'`)
    try {
      return new CONSTRUCTOR(value)
    }
    catch (e) {
      throw new JQLError(`Fail to parse expression with classname '${value.classname}'`, e)
    }
  }
  else {
    return new ValueExpression({ value, type: getType(value) })
  }
}
