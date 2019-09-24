import { JQL } from '..'
import { Type } from '../index.if'
import { IConditionalExpression, IExpression } from './index.if'

/**
 * Base JQL expression class
 */
export abstract class Expression extends JQL implements IExpression {
  /**
   * Return type of the expression
   */
  public readonly returnType: Type
}

/**
 * Base JQL expression class (returns true or false)
 */
export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  // @override
  public readonly returnType: Type = 'boolean'

  // @override
  public abstract toJson(): IConditionalExpression
}
