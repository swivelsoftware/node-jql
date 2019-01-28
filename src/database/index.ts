import _ = require('lodash')
import { Metadata } from './metadata/index'
import { Table } from './metadata/table'
import { IDatabaseOptions } from './options'
import { Sql } from './sql/index'

export interface IDatabase { [key: string]: any[] }

export class Database {
  public readonly metadata: Metadata
  private readonly database: IDatabase

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
    this.metadata = new Metadata(options)
  }

  public createTable(name: string, table: Table): Database {
    this.metadata.registerTable(name, table)
    this.database[name] = []
    return this
  }

  public dropTable(name: string): Database {
    this.metadata.unregisterTable(name)
    delete this.database[name]
    return this
  }

  public query<T>(sql: Sql): T|undefined {
    // TODO
    return undefined
  }

  public insert(name: string, ...rows: any[]) {
    for (let i = 0, length = rows.length; i < length; i += 1) {
      const row = rows[i]
      try {
        const table = this.metadata.table(name)
        if (table) { table.validate(row) }
        if (!this.database[name]) { this.database[name] = [] }
        this.database[name].push(...rows)
      } catch (e) {
        throw new Error(`fail to insert row '${JSON.stringify(row)}'. ${(e as Error).message}`)
      }
    }
  }
}
