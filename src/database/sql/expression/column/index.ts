import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { BindedColumn } from '../../../schema/column'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, Expression } from '../interface'
import { IColumnExpression } from './interface'

/**
 * expression `$table.$column`
 */
export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname = 'ColumnExpression'
  public table?: string
  public name: string

  constructor(json: string|IColumnExpression) {
    super()
    if (typeof json === 'string') {
      json = { name: json }
    }
    this.table = json.table
    this.name = json.name
  }

  // @override
  public validate(tables: string[]) {
    if (this.table && tables.indexOf(this.table) === -1) {
      throw new JQLError(`Unknown table '${this.table}'`)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledColumnExpression {
    return new CompiledColumnExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(`${this.table ? `\`${this.table}\`.` : ''}\`${this.name}\``)
  }
}

/**
 * compiled `ColumnExpression`
 */
export class CompiledColumnExpression extends CompiledExpression {
  public readonly column: BindedColumn

  constructor(transaction: Transaction, options: ICompileSqlOptions<ColumnExpression>) {
    super(transaction, options)
    try {
      // wildcard column should be spread
      if (options.parent.name === '*') throw new JQLError(`Syntax error: Invalid use of wildcard operator`)

      // unknown columns
      if (!options.tables || !options.tables.length) throw new JQLError(`No tables specified for column '${options.parent.name}'`)

      // find column from resultset schema
      let column: BindedColumn|undefined
      if (options.resultsetSchema && !options.parent.table) {
        column = options.resultsetSchema.columns.find((column) => column.name === options.parent.name)
      }

      if (!column) {
        // find column from table
        if (options.parent.table) {
          const table = options.tables.find((table) => options.parent.table === table.name)
          if (!table) throw new JQLError(`Unknown table '${options.parent.table}'`)
          column = table.getColumn(options.parent.name)
          if (!column) throw new JQLError(`Unknown field '${options.parent.name}'`)
        }
        // find column from tables
        else {
          const tables = options.tables.filter((table) => !!table.getColumn(options.parent.name))
          if (!tables.length) throw new JQLError(`Unknown column '${options.parent.name}'`)
          if (tables.length > 1) throw new JQLError(`Ambiguous column '${options.parent.name}'`)
          column = tables[0].getColumn(options.parent.name)
        }
      }
      this.column = column
    }
    catch (e) {
      throw new JQLError('Fail to compile ColumnExpression', e)
    }
  }

  // @override
  public register() {
    // do nothing
  }

  // @override
  public evaluate(_transaction: Transaction, cursor: ICursor): any {
    return cursor.get(this.column.symbol)
  }

  // @override
  public toString(): string {
    return this.column.toString()
  }
}
