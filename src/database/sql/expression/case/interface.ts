import { IConditionalExpression } from '../interface'

export interface ICase {
  $when: IConditionalExpression
  $then: any
}

export interface ICaseExpression extends IConditionalExpression {
  cases: ICase[]|ICase
  $else?: any
}
