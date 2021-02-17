import { JQL } from '..'
import { IConditionalExpression, IExpression } from './interface'

/**
 * Abstract expression class in JQL
 */
export abstract class Expression extends JQL implements IExpression {
  public readonly classname: string

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
