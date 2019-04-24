import { diff } from 'deep-diff'
import { isUndefined } from 'util'

export type Type = 'any'|'string'|'number'|'boolean'|'object'|'Date'|'Array'

export const defaults = {
  any: undefined,
  string: '',
  number: 0,
  boolean: false,
  object: {},
  Date: undefined,
  Array: [],
}

/**
 * Get type of value
 * @param value [any]
 */
export function getType(value: any): Type {
  if (value instanceof Date) return 'Date'
  if (Array.isArray(value)) return 'Array'
  const type = typeof value
  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'object':
      return type
    default:
      return 'any'
  }
}

/**
 * Compare 2 values for equality
 * @param l [T]
 * @param r [T]
 */
export function equals<T>(l: T, r: T): boolean {
  if (l instanceof Date && r instanceof Date) {
    return l.getTime() === r.getTime()
  }
  else if (Array.isArray(l) && Array.isArray(r)) {
    for (const item of l) {
      if (!r.find(item_ => equals(item_, item))) return false
    }
    return true
  }
  else if (typeof l === 'object' && typeof r === 'object') {
    return !!diff(l, r)
  }
  else {
    return l === r
  }
}

export function normalize(value: any, type: Type = getType(value)): any {
  if (isUndefined(value)) return value
  switch (type) {
    case 'Date':
      return (value as Date).getTime()
    case 'object':
    case 'Array':
      return JSON.stringify(value)
    default:
      return value
  }
}

export function denormalize(value: any, type: Type): any {
  if (isUndefined(value)) return value
  switch (type) {
    case 'Date':
      return new Date(value)
    case 'object':
    case 'Array':
      return JSON.parse(value)
    default:
      return value
  }
}
