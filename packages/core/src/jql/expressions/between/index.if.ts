import { IConditionalExpression, IExpression } from '../index.if'

/**
 * {left} {$not} BETWEEN {start} AND {end}
 */
export interface IBetweenExpression extends IConditionalExpression {
  left?: IExpression
  $not?: boolean
  start?: IExpression
  end?: IExpression
}
