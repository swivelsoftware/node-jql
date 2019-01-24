import { Table } from "./table";
import { DatabaseOptions } from "database/options";
import { createReadonly } from "utils/createReadonly";

export class Metadata {
  public readonly options: DatabaseOptions
  private readonly _tables: { [key: string]: Table } = {}

  constructor (options: DatabaseOptions = {}) {
    this.options = createReadonly(options)
  }

  get tables (): Table[] {
    return Object.keys(this._tables).map(table => this._tables[table])
  }

  get checkTable (): boolean {
    return this.options.check && this.options.check.table ? true : false
  }

  get checkColumn (): boolean {
    return this.options.check && this.options.check.column ? true : false
  }

  get checkType (): boolean {
    return this.options.check && this.options.check.type ? true : false
  }

  table (name: string): Table {
    const table = this._tables[name]
    if (this.checkTable && !table) throw new Error(`table '${name}' not found`)
    return table
  }

  registerTable (name: string, table: Table): Metadata {
    if (this.checkTable && this._tables[name]) throw new Error(`table '${name}' already exists`)
    if (!this._tables[name]) this._tables[name] = new Table(this, table)
    return this
  }

  unregisterTable (name: string): Table {
    const table = this._tables[name]
    if (this.checkTable && !table) throw new Error(`table '${name}' not found`)
    if (table) delete this._tables[name]
    return table
  }
}