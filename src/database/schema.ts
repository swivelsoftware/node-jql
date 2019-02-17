import moment = require('moment')
import { isSymbol } from 'util'
import { JQLError } from '../utils/error'
import { Logger } from '../utils/logger'
import { Database } from './core'
import { ResultSet } from './cursor/resultset'
import { Sandbox } from './sandbox'
import { Transaction } from './transaction'

const logger = new Logger(__filename)

// value types supported
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

// metadata for database
export class Schema {
  private readonly tables: { [key in symbol]: BindedTable } = {}

  constructor(readonly database: Database, readonly name: string, readonly symbol: symbol = Symbol(name)) {
  }

  public getTable(name: string): BindedTable {
    const table = Object.getOwnPropertySymbols(this.tables)
      .map<BindedTable>((symbol) => this.tables[symbol])
      .find((table) => table.name === name)
    if (!table) throw new JQLError(`Table '${name}' not exists in schema '${this.name}'`)
    return table
  }

  public createTable(table: Table): Schema {
    if (this.getTable(table.name)) throw new JQLError(`Table '${table.name}' already exists in schema '${this.name}'`)
    table = new BindedTable(this, table)
    this.tables[table.symbol] = table
    logger.info(`Schema.createTable(${table.name})`)
    return this
  }

  public dropTable(name: string): Table {
    const table = this.getTable(name)
    delete this.tables[table.symbol]
    logger.info(`Schema.dropTable(${table.name})`)

    const table_ = new Table(table.name, table.symbol)
    for (const column of table_.columns) table_.addColumn(column)
    return table_
  }

  public clone(): Schema {
    const schema = new Schema(this.database, this.name, this.symbol)
    for (const symbol of Object.getOwnPropertySymbols(this.tables)) {
      const table = this.tables[symbol]
      schema.createTable(table)
    }
    return schema
  }
}

// metadata for table
export class Table {
  private readonly columns_: { [key in symbol]: BindedColumn } = {}
  private readonly columnsOrder: symbol[] = []

  constructor(readonly name: string, readonly symbol: symbol = Symbol(name)) {
  }

  get columns(): BindedColumn[] {
    return this.columnsOrder.map((symbol) => this.columns_[symbol])
  }

  public getColumn(name: string, options: { skipInternal?: boolean } = {}): BindedColumn {
    const column = Object.getOwnPropertySymbols(this.columns_)
      .map<BindedColumn>((symbol) => this.columns_[symbol])
      .find((column) => column.name === name)
    if (!column || (options.skipInternal && column instanceof InternalColumn)) throw new JQLError(`Column '${name}' not exists in table '${this.name}'`)
    return column
  }

  public addColumn(column: Column): Table {
    if (this.columns.find((column_) => column_.name === column.name)) throw new JQLError(`Column '${column.name}' already exists in table '${this.name}'`)
    column = new BindedColumn(this, column)
    this.columns_[column.symbol] = column
    this.columnsOrder.push(column.symbol)

    // internal < normal
    this.columnsOrder.sort((l, r) => {
      if (this.columns_[l] instanceof InternalColumn && !(this.columns_[r] instanceof InternalColumn)) {
        return -1
      }
      else if (!(this.columns_[l] instanceof InternalColumn) && this.columns_[r] instanceof InternalColumn) {
        return 1
      }
      else {
        return this.columnsOrder.indexOf(l) - this.columnsOrder.indexOf(r)
      }
    })

    logger.info(`Table.addColumn(${column.name})`)
    return this
  }

  public removeColumn(name: string): Column {
    const column = this.getColumn(name, { skipInternal: true })
    delete this.columns_[column.symbol]
    this.columnsOrder.splice(this.columnsOrder.indexOf(column.symbol), 1)
    logger.info(`Table.removeColumn(${column.name})`)

    return new Column(column.name, column.type, column.symbol, column)
  }

