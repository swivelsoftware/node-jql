/**
 * types supported
 */
export type Type = 'any'|'string'|'number'|'boolean'|'object'|'symbol'|'Date'|'RegExp'

/**
 * get type of value
 */
export function getType(value: any): Type {
  if (value instanceof Date) return 'Date'
  if (value instanceof RegExp) return 'RegExp'
  const type = typeof value
  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'object':
    case 'symbol':
      return type
    default:
      return 'any'
  }
}

/**
 * column options
 */
export interface IColumnOptions {
  // default value
  default?: any

  // whether can be null
  nullable?: boolean
}
