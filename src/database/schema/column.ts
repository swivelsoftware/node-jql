import moment = require('moment')
import { JQLError } from '../../utils/error'
import { IColumnOptions, Type } from './interface'
import { Table } from './table'

/**
 * metadata of a column
 */
export class Column implements IColumnOptions {
  public readonly name: string
  public readonly type: Type
  public readonly symbol: symbol

  // column options
  public readonly default: any
  public readonly nullable: boolean

  constructor(name: string, type: Type, options?: IColumnOptions)
  constructor(name: string, type: Type, symbol: symbol, options?: IColumnOptions)
  constructor(name: string, type: Type, ...args: any[]) {
    this.name = name
    this.type = type

    let symbol: symbol = Symbol(name), options: IColumnOptions = {}
    switch (args.length) {
      case 1:
        if (typeof args[0] === 'symbol') {
          symbol = args[0] || symbol
        }
        else {
          options = args[0]
        }
        break
      case 2:
        symbol = args[0] || symbol
        options = args[1]
        break
    }
    this.symbol = symbol

    // interpret ColumnOptions
    this.nullable = options.nullable || false
  }

  public validate(value: any) {
    if ((value === undefined || value === null) && !this.nullable) throw new JQLError(`Column '${this.name}' is not nullable but received undefined`)
    switch (this.type) {
      case 'any':
        // do nothing
        break
      case 'Date':
        if (!moment(value).isValid()) throw new JQLError(`Invalid date value '${value}' for column '${this.name}'`)
        break
      case 'string':
      case 'number':
      case 'boolean':
      case 'object':
      case 'symbol':
        const type = typeof value
        if (type !== this.type) throw new JQLError(`Column '${this.name}' expects '${this.type}' but received '${type}'`)
        break
    }
  }

  // @override
  public toString(): string {
    return `\`${this.name}\``
  }
}

/**
 * metadata of a column binded to `Table`
 */
export class BindedColumn extends Column {
  constructor(readonly table: Table, column: Column) {
    super(column.name, column.type, column.symbol, column)
  }

  // @override
  public toString(): string {
    return `\`${this.table.name}\`.\`${this.name}\``
  }
}

/**
 * metadata of an internal column
 * e.g. index column
 */
export class InternalColumn extends Column {
}

/**
 * metadata of an internal column binded to `Table`
 * e.g. index column
 */
export class BindedInternalColumn extends BindedColumn {
  constructor(readonly table: Table, column: InternalColumn) {
    super(table, column)
  }
}
