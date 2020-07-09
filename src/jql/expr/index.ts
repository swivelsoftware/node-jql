import squel from 'squel'
import { JQL } from '../../jql'
import { IConditionalExpression, IExpression } from './interface'

/**
 * Abstract expression class in JQL
 */
export abstract class Expression extends JQL implements IExpression {
  public readonly classname: string

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public abstract toJson(): IExpression
}

/**
 * Abstract JQL class for expression that returns boolean
 */
export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  // @override
  public abstract toJson(): IConditionalExpression
}
