import { Column, Type } from './column'
import { Metadata } from './index'

export class Table {
  public readonly name: string
  private readonly metadata?: Metadata
  private readonly columns_: { [key: string]: Column } = {}
  private readonly columnOrders_: string[] = []

  constructor(name: string)
  constructor(metadata: Metadata, table: Table)
  constructor(...args: any[]) {
    let name: string, metadata: Metadata | undefined
    switch (args.length) {
      case 1:
        name = args[0]
        break
      default:
      case 2:
        metadata = args[0]
        const table = args[1]
        name = table.name
        this.columns_ = table._columns
        this.columnOrders_ = table._columnOrders
        break
    }

    this.name = name
    this.metadata = metadata
  }

  get columns(): Column[] {
    return this.columnOrders_.map((name) => this.columns_[name])
  }

  public addColumn(name: string, type: Type[] | Type | boolean = true): Table {
    if (this.metadata && this.metadata.checkColumn && this.columns_[name]) { throw new Error(`column '${name}' already exists in table '${this.name}'`) }
    if (!this.columns_[name]) {
      this.columns_[name] = new Column(name, type)
      this.columnOrders_.push(name)
    }
    return this
  }

  public removeColumn(name: string): Column {
    const column = this.columns_[name]
    if (this.metadata && this.metadata.checkColumn && !column) { throw new Error(`column '${name}' not found in table '${this.name}'`) }
    if (column) {
      delete this.columns_[name]
      this.columnOrders_.splice(this.columnOrders_.indexOf(name), 1)
    }
    return column
  }

  public validate(value: any): boolean {
    if (!this.metadata) { throw new Error(`table '${this.name}' not yet binded to any database`) }
    if (typeof value === 'object') { throw new Error(`a table row must be a json object`) }
    if (this.metadata.checkColumn || this.metadata.checkType) {
      for (const key of Object.keys(value)) {
        if (this.metadata.checkColumn && !this.columns_[key]) {
          throw new Error(`column '${key}' not found`)
        }
        if (this.metadata.checkType) {
          try {
            this.columns_[key].validate(value[key])
          } catch (e) {
            throw new Error(`invalid value '${JSON.stringify(value[key])}'. ${(e as Error).message}`)
          }
        }
      }
    }
    return true
  }
}
