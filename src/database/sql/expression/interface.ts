import squel = require('squel')
import { ICursor } from '../../cursor/interface'
import { Transaction } from '../../transaction'
import { CompiledSql, ICompileOptions, ICompileSqlOptions, Sql } from '../interface'

// part of a sql that will return a value
export interface IExpression {
  classname: string
}
export abstract class Expression extends Sql implements IExpression {
  public readonly classname: string = 'Expression'

  public abstract compile(transaction: Transaction, options?: ICompileOptions): CompiledExpression
}

// part of a sql that will return a boolean value
export interface IConditionalExpression {
}
export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  public abstract toSquel(): squel.Expression
}

// part of a sql that returns a value
export abstract class CompiledExpression extends CompiledSql {
  constructor(protected readonly transaction: Transaction, protected readonly options: ICompileSqlOptions<Sql>) {
    super(transaction, options)
  }

  public abstract evaluate(transaction: Transaction, cursor: ICursor): any
}
