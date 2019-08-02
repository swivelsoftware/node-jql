import { checkNull } from './utils/check'

/**
 * Available types in node-jql
 */
export type Type = 'string'|'number'|'boolean'|'object'|'Date'|'Array'|'RegExp'|'any'

/**
 * Default value for each type
 */
export const defaults: { [key: string]: any } = {
  string: '',
  number: 0,
  boolean: false,
  any: null,
}
Object.defineProperty(defaults, 'object', {
  get: () => ({}),
})
Object.defineProperty(defaults, 'Date', {
  get: () => new Date(0),
})
Object.defineProperty(defaults, 'Array', {
  get: () => [],
})

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

/**
 * Normalize the value so that it can be stored in node-jql
 * @param value [any]
 * @param t [Type] optional
 */
export function normalize(value: any, t = type(value)): any {
  if (checkNull(value)) return null
  switch (t) {
    case 'object':
    case 'Array':
      return JSON.stringify(value)
    case 'Date':
      return (value as Date).getTime()
    default:
      return value
  }
}

/**
 * Denormalize the value retrieved from node-jql
 * @param value [any]
 * @param t [Type]
 */
export function denormalize(value: any, t: Type): any {
  if (checkNull(value)) return null
  switch (t) {
    case 'object':
    case 'Array':
      return JSON.parse(value)
    case 'Date':
      return new Date(value)
    default:
      return value
  }
}
