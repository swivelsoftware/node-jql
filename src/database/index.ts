import _ = require('lodash')
import { Metadata } from './metadata/index'
import { Table } from './metadata/table'
import { IDatabaseOptions } from './options'
import { Sandbox } from './sandbox/index'
import { ResultSet } from './sandbox/resultset'
import { Sql } from './sql/index'

export type IDatabase = any

export class Database {
  public readonly metadata: Metadata
  public readonly database: IDatabase = {}

  constructor(options?: IDatabaseOptions) {
    this.metadata = new Metadata(this, options)
  }

  public createTable(table: Table): Database {
    table = this.metadata.registerTable(table.name, table)
    this.database[table.symbol] = []
    return this
  }

  public dropTable(name: string): Database {
    const table = this.metadata.unregisterTable(name)
    delete this.database[table.symbol]
    return this
  }

  public count(name: string): number {
    const table = this.metadata.table(name)
    return table ? this.database[table.symbol].length : 0
  }

  public query<T>(sql: Sql, sandbox: Sandbox = new Sandbox(this)): ResultSet<T> {
    return sandbox.run(sql)
  }

  public insert(name: string, ...rows: any[]) {
    const table = this.metadata.table(name)
    for (let i = 0, length = rows.length; i < length; i += 1) {
      const row = rows[i]
      try {
        if (table) table.validate(row)
      } catch (e) {
        throw new Error(`fail to insert row '${JSON.stringify(row)}'. ${(e as Error).stack}`)
      }
    }
    if (!this.database[table.symbol]) this.database[table.symbol] = []
    this.database[table.symbol].push(...rows)
  }
}
