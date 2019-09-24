import { IExpression } from '../index.if'

export type MathOperator = '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV'

/**
 * {left} {operator} {right}
 */
export interface IMathExpression extends IExpression {
  left: IExpression
  operator: MathOperator
  right: IExpression
}
