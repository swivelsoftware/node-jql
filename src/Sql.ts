import squel = require('squel')

export type Type = 'any'|'string'|'number'|'boolean'|'object'|'symbol'|'Date'|'RegExp'

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

export abstract class Sql {
  public abstract validate(availableTables?: string[]): void
  public abstract toSquel(): squel.BaseBuilder

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }
}
