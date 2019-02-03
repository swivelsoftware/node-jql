import { isSymbol } from 'util'
import { Metadata } from '.'
import { JQLError } from '../../utils/error'
import { Column, Type } from './column'

/**
 * 1) table name must be unique within a database
 */
export class Table {
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

  get columns(): Column[] {
    return this.columnOrders_.map((column) => this.columns_[column])
  }

  get count(): number {
    if (!this.metadata) throw new JQLError(`table '${this.name}' not yet binded to any database`)
    return this.metadata.database.count(this.name)
  }

  public addColumn(column: Column): Table
  public addColumn(name: string, type: Type, symbol?: symbol): Table
  public addColumn(...args: any[]): Table {
    let name: string, type: Type, symbol: symbol
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
    if (this.columns_[name]) throw new JQLError(`column \`${this.name}\`.\`${name}\` already exists`)
    this.columns_[name] = new Column(name, symbol, type)
    this.columnOrders_.push(name)
    return this
  }

  public removeColumn(name: string): Column | undefined {
    const column = this.columns_[name]
    if (!column) throw new JQLError(`unknown column \`${this.name}\`.\`${name}\``)
    if (column['isPrereserved']) throw new JQLError(`you cannot remove prereserved column '${name}'`)
    delete this.columns_[name]
    this.columnOrders_.splice(this.columnOrders_.indexOf(name), 1)
    return column
  }

  public validate(value: any) {
    if (!this.metadata) throw new JQLError(`table '${this.name}' not yet binded to any database`)
    if (typeof value !== 'object') throw new JQLError(`a table row must be a json object`)
    for (const key of Object.keys(value)) {
      if (!this.columns_[key]) {
        throw new JQLError(`unknown column \`${this.name}\`.\`${key}\``)
      }
      try {
        this.columns_[key].validate(value[key])
      }
      catch (e) {
        throw new JQLError(`invalid column value '${JSON.stringify(value[key])}'`, e)
      }
    }
  }

  public normalize(value: any): any {
    if (!this.metadata) throw new JQLError(`table '${this.name}' not yet binded to any database`)
    if (typeof value !== 'object') throw new JQLError(`a table row must be a json object`)
    value = { ...value }
    for (const key of Object.keys(value)) {
      if (!this.columns_[key]) {
        throw new JQLError(`unknown column \`${this.name}\`.\`${key}\``)
      }
      value[key] = this.columns_[key].normalize(value[key])
    }
    return value
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

  private addPrereservedColumn(name: string, type: Type, symbol: symbol = Symbol(name)) {
    const column = this.columns_[name] = new Column(name, symbol, type)
    column['prereserved'] = true
    this.columnOrders_.push(name)
  }
}
