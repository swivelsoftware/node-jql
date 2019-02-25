import { IConditionalExpression } from '../interface'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='

export interface IBinaryExpression extends IConditionalExpression {
  left: any
  operator: BinaryOperator
  right: any
}
