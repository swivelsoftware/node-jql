import { Expression } from '.'
import { getType } from '../Type'
import { JQLError } from '../utils/error'
import { expressions } from './expressions'
import { Unknown } from './unknown'
import { Value } from './value'

export function parse(value: any): Expression {
  if (value instanceof Expression) {
    return value
  }
  else if (value === undefined) {
    return new Unknown()
  }
  else if (typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
    if (!value.classname) throw new SyntaxError('`classname` is not specified')
    const CONSTRUCTOR = expressions[value.classname]
    if (!CONSTRUCTOR) throw new SyntaxError(`Unknown expression '${value.classname}'`)
    try {
      return new CONSTRUCTOR(value)
    }
    catch (e) {
      throw new JQLError('SyntaxError', `Fail to parse expression '${value.classname}'`, e)
    }
  }
  else {
    return new Value({ value, type: getType(value) })
  }
}
