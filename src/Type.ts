/**
 * Available types in node-jql
 */
export type Type = 'string'|'number'|'boolean'|'object'|'Date'|'Array'|'RegExp'|'any'

/**
 * Determine the data type of a value in node-jql
 * @param value [any]
 */
export function type(value: any): Type {
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      if (value instanceof Date && Object.prototype.toString.call(value) === '[object Date]') return 'Date'
      if (value instanceof RegExp) return 'RegExp'
      if (Array.isArray(value)) return 'Array'
      return 'object'
    default:
      return 'any'
  }
}
