import { IConditionalExpression } from '../interface'

export interface IIsNullExpression extends IConditionalExpression {
  $not?: boolean
  left: any
}
