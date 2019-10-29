import { IConditionalExpression, IExpression } from '../index.if'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='|':='|'IN'|'IS'|'LIKE'|'REGEXP'

/**
 * {left} {$not} {operator} {right}
 */
export interface IBinaryExpression extends IConditionalExpression {
  left?: IExpression
  operator: BinaryOperator
  $not?: boolean
  right?: IExpression
}
