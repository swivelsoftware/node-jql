import { JQL } from '.'
import { TableConstraint } from '../engine/memory/table/constraint'
import { ITableConstraint } from '../engine/memory/table/index.if'
import { Expression } from './expressions'
import { IExpression } from './expressions/index.if'
import { IJQL } from './index.if'
import { ITable } from './select/fromTable/index.if'
import { Table } from './select/fromTable/table'

const registered: { [key: string]: new (...args: any[]) => JQL } = {}

/**
 * Register table to be parseable
 * @param tableClass [Class<JQL>]
 */
export function register<T extends JQL>(tableClass: new (...args: any[]) => T) {
  if (registered[tableClass.name]) throw new Error(`Class '${tableClass.name}' already registered`)
  registered[tableClass.name] = tableClass
}

/**
 * Parse Expression json to Expression instance
 * @param json [IExpression]
 */
export function parse<T extends Expression>(json: IExpression): T

/**
 * Parse Table json to Table instance
 * @param json [ITable]
 */
export function parse<T extends Table>(json: ITable): T

/**
 * Parse constraint json to constraint instance
 * @param json [ICreateTableConstraint]
 */
export function parse<T extends TableConstraint>(json: ITableConstraint): T

/**
 * Parse JQL json to JQL instance
 * @param json [IJQL]
 */
export function parse<T extends JQL>(json: IJQL): T {
  if ('constructor' in json && json.constructor.name === json.classname) return json as T
  if (!('classname' in json)) throw new SyntaxError('Invalid JQL json')
  const CONSTRUCTOR = registered[json.classname]
  if (!CONSTRUCTOR) throw new SyntaxError(`Invalid JQL classname '${json.classname}'`)
  return new CONSTRUCTOR(json) as T
}
