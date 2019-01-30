import { isSymbol } from "util";

export type Type = 'string' | 'number' | 'bigint' | 'boolean' | 'object'

/**
 * 1) column name must be unique within a table
 */
export class Column {
  readonly table?: string
  readonly name: string
  readonly symbol: symbol
  readonly type: Type[] | Type | boolean

  constructor(table: string, name: string, symbol: symbol, type?: Type[] | Type | boolean)
  constructor(name: string, symbol: symbol, type?: Type[] | Type | boolean)
  constructor(...args: any[]) {
    switch (args.length) {
      case 2:
        this.name = args[0]
        this.symbol = args[1]
        this.type = true
        break
      case 3:
        if (isSymbol(args[1])) {
          this.name = args[0]
          this.symbol = args[1]
          this.type = true
        }
        else {
          this.table = args[0]
          this.name = args[1]
          this.symbol = args[2]
        }
        break
      case 4:
        this.table = args[0]
        this.name = args[1]
        this.symbol = args[2]
        this.type = args[3]
        break
    }
  }

  get isPrereserved(): boolean {
    return !!this['prereserved']
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

  toString(): string {
    return this.table ? `${this.table}.${this.name}` : this.name
  }
}
