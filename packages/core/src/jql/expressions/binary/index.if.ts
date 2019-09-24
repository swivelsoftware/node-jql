import { IConditionalExpression, IExpression } from '../index.if'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='|'IN'|'IS'|'LIKE'|'REGEXP'

/**
 * {left} {operator} {right}
 */
export interface IBinaryExpression extends IConditionalExpression {
  left: IExpression
  operator: BinaryOperator
  right?: IExpression
}
