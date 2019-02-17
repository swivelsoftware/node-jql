import { JQLError } from '../../../utils/error'
import { RealTable, Schema } from '../../schema'
import { Transaction } from '../../transaction'
import { ICompileSqlOptions } from './base'
import { CompiledQuery, IQuery, Query } from './core'

export interface ITableOrSubquery {
  table: string|IQuery
  $as?: string
}

export class TableOrSubquery implements ITableOrSubquery {
  public schema?: string|Schema
  public table: string|Query
  public $as?: string

  constructor(json: ITableOrSubquery) {
    try {
      if (typeof json.table !== 'string' && !json.$as) throw new JQLError('Missing alias')
      this.table = typeof json.table === 'string' ? json.table : new Query(json.table)
      this.$as = json.$as
    }
    catch (e) {
      throw new JQLError('Fail to instantiate TableOrSubquery', e)
    }
  }
}

export class CompiledTableOrSubquery {
  public readonly schema?: string|Schema
  public readonly table: string|CompiledQuery
  public readonly $as?: string
  public readonly compiledSchema: RealTable

  constructor(transaction: Transaction, options: ICompileSqlOptions<TableOrSubquery>) {
    try {
      this.schema = options.parent.schema || options.defaultSchema
      this.table = options.parent.table instanceof Query ? options.parent.table.compile(transaction) : options.parent.table
      this.$as = options.parent.$as
      this.compiledSchema = transaction.getTable(this.table, this.$as, this.schema)
    }
    catch (e) {
      throw new JQLError('Fail to compile TableOrSubquery', e)
    }
  }
}
