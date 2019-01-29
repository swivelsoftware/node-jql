import { Column, Type } from './column'
import { Metadata } from './index'

/**
 * 1) table name must be unique within a database
 */
export class Table {
  public readonly name: string
  public readonly symbol: symbol
  private readonly metadata?: Metadata
  private readonly columns_: { [key in string]: Column } = {}
  private readonly columnOrders_: string[] = []

  constructor(name: string, symbol?: symbol)
  constructor(metadata: Metadata, table: Table, symbol?: symbol)
  constructor(...args: any[]) {
    let name: string, metadata: Metadata | undefined, symbol: symbol
    switch (args.length) {
      case 1:
        name = args[0]
        symbol = args[1] || Symbol(name)
        break
      default:
      case 2:
        metadata = args[0]
        const table = args[1]
        name = table.name
        symbol = args[2] || Symbol(name)
        this.columns_ = table._columns
        this.columnOrders_ = table._columnOrders
        break
    }

    this.name = name
    this.symbol = symbol
    this.metadata = metadata
  }

  get columns(): Column[] {
    return this.columnOrders_.map((column) => this.columns_[column])
  }

  get count(): number {
    if (!this.metadata) throw new Error(`table '${this.name}' not yet binded to any database`)
    return this.metadata.database.count(this.name)
  }

  public addColumn(name: string, type: Type[] | Type | boolean = true, symbol?: symbol): Table {
    if (this.metadata && this.metadata.checkColumn && this.columns_[name]) throw new Error(`column '${name}' already exists in table '${this.name}'`)
    if (!this.columns_[name]) {
      this.columns_[name] = new Column(name, symbol || Symbol(`${this.name}.${name}`), type)
      this.columnOrders_.push(name)
    }
    return this
  }

  public removeColumn(name: string): Column | undefined {
    if (this.metadata && this.metadata.checkColumn && !this.columns_[name]) throw new Error(`column '${name}' not exists in table '${this.name}'`)
    if (this.columns_[name]) {
      delete this.columns_[name]
      this.columnOrders_.splice(this.columnOrders_.indexOf(name), 1)
    }
    return this.columns_[name]
  }

  public validate(value: any): boolean {
    if (!this.metadata) throw new Error(`table '${this.name}' not yet binded to any database`)
    if (typeof value === 'object') throw new Error(`a table row must be a json object`)
    if (this.metadata.checkColumn || this.metadata.checkType) {
      for (const key of Object.keys(value)) {
        if (this.metadata.checkColumn && !value[key]) {
          throw new Error(`column '${key}' not found`)
        }
        if (this.metadata.checkType) {
          try {
            this.columns_[key].validate(value[key])
          }
          catch (e) {
            throw new Error(`invalid value '${JSON.stringify(value[key])}'. ${(e as Error).message}`)
          }
        }
      }
    }
    return true
  }

  public clone(symbol?: symbol): Table {
    if (this.metadata) {
      return new Table(this.metadata, this, symbol)
    }
    else {
      return new Table(this.name, symbol)
    }
  }
}
