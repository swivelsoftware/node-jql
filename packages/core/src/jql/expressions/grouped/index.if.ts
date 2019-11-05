import { IConditionalExpression } from '../index.if'

/**
 * {expr1} - {expr2} - ... - {exprN}
 */
export interface IGroupedExpressions extends IConditionalExpression {
  /**
   * Expressions
   */
  expressions: IConditionalExpression[]
}
