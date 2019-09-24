/**
 * Base JQL interface
 */
export interface IJQL {
  /**
   * Class name of the JQL
   */
  classname: string
}

/**
 * Supported data type
 */
export type Type = 'string'|'number'|'boolean'|'date'|'datetime'|'object'|'array'|'any'
