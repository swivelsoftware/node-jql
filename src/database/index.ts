import _ = require('lodash')
import { JQLError } from '../utils/error'
import { Metadata } from './metadata'
import { Table } from './metadata/table'
import { IDatabaseOptions } from './options'
import { Sandbox } from './sandbox'
import { ResultSet } from './sandbox/resultset'
import { Sql } from './sql'

export type IDatabase = {
  [key in symbol]: any[]
}

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
    // table checked. no need to check again
    return table ? this.database[table.symbol].length : 0
  }

  public query<T>(sql: Sql): ResultSet<T> {
    return new Sandbox(this).run(sql)
  }

  public insert(name: string, ...rows: any[]) {
    const table = this.metadata.table(name)
    for (let i = 0, length = rows.length; i < length; i += 1) {
      const row = rows[i]
      try {
        table.validate(row)
        rows[i] = table.normalize(row)
      }
      catch (e) {
        throw new JQLError(`fail to insert row '${JSON.stringify(row)}'`, e)
      }
    }
    if (!this.database[table.symbol]) this.database[table.symbol] = []
    this.database[table.symbol].push(...rows)
  }
}
