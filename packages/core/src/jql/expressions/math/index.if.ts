import { IExpression } from '../index.if'

/**
 * Supported operators
 */
export type MathOperator = '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV'

/**
 * {left} {operator} {right}
 */
export interface IMathExpression extends IExpression {
  /**
   * Left expression
   */
  left: IExpression

  /**
   * Operator
   */
  operator: MathOperator

  /**
   * Right expression
   */
  right: IExpression
}
