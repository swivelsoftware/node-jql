import { isSymbol } from 'util'
import { JQLError } from '../../utils/error'

export type Type = 'string' | 'number' | 'bigint' | 'boolean' | 'object'

/**
 * 1) column name must be unique within a table
 */
export class Column {
  public readonly table?: string
  public readonly name: string
  public readonly symbol: symbol
  public readonly type: Type[] | Type | boolean

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
    return this['prereserved'] === true
  }

  public validate(value?: any) {
    const type = typeof value
    if (type === 'symbol' || type === 'undefined' || type === 'function') throw new JQLError(`unserializable type '${type}'`)
    if (this.type !== true &&
      (typeof this.type === 'string' && typeof value !== this.type) ||
      (Array.isArray(this.type) && this.type.indexOf(type) === -1)
    ) {
      throw new JQLError(`column '${this.name}' expected '${JSON.stringify(this.type)}' but received '${type}'`)
    }
  }

  public toString(): string {
    return this.table ? `${this.table}.${this.name}` : this.name
  }
}
