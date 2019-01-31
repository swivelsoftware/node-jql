import { Database } from '..'
import { createReadonly } from '../../utils/createReadonly'
import { JQLError } from '../../utils/error'
import { IDatabaseOptions } from '../options'
import { Table } from './table'

export class Metadata {
  public readonly options: IDatabaseOptions
  private readonly tables_: { [key in string]: Table } = {}

  constructor(readonly database: Database, options: IDatabaseOptions = {}) {
    this.options = createReadonly(options)
  }

  get tables(): Table[] {
    return Object.keys(this.tables_).map((table) => this.tables_[table])
  }

  get checkTable(): boolean {
    return !this.options.skip || !this.options.skip.checkTable ? true : false
  }

  get checkColumn(): boolean {
    return !this.options.skip || !this.options.skip.checkColumn ? true : false
  }

  get checkType(): boolean {
    return !this.options.skip || !this.options.skip.checkType ? true : false
  }

  get checkOverridable(): boolean {
    return !this.options.skip || !this.options.skip.checkOverridable ? true : false
  }

  public table(name: string): Table {
    const table = this.tables_[name]
    if (this.checkTable && !table) throw new JQLError(`table '${name}' not exists`)
    return table
  }

  public registerTable(name: string, table: Table): Table {
    if (this.checkTable && this.tables_[name]) throw new JQLError(`table '${name}' already exists`)
    table = this.tables_[name] || (this.tables_[name] = new Table(this, table))
    return table
  }

  public unregisterTable(name: string): Table {
    const table = this.tables_[name]
    if (this.checkTable && !table) throw new JQLError(`table '${name}' not exists`)
    if (table) delete this.tables_[name]
    return table
  }
}
