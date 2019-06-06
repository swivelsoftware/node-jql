import squel from 'squel'
import { Sql } from '../Sql'

export interface IExpression {
  classname?: string
  [key: string]: any
}

export abstract class Expression extends Sql implements IExpression {
  public readonly classname: string

  // @override
  get [Symbol.toStringTag]() {
    return 'Expression'
  }

  // @override
  public abstract toJson(): IExpression
}

export interface IConditionalExpression extends IExpression {
}

export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  // @override
  get [Symbol.toStringTag]() {
    return 'ConditionalExpression'
  }

  // @override
  public abstract toSquel(): squel.Expression

  // @override
  public abstract toJson(): IConditionalExpression
}
