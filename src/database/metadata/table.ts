import { isSymbol } from 'util'
import { Metadata } from '.'
import { createReadonly } from '../../utils/createReadonly'
import { JQLError } from '../../utils/error'
import { Column, Type } from './column'
import { normalize } from '../../utils/normalize';

/**
 * 1) table name must be unique within a database
 */
export class Table {
  public readonly name: string
  public readonly symbol: symbol
  protected readonly metadata?: Metadata
  protected readonly columns_: Column[] = []

  constructor(name: string, table?: Table, symbol?: symbol)
  constructor(name: string, symbol?: symbol)
  constructor(metadata: Metadata, table: Table, symbol?: symbol)
  constructor(...args: any[]) {
    let name: string, metadata: Metadata|undefined, symbol: symbol
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
    if (!this.columns_.find((column) => column.name === 'index')) this.addPrereservedColumn('index', 'number')
  }

  get columns(): Column[] {
    return createReadonly(this.columns_)
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
    if (this.columns_.find((column) => column.name === name)) throw new JQLError(`column \`${this.name}\`.\`${name}\` already exists`)
    this.columns_.push(new Column(this.name, name, symbol, type))
    return this
  }

  public removeColumn(name: string): Column|undefined {
    const index = this.columns_.findIndex((column) => column.name === name)
    if (index === -1) throw new JQLError(`unknown column \`${this.name}\`.\`${name}\``)
    const column = this.columns_[index]
    if (column['prereserved']) throw new JQLError(`you cannot remove prereserved column '${name}'`)
    this.columns_.splice(index, 1)
    return column
  }

  public validate(value: any) {
    if (!this.metadata) throw new JQLError(`table '${this.name}' not yet binded to any database`)
    if (typeof value !== 'object') throw new JQLError(`a table row must be a json object`)
    for (const key of Object.keys(value)) {
      const column = this.columns_.find((column) => column.name === key)
      if (!column) {
        throw new JQLError(`unknown column \`${this.name}\`.\`${key}\``)
      }
      try {
        column.validate(value[key])
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
      const column = this.columns_.find((column) => column.name === key)
      if (!column) {
        throw new JQLError(`unknown column \`${this.name}\`.\`${key}\``)
      }
      value[key] = normalize(column.type, value[key])
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
    const column = new Column(this.name, name, symbol, type)
    column['prereserved'] = true
    this.columns_.push(column)
  }
}
