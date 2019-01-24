import { Metadata } from "./metadata/index";
import { DatabaseOptions } from "./options";
import { Table } from "./metadata/table";
import _ = require("lodash");
import { Sql } from "./sql/index";
import { Transaction } from "./transaction";

export type DatabaseStructure = { [key: string]: any[] }

export class Database {
  public readonly metadata: Metadata
  private readonly database: DatabaseStructure

  constructor (options?: DatabaseOptions)
  constructor (initialState?: DatabaseStructure, options?: DatabaseOptions)
  constructor (...args: any[]) {
    let initialState: DatabaseStructure = {}, options: DatabaseOptions
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

  createTable (name: string, table: Table): Database {
    this.metadata.registerTable(name, table)
    this.database[name] = []
    return this
  }

  dropTable (name: string): Database {
    this.metadata.unregisterTable(name)
    delete this.database[name]
    return this
  }

  query<T> (...sql: Sql[]): T {
    const transaction = new Transaction(this)
    return transaction.run<T>(...sql)
  }

  insert (name: string, ...rows: any[]) {
    for (let i = 0, length = rows.length; i < length; i += 1) {
      const row = rows[i]
      try {
        const table = this.metadata.table(name)
        if (table) table.validate(row)
        if (!this.database[name]) this.database[name] = []
        this.database[name].push(...rows)
      }
      catch (e) {
        throw new Error(`fail to insert row '${JSON.stringify(row)}'. ${(e as Error).message}`)
      }
    }
  }
}