import { IConditionalExpression } from '../interface'

export interface ILikeExpression extends IConditionalExpression {
  $not?: boolean
  left: any
  right?: string
}
