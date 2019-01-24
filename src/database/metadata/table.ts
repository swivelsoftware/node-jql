import { Column, Type } from "./column";
import { Metadata } from "./index";

export class Table {
  public readonly name: string
  private readonly metadata?: Metadata
  private readonly _columns: { [key: string]: Column } = {}
  private readonly _columnOrders: string[] = []

  constructor (name: string)
  constructor (metadata: Metadata, table: Table)
  constructor (...args: any[]) {
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
        this._columns = table._columns
        this._columnOrders = table._columnOrders
        break
    }

    this.name = name
    this.metadata = metadata
  }

  get columns (): Column[] {
    return this._columnOrders.map(name => this._columns[name])
  }

  addColumn (name: string, type: Type[] | Type | boolean = true): Table {
    if (this.metadata && this.metadata.checkColumn && this._columns[name]) throw new Error(`column '${name}' already exists in table '${this.name}'`)
    if (!this._columns[name]) {
      this._columns[name] = new Column(name, type)
      this._columnOrders.push(name)
    }
    return this
  }

  removeColumn (name: string): Column {
    const column = this._columns[name]
    if (this.metadata && this.metadata.checkColumn && !column) throw new Error(`column '${name}' not found in table '${this.name}'`)
    if (column) {
      delete this._columns[name]
      this._columnOrders.splice(this._columnOrders.indexOf(name), 1)
    }
    return column
  }

  validate (value: any): boolean {
    if (!this.metadata) throw new Error(`table '${this.name}' not yet binded to any database`)
    if (typeof value === 'object') throw new Error(`a table row must be a json object`)
    if (this.metadata.checkColumn || this.metadata.checkType) {
      for (const key of Object.keys(value)) {
        if (this.metadata.checkColumn && !this._columns[key]) {
          throw new Error(`column '${key}' not found`)
        }
        if (this.metadata.checkType) {
          try {
            this._columns[key].validate(value[key])
          }
          catch (e) {
            throw new Error(`invalid value '${JSON.stringify(value[key])}'. ${(e as Error).message}`)
          }
        }
      }
    }
    return true
  }
}