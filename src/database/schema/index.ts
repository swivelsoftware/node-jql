import { Database } from '..'
import { JQLError } from '../../utils/error'
import { Logger } from '../../utils/logger'
import { BindedTable, Table } from './table'

const logger = new Logger(__filename)

/**
 * metadata of a database
 */
export class Schema {
  private readonly tables: { [key in symbol]: BindedTable } = {}

  constructor(readonly database: Database, readonly name: string, readonly symbol: symbol = Symbol(name)) {
  }

  get tableCount(): number {
    return Object.getOwnPropertySymbols(this.tables).length
  }

  public getTable(name: string): BindedTable {
    const table = Object.getOwnPropertySymbols(this.tables)
      .map<BindedTable>((symbol) => this.tables[symbol])
      .find((table) => table.name === name)
    if (!table) throw new JQLError(`Table '${name}' not exists in schema '${this.name}'`)
    return table
  }

  public createTable(table: Table, ifNotExists?: boolean): Schema {
    try {
      this.getTable(table.name)
      if (ifNotExists) return this
      throw new JQLError(`Table '${table.name}' already exists in schema '${this.name}'`)
    }
    catch (e) { /* do nothing */ }
    if (!table.columns.length) throw new JQLError(`Empty table '${table.name}'`)
    table = new BindedTable(this, table)
    this.tables[table.symbol] = table
    logger.info(`CREATE TABLE ${ifNotExists ? 'IF NOT EXISTS ' : ''}\`${this.name}\`.\`${table.name}\``)
    return this
  }

  public dropTable(name: string, ifExists?: boolean): Table|undefined {
    try {
      const table = this.getTable(name)
      delete this.tables[table.symbol]
      logger.info(`DROP TABLE ${ifExists ? 'IF EXISTS ' : ''}\`${this.name}\`.\`${name}\``)

      // clone dropped table
      const table_ = new Table(table.name, table.symbol)
      for (const column of table_.columns) table_.addColumn(column, true)
      return table_
    }
    catch (e) {
      if (ifExists) return
      throw new JQLError(`Table '${name}' not exists in schema '${this.name}'`)
    }
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
