import { RealTable, Schema } from '../../schema'
import { Transaction } from '../../transaction'

export interface ICompileOptions {
  defaultSchema?: Schema
  tables?: RealTable[]
  $as?: string
}

export interface ICompileSqlOptions<T> extends ICompileOptions {
  parent: T
}

export abstract class Sql {
  public abstract compile(transaction: Transaction, options?: ICompileOptions): CompiledSql
}

export abstract class CompiledSql extends Sql {
  constructor(protected readonly transaction: Transaction, protected readonly options: ICompileSqlOptions<Sql>) {
    super()
  }

  // @override
  public compile(transaction: Transaction): CompiledSql {
    return this.transaction === transaction && this.transaction.id === transaction.id ? this : this.options.parent.compile(transaction, this.options)
  }
}
