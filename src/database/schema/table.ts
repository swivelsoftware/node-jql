import { Schema } from '.'
import { JQLError } from '../../utils/error'
import { Logger } from '../../utils/logger'
import { ResultSet } from '../cursor/resultset'
import { RawRow, Row } from '../interface'
import { Transaction } from '../transaction'
import { BindedColumn, BindedInternalColumn, Column, InternalColumn } from './column'

const logger = new Logger(__filename)

/**
 * metadata of a table
 */
export class Table {
  private readonly columns_: { [key in symbol]: BindedColumn } = {}
  private readonly columnsOrder: symbol[] = []

  constructor(readonly name: string, readonly symbol: symbol = Symbol(name)) {
  }

  get columns(): BindedColumn[] {
    return this.columnsOrder.map((symbol) => this.columns_[symbol])
  }

  public getColumn(name: string, options: { skipInternal?: boolean } = {}): BindedColumn {
    const column = this.columns.find((column) => column.name === name)
    if (!column || (options.skipInternal && column instanceof InternalColumn)) throw new JQLError(`Column '${name}' not exists in table '${this.name}'`)
    return column
  }

  public addColumn(column: Column, noLog?: boolean): Table {
    try {
      this.getColumn(column.name)
      throw new JQLError(`Column '${column.name}' already exists in table '${this.name}'`)
    }
    catch (e) { /* do nothing */ }
    column = column instanceof BindedInternalColumn || column instanceof InternalColumn
      ? new BindedInternalColumn(this, column)
      : new BindedColumn(this, column)
    this.columns_[column.symbol] = column
    this.columnsOrder.push(column.symbol)

    // internal < normal
    this.columnsOrder.sort((l, r) => {
      if (this.columns_[l] instanceof BindedInternalColumn && !(this.columns_[r] instanceof BindedInternalColumn)) {
        return -1
      }
      else if (!(this.columns_[l] instanceof BindedInternalColumn) && this.columns_[r] instanceof BindedInternalColumn) {
        return 1
      }
      else {
        return this.columnsOrder.indexOf(l) - this.columnsOrder.indexOf(r)
      }
    })

    if (!noLog) logger.info(`ALTER TABLE \`${this.name}\` ADD \`${column.name}\` ${column.type}`)
    return this
  }

  public removeColumn(name: string, noLog?: boolean): Column {
    const column = this.getColumn(name, { skipInternal: true })
    delete this.columns_[column.symbol]
    this.columnsOrder.splice(this.columnsOrder.indexOf(column.symbol), 1)
    if (!noLog) logger.info(`ALTER TABLE \`${this.name}\` DROP COLUMN \`${column.name}\``)

    return new Column(column.name, column.type, column.symbol, column)
  }

  public merge(...tables: Table[]): Table
  public merge(newName: string, ...tables: Table[]): Table
  public merge(...args: any[]): Table {
    let newName: string|undefined, tables: Table[]
    if (typeof args[0] === 'string') {
      const [newName_, ...tables_] = args
      newName = newName_
      tables = tables_
    }
    else {
      tables = args
    }

    if (!newName) {
      newName = tables.reduce<string>((result, table) => {
        return result + '+' + table.name
      }, this.name)
    }

    const table = this.clone(newName)
    for (const table_ of tables) for (const column of table_.columns) table.addColumn(column, true)
    return table
  }

  public clone(newName?: string): Table {
    const name = newName || this.name
    const table = new Table(name, this.symbol)
    for (const column of this.columns) table.addColumn(column, true)
    return table
  }
}

/**
 * corresponding to a binded table with
 * 1) `count` property
 * 2) `getRow()` function
 */
export type RealTable = TemporaryTable|BindedTable

/**
 * metadata of a temporary table binded to `Transaction`
 */
export class TemporaryTable extends Table {
  constructor(private readonly transaction: Transaction, table: Table) {
    super(table.name, table.symbol)
    for (const column of table.columns) this.addColumn(column, true)
  }

  // @override
  get count(): number {
    const variable = this.transaction.getVariable(this.name)
    if (!(variable instanceof ResultSet)) throw new JQLError(`Variable '${this.name}' is not a temporary ResultSet`)
    return variable.length
  }

  // @override
  public getRow(transaction: Transaction = this.transaction, index: number): Row {
    const variable = transaction.getVariable(this.name)
    if (!(variable instanceof ResultSet)) throw new JQLError(`Variable '${this.name}' is not a temporary ResultSet`)
    return variable[index]
  }
}

/**
 * metadata of a table binded to a database(`Schema`)
 */
export class BindedTable extends Table {
  constructor(readonly schema: Schema, table: Table) {
    super(table.name, table.symbol)
    if (!table.columns.find((column) => column instanceof BindedInternalColumn && column.name === '__index')) {
      this.addColumn(new InternalColumn('__index', 'number'), true)
    }
    for (const column of table.columns) this.addColumn(column, true)
  }

  // @override
  get count(): number {
    return this.schema.database.getContext(this.schema.name)[this.symbol].length
  }

  // @override
  public getRow(transaction: Transaction, index: number): Row {
    return transaction.getContext(this.schema.name)[this.symbol][index]
  }

  public validate(row: RawRow): Row {
    return Object.keys(row).reduce<Row>((result, key) => {
      const column = this.getColumn(key)
      if (column) {
        try {
          column.validate(row[key])
          result[column.symbol] = row[key]
        }
        catch (e) {
          throw new JQLError(`Invalid value '${JSON.stringify(row[key])}'`, e)
        }
      }
      else {
        logger.debug(`BindedTable.validate(): Unknown column '${key}'`)
      }
      return result
    }, {})
  }

  // @override
  public clone(newName?: string): BindedTable {
    return new BindedTable(this.schema, super.clone(newName))
  }
}
