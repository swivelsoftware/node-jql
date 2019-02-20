import { Query } from '..'
import { CompiledQuery } from '..'
import { JQLError } from '../../../../utils/error'
import { Schema } from '../../../schema'
import { RealTable } from '../../../schema/table'
import { Transaction } from '../../../transaction'
import { CompiledUnknownExpression } from '../../expression/unknown'
import { ICompileSqlOptions } from '../../interface'
import { ITableOrSubquery } from './interface'

/**
 * expression `FROM ...`
 */
export class TableOrSubquery implements ITableOrSubquery {
  public schema?: string|Schema
  public table: string|Query
  public $as?: string

  constructor(json: ITableOrSubquery) {
    try {
      if (typeof json.table === 'string' && !json.schema) {
        this.table = json.table
      }
      else {
        if (!!json.$as) throw new JQLError(`Missing alias for ${this.table}`)
        this.schema = json.schema
        this.table = typeof json.table === 'string' ? json.table : new Query(json.table)
      }
      this.$as = json.$as
    }
    catch (e) {
      throw new JQLError('Fail to instantiate TableOrSubquery', e)
    }
  }

  public validate(tables: string[] = []): string[] {
    if (typeof this.table !== 'string') this.table.validate(tables)
    const table = this.$as ? this.$as : this.table as string
    if (tables.indexOf(table) > -1) throw new JQLError(`Ambiguous table '${table}'`)
    return [...tables, table]
  }

  // @override
  public toString(): string {
    return this.$as ? `\`${this.$as}\`` : `${this.schema ? `\`${this.schema}\`.` : ''}\`${this.table}\``
  }
}

/**
 * compiled `TableOrSubquery`
 */
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

  public register(unknowns: CompiledUnknownExpression[]) {
    if (this.table instanceof CompiledQuery) this.table.register(unknowns)
  }
}
