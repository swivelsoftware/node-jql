import { IConditionalExpression, IExpression } from '../index.if'

/**
 * {left} {$not} BETWEEN {start} AND {end}
 */
export interface IBetweenExpression extends IConditionalExpression {
  /**
   * Left expression
   */
  left?: IExpression

  /**
   * NOT flag
   */
  $not?: boolean

  /**
   * Start expression
   */
  start?: IExpression

  /**
   * End expression
   */
  end?: IExpression
}
