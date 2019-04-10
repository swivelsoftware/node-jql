import { diff } from 'deep-diff'
import squel = require('squel')

export type Type = 'any'|'string'|'number'|'boolean'|'object'|'Date'

export const defaults = {
  any: undefined,
  string: '',
  number: 0,
  boolean: false,
  object: {},
  Date: 0,
}

/**
 * Get type of value
 * @param value [any]
 */
export function getType(value: any): Type {
  if (value instanceof Date) return 'Date'
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

export abstract class Sql {
  public abstract validate(availableTables?: string[]): void
  public abstract toSquel(): squel.BaseBuilder

  // @override
  get [Symbol.toStringTag]() {
    return 'Sql'
  }

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }
}
