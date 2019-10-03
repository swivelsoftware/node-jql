import moment = require('moment')
import { IJQL, Type } from './index.if'

/**
 * Default value for each type
 */
export const DEFAULTS = {
  string: '',
  number: 0,
  boolean: false,
  date: 0,
  datetime: 0,
  any: null,
}
Object.defineProperty(DEFAULTS, 'object', { get: () => ({}) })
Object.defineProperty(DEFAULTS, 'array', { get: () => [] })

/**
 * Check type of value is correct
 * @param type [Type]
 * @param value [any]
 */
export function check(type: Type, value: any) {
  switch (type) {
    case 'date':
    case 'datetime':
      return moment(value).isValid()
    case 'any':
      return true
    case 'array':
      return Array.isArray(value)
    default:
      return typeof value === type
  }
}

/**
 * Base JQL class
 */
export abstract class JQL implements IJQL {

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }
  // @override
  public abstract classname: string

  /**
   * Convert to raw JQL, i.e. JSON
   */
  public abstract toJson(): IJQL

  /**
   * check if valid
   */
  protected check(): void {
    // do nothing
  }
}
