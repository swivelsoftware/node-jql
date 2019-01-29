export type Type = 'string' | 'number' | 'bigint' | 'boolean' | 'object'

/**
 * 1) column name must be unique within a table
 */
export class Column {
  constructor(readonly name: string, readonly symbol: symbol, readonly type: Type[] | Type | boolean = true) {
  }

  public validate(value?: any): boolean {
    const type = typeof value
    if (type === 'symbol' || type === 'undefined' || type === 'function') throw new Error(`type '${type}' is unserializable`)
    if (this.type !== true &&
      (typeof this.type === 'string' && typeof value !== this.type) ||
      (Array.isArray(this.type) && this.type.indexOf(type) === -1)
    ) {
      throw new Error(`column '${this.name}' expects type '${JSON.stringify(this.type)}'. got type '${type}'`)
    }
    return true
  }
}
