import squel = require('squel')
import { Schema } from '../schema'
import { RealTable, TemporaryTable } from '../schema/table'
import { Transaction } from '../transaction'
import { CompiledUnknownExpression } from './expression/unknown'

export interface ICompileOptions {
  // the schema used if not defined
  defaultSchema?: Schema

  // the tables involved
  tables?: RealTable[]

  // the resultset schema
  resultsetSchema?: TemporaryTable

  // the name used after compilation
  $as?: string
}

export abstract class Sql {
  // bind query to database, and check query context
  public abstract compile(transaction: Transaction, options?: ICompileOptions): CompiledSql

  // check query syntax
  public abstract validate(tables: string[])

  // standardized query string
  public abstract toSquel(): squel.BaseBuilder

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }
}

export interface ICompileSqlOptions<T> extends ICompileOptions {
  // the instance before compilation
  parent: T
}

export abstract class CompiledSql extends Sql {
  constructor(protected readonly transaction: Transaction, protected readonly options: ICompileSqlOptions<Sql>) {
    super()
  }

  // register unknowns
  public abstract register(unknowns: CompiledUnknownExpression[])

  // @override
  public validate() {
    // do nothing
  }

  // @override
  public compile(transaction: Transaction): CompiledSql {
    return this.transaction === transaction && this.transaction.id === transaction.id ? this : this.options.parent.compile(transaction, this.options)
  }

  // @override
  public toSquel(): squel.BaseBuilder {
    return this.options.parent.toSquel()
  }
}
