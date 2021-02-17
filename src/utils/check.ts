import { diff } from 'deep-diff'
import { type } from '../type'

/**
 * Check whether a value is null, or undefined
 * @param value [any]
 */
export function checkNull<T = null>(value: any): value is T {
  return !value && (value === undefined || value === null)
}

/**
 * Check whether the 2 values are the same
 * @param l [any]
 * @param r [any]
 */
export function equals<T>(l: T, r: T): boolean {
  switch (typeof l) {
    case 'object':
      if (l instanceof Date && type(l) === 'Date' && r instanceof Date && type(r) === 'Date') return l.getTime() === r.getTime()
      if (Array.isArray(l) && Array.isArray(r)) return l.length === r.length && l.reduce((result, li) => result && !!r.find(ri => ri === li), true)
      return !!diff(l, r)
    case 'string':
    case 'number':
    case 'boolean':
    default:
      return l === r
  }
}
