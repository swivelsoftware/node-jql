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
  public readonly database: IDatabase

  constructor(options?: IDatabaseOptions)
  constructor(initialState?: IDatabase, options?: IDatabaseOptions)
  constructor(...args: any[]) {
    let initialState: IDatabase = {}, options: IDatabaseOptions
    switch (args.length) {
      case 1:
        options = args[0]
        break
      case 2:
      default:
        initialState = args[0]
        options = args[1]
        break
    }
    this.database = initialState ? _.cloneDeep(initialState) : {}
    this.metadata = new Metadata(this, options)
  }

  public createTable(name: string, table: Table): Database {
    table = this.metadata.registerTable(name, table)
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

  public query<T>(sql: Sql, sandbox: Sandbox = new Sandbox(this)): ResultSet<T>|undefined {
    return sandbox.run(sql)
  }

  public insert(name: string, ...rows: any[]) {
    for (let i = 0, length = rows.length; i < length; i += 1) {
      const row = rows[i]
      try {
        const table = this.metadata.table(name)
        if (table) table.validate(row)
        if (!this.database[table.symbol]) this.database[table.symbol] = []
        this.database[table.symbol].push(...rows)
      } catch (e) {
        throw new Error(`fail to insert row '${JSON.stringify(row)}'. ${(e as Error).message}`)
      }
    }
  }
}
