import { Expression } from '.'
import { expressions } from './expressions'
import { IExpression } from './interface'

/**
 * Parse JQL raw json to class instance
 * @param json [IExpression]
 */
export function parseExpr<T extends Expression>(json: IExpression|any): T
export function parseExpr(json: IExpression|any): Expression
export function parseExpr(json: IExpression|any): Expression {
  if (json === undefined) {
    return new expressions.Unknown()
  }
  else if (typeof json === 'object' && !(json instanceof Date) && !(json instanceof RegExp) && !Array.isArray(json)) {
    if (!json.classname) throw new SyntaxError(`Unknown expression: classname not defined in ${JSON.stringify(json)}`)
    const CONSTRUCTOR = expressions[json.classname]
    if (!CONSTRUCTOR) throw new SyntaxError(`Unknown expression: classname ${json.classname} not found`)
    return new CONSTRUCTOR(json)
  }
  else {
    return new expressions.Value(json)
  }
}