  public merge(...tables: Table[]): Table
  public merge(newName: string, ...tables: Table[]): Table
  public merge(...args: any[]): Table {
    let newName: string|undefined, tables: Table[]
    if (typeof args[0] === 'string') {
      const [newName_, ...tables_] = args
      newName = newName_
      tables = tables_
    }
    else {
      tables = args
    }

    if (!newName) {
      newName = tables.reduce<string>((result, table) => {
        return result + '+' + table.name
      }, this.name)
    }

    const table = this.clone(newName)
    for (const table of tables) for (const column of table.columns) table.addColumn(column)
    return table
  }

  public clone(newName?: string): Table {
    const name = newName || this.name
    const table = new Table(name, this.symbol)
    for (const column of this.columns) table.addColumn(column)
    return table
  }
}

export interface IRealTable {
  count: number
  getRow(transaction: Transaction, index: number): { [key in symbol]: any }
}

export type RealTable = BindedTable|TemporaryTable

export class TemporaryTable extends Table implements IRealTable {
  constructor(private readonly transaction: Transaction, table: Table) {
    super(table.name, table.symbol)
    this.addColumn(new InternalColumn('__index', 'number'))
    for (const column of table.columns) this.addColumn(column)
  }

  // @override
  get count(): number {
    const variable = this.transaction.getVariable(this.name)
    if (!(variable instanceof ResultSet)) throw new JQLError(`Variable '${this.name}' is not a temporary ResultSet`)
    return variable.length
  }

  // @override
  public getRow(transaction: Transaction = this.transaction, index: number): { [key in symbol]: any } {
    const variable = transaction.getVariable(this.name)
    if (!(variable instanceof ResultSet)) throw new JQLError(`Variable '${this.name}' is not a temporary ResultSet`)
    return variable[index]
  }
}

// metadata for table binded to a schema
export class BindedTable extends Table implements IRealTable {
  constructor(readonly schema: Schema, table: Table) {
    super(table.name, table.symbol)
    this.addColumn(new InternalColumn('__index', 'number'))
    for (const column of table.columns) this.addColumn(column)
  }

  // @override
  get count(): number {
    return this.schema.database.getContext(this.schema.name)[this.symbol].length
  }

  // @override
  public getRow(transaction: Transaction, index: number): { [key in symbol]: any } {
    return transaction.getContext(this.schema.name)[this.symbol][index]
  }

  public validate(row: { [key in string]: any }): { [key in symbol]: any } {
    return Object.keys(row).reduce<{ [key in symbol]: any }>((result, key) => {
      const column = this.getColumn(key)
      if (column) {
        try {
          column.validate(row[key])
          result[column.symbol] = row[key]
        }
        catch (e) {
          throw new JQLError(`Invalid value '${JSON.stringify(row[key])}'`, e)
        }
      }
      else {
        logger.debug(`BindedTable.validate(): Unknown column '${key}'`)
      }
      return result
    }, {})
  }

  // @override
  public clone(newName?: string): BindedTable {
    return new BindedTable(this.schema, super.clone(newName))
  }
}

// options for column
export interface IColumnOptions {
  nullable?: boolean
}

// metadata for column
export class Column implements IColumnOptions {
  public readonly name: string
  public readonly type: Type
  public readonly symbol: symbol
  public readonly nullable: boolean

  constructor(name: string, type: Type, options?: IColumnOptions)
  constructor(name: string, type: Type, symbol: symbol, options?: IColumnOptions)
  constructor(name: string, type: Type, ...args: any[]) {
    this.name = name
    this.type = type

    let symbol: symbol = Symbol(this.toString()), options: IColumnOptions = {}
    switch (args.length) {
      case 1:
        if (isSymbol(args[0])) {
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
      default:
        const type = typeof value
        if (type !== this.type) throw new JQLError(`Column '${this.name}' expects '${this.type}' but received '${type}'`)
        break
    }
  }

  // @override
  public toString(): string {
    return this.name
  }
}

// metadata for column binded to a table
export class BindedColumn extends Column {
  constructor(readonly table: Table, column: Column) {
    super(column.name, column.type, column.symbol, column)
  }

  // @override
  public toString(): string {
    return `\`${this.table.name}\`.\`${this.name}\``
  }
}

// metadata for internal columns
// e.g. index column
export class InternalColumn extends Column {
}
