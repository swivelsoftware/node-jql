import { IConditionalExpression, IExpression } from '../index.if'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='|':='|'IN'|'IS'|'LIKE'|'REGEXP'

/**
 * {left} {$not} {operator} {right}
 */
export interface IBinaryExpression extends IConditionalExpression {
  /**
   * Left expression
   */
  left?: IExpression

  /**
   * Operator
   */
  operator: BinaryOperator

  /**
   * NOT flag
   */
  $not?: boolean

  /**
   * Right expression
   */
  right?: IExpression
}
