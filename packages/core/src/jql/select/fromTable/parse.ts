import { ITable } from './index.if'
import { Table } from './table'

const registered: { [key: string]: new (...args: any[]) => Table } = {}

/**
 * Register table to be parseable
 * @param tableClass [Class<Table>]
 */
export function register<T extends Table>(tableClass: new (...args: any[]) => T) {
  registered[tableClass.name] = tableClass
}

/**
 * Parse table json to table instance
 * @param json [ITable]
 */
export function parse<T extends Table>(json: ITable): T {
  if ('constructor' in json && json.constructor.name === json.classname) return json as T
  if (!('classname' in json)) throw new SyntaxError('Invalid table json')
  const CONSTRUCTOR = registered[json.classname]
  if (!CONSTRUCTOR) throw new SyntaxError(`Invalid table classname '${json.classname}'`)
  return new CONSTRUCTOR(json) as T
}
