import { Expression } from '.'
import { IExpression } from './index.if'

const registered: { [key: string]: new (...args: any[]) => Expression } = {}

/**
 * Register expression to be parseable
 * @param expressionClass [Class<Expression>]
 */
export function register<T extends Expression>(expressionClass: new (...args: any[]) => T) {
  registered[expressionClass.name] = expressionClass
}

/**
 * Parse expression json to expression instance
 * @param json [IExpression]
 */
export function parse<T extends Expression>(json: IExpression): T {
  if ('constructor' in json && json.constructor.name === json.classname) return json as T
  if (!('classname' in json)) throw new SyntaxError('Invalid expression json')
  const CONSTRUCTOR = registered[json.classname]
  if (!CONSTRUCTOR) throw new SyntaxError(`Invalid expression classname '${json.classname}'`)
  return new CONSTRUCTOR(json) as T
}
