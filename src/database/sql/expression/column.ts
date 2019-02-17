import { JQLError } from '../../../utils/error'
import { Column } from '../../schema'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression } from './core'

export interface IColumnExpression {
  table?: string
  name: string
}

export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname: string = 'ColumnExpression'
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
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledColumnExpression {
    return new CompiledColumnExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledColumnExpression extends CompiledExpression {
  public readonly column: Column

  constructor(transaction: Transaction, options: ICompileSqlOptions<ColumnExpression>) {
    super(transaction, options)
    try {
      if (options.parent.name === '*') throw new JQLError(`Syntax error: Invalid use of wildcard operator`)
      if (!options.tables || !options.tables.length) throw new JQLError(`No tables specified for column '${options.parent.name}'`)
      if (options.parent.table) {
        const table = options.tables.find((table) => options.parent.table === table.name)
        if (!table) throw new JQLError(`Unknown table '${options.parent.table}'`)
        const column = table.getColumn(options.parent.name)
        if (!column) throw new JQLError(`Unknown field '${options.parent.name}'`)
        this.column = column
      }
      else {
        const tables = options.tables.filter((table) => !!table.getColumn(options.parent.name))
        if (!tables.length) throw new JQLError(`Unknown column '${options.parent.name}'`)
        if (tables.length > 1) throw new JQLError(`Ambiguous column '${options.parent.name}'`)
        this.column = tables[0].getColumn(options.parent.name)
      }
    }
    catch (e) {
      throw new JQLError('Fail to compile ColumnExpression', e)
    }
  }
}
