import { Transaction } from '../../transaction'
import { CompiledSql, ICompileOptions, Sql } from '../query/base'

export interface IExpression {
  classname: string
}

// expression which returns boolean
export interface IConditionalExpression extends IExpression {
}

export abstract class Expression extends Sql implements IExpression {
  public readonly classname: string = 'Expression'

  public abstract compile(transaction: Transaction, options?: ICompileOptions): CompiledExpression
}

export abstract class CompiledExpression extends CompiledSql {
}
