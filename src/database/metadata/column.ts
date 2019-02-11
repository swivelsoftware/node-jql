import moment = require('moment')
import { isSymbol } from 'util'
import { JQLError } from '../../utils/error'

export type Type = 'string'|'number'|'bigint'|'boolean'|'object'|'Date'|true

/**
 * 1) column name must be unique within a table
 */
export class Column {
  public readonly table?: string
  public readonly name: string
  public readonly symbol: symbol
  public readonly type: Type

  constructor(table: string, name: string, symbol: symbol, type?: Type)
  constructor(name: string, symbol: symbol, type?: Type)
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
          this.type = args[2]
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

  public validate(value?: any) {
    const type = typeof value
    if (type === 'symbol' || type === 'undefined' || type === 'function') throw new JQLError(`unserializable type '${type}'`)
    if (this.type === true) return
    switch (this.type) {
      case 'Date':
        const moment_ = moment(value)
        if (!moment_.isValid()) throw new JQLError(`invalid datetime format '${value}'`)
        break
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
      case 'object':
        if (this.type === type) break
      default:
        throw new JQLError(`column '${this.name}' expected '${JSON.stringify(this.type)}' but received '${type}'`)
    }
  }

  public toString(): string {
    return this.table ? `${this.table}.${this.name}` : this.name
  }
}
