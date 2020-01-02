import { IParseable, ISQL } from './index.if'

// registered parseable class
const registered: { [key: string]: new (...args: any[]) => ISQL } = {}

/**
 * Register table to be parseable
 * @param tableClass [Class<IParseable>]
 */
export function register<T extends IParseable>(tableClass: new (...args: any[]) => T) {
  if (registered[tableClass.name]) throw new Error(`Class '${tableClass.name}' already registered`)
  registered[tableClass.name] = tableClass
}

/**
 * Parse json to instance
 * @param json [IParseable]
 */
export function parse<T extends IParseable>(json: IParseable): T {
  if ('constructor' in json && json.constructor.name === json.classname) return json as T
  if (!('classname' in json)) throw new SyntaxError('Invalid JQL json')
  const CONSTRUCTOR = registered[json.classname]
  if (!CONSTRUCTOR) throw new SyntaxError(`Invalid JQL classname '${json.classname}'`)
  return new CONSTRUCTOR(json) as T
}
