import { createReadonly } from '../../utils/createReadonly'
import { IDatabaseOptions } from '../options'
import { Table } from './table'

export class Metadata {
  public readonly options: IDatabaseOptions
  private readonly tables_: { [key: string]: Table } = {}

  constructor(options: IDatabaseOptions = {}) {
    this.options = createReadonly(options)
  }

  get tables(): Table[] {
    return Object.keys(this.tables_).map((table) => this.tables_[table])
  }

  get checkTable(): boolean {
    return this.options.check && this.options.check.table ? true : false
  }

  get checkColumn(): boolean {
    return this.options.check && this.options.check.column ? true : false
  }

  get checkType(): boolean {
    return this.options.check && this.options.check.type ? true : false
  }

  public table(name: string): Table {
    const table = this.tables_[name]
    if (this.checkTable && !table) { throw new Error(`table '${name}' not found`) }
    return table
  }

  public registerTable(name: string, table: Table): Metadata {
    if (this.checkTable && this.tables_[name]) { throw new Error(`table '${name}' already exists`) }
    if (!this.tables_[name]) { this.tables_[name] = new Table(this, table) }
    return this
  }

  public unregisterTable(name: string): Table {
    const table = this.tables_[name]
    if (this.checkTable && !table) { throw new Error(`table '${name}' not found`) }
    if (table) { delete this.tables_[name] }
    return table
  }
}
