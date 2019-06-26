import { Expression, IExpression } from '.'
import { Unknown } from './expressions/Unknown'
import { Value } from './expressions/Value'

export function parse<T extends Expression>(json: IExpression|any): T

/**
 * Parse JQL raw json to class instance
 * @param json [IExpression]
 */
export function parse(json: IExpression|any): Expression {
  if (json === undefined) {
    return new Unknown()
  }
  else if (typeof json === 'object' && !(json instanceof Date) && !Array.isArray(json)) {
    if (!json.classname) throw new SyntaxError('Unknown expression: classname not defined')
    const CONSTRUCTOR = require(`./expressions/${json.classname}`)[json.classname]
    if (!CONSTRUCTOR) throw new SyntaxError(`Unknown expression: classname ${json.classname} not found`)
    return new CONSTRUCTOR(json)
  }
  else {
    return new Value(json)
  }
}
