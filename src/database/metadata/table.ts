import { isSymbol } from 'util'
import { Column, Type } from './column'
import { Metadata } from './index'

/**
 * 1) table name must be unique within a database
 */
export class Table {

  get columns(): Column[] {
    return this.columnOrders_.map((column) => this.columns_[column])
  }

  get count(): number {
    if (!this.metadata) throw new Error(`table '${this.name}' not yet binded to any database`)
    return this.metadata.database.count(this.name)
  }
  public readonly name: string
  public readonly symbol: symbol
  protected readonly metadata?: Metadata
  protected readonly columns_: { [key in string]: Column } = {}
  protected readonly columnOrders_: string[] = []

  constructor(name: string, table?: Table, symbol?: symbol)
  constructor(name: string, symbol?: symbol)
  constructor(metadata: Metadata, table: Table, symbol?: symbol)
  constructor(...args: any[]) {
    let name: string, metadata: Metadata | undefined, symbol: symbol
    switch (args.length) {
      case 1:
        name = args[0]
        symbol = Symbol(name)
        break
      default:
      case 2:
        if (isSymbol(args[1])) {
          name = args[0]
          symbol = args[1] || Symbol(name)
        }
        else if (args[1] instanceof Table) {
          const table = args[1] as Table
          if (args[0] instanceof Metadata) {
            metadata = args[0]
            name = table.name
          }
          else {
            name = args[0]
          }
          symbol = args[2] || Symbol(name)
          this.columns_ = table.columns_
          this.columnOrders_ = table.columnOrders_
        }
        else {
          name = args[0]
          symbol = Symbol(name)
        }
        break
    }

    this.name = name
    this.symbol = symbol
    this.metadata = metadata

    // pre-reserved column
    if (!this.columns_['index']) this.addPrereservedColumn('index', 'number')
  }

  public addColumn(column: Column): Table
  public addColumn(name: string, type: Type[] | Type | boolean, symbol?: symbol): Table
  public addColumn(...args: any[]): Table {
    let name: string, type: Type[] | Type | boolean, symbol: symbol
    if (args.length === 1 && args[0] instanceof Column) {
      const column: Column = args[0]
      name = column.name
      type = column.type
      symbol = Symbol(name)
    }
    else {
      name = args[0]
      type = args[1] || true
      symbol = args[2] || Symbol(name)
    }
    if (this.metadata && this.metadata.checkColumn && this.columns_[name]) throw new Error(`column \`${this.name}\`.\`${name}\` already exists`)
    if (!this.columns_[name]) {
      this.columns_[name] = new Column(name, symbol, type)
      this.columnOrders_.push(name)
    }
    return this
  }

  public removeColumn(name: string): Column | undefined {
    if (this.metadata && this.metadata.checkColumn && !this.columns_[name]) throw new Error(`unknown column \`${this.name}\`.\`${name}\``)
    if (this.columns_[name].isPrereserved) throw new Error(`you cannot remove prereserved column '${name}'`)
    if (this.columns_[name]) {
      delete this.columns_[name]
      this.columnOrders_.splice(this.columnOrders_.indexOf(name), 1)
    }
    return this.columns_[name]
  }

  public validate(value: any): boolean {
    if (!this.metadata) throw new Error(`table '${this.name}' not yet binded to any database`)
    if (typeof value !== 'object') throw new Error(`a table row must be a json object`)
    if (this.metadata.checkColumn || this.metadata.checkType) {
      for (const key of Object.keys(value)) {
        if (this.metadata.checkColumn && !value[key]) {
          throw new Error(`unknown column \`${this.name}\`.\`${name}\``)
        }
        if (this.metadata.checkType) {
          try {
            this.columns_[key].validate(value[key])
          }
          catch (e) {
            throw new Error(`invalid column value '${JSON.stringify(value[key])}'. ${(e as Error).message}`)
          }
        }
      }
    }
    return true
  }

  public clone(name?: string): Table {
    const symbol = name ? Symbol(name) : this.symbol
    if (this.metadata) {
      return new Table(this.metadata, this, symbol)
    }
    else {
      return new Table(name || this.name, symbol)
    }
  }

  private addPrereservedColumn(name: string, type: Type[] | Type | boolean = true, symbol?: symbol) {
    const column = this.columns_[name] = new Column(name, symbol || Symbol(name), type)
    column['prereserved'] = true
    this.columnOrders_.push(name)
  }
}
