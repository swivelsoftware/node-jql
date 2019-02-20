import { IConditionalExpression } from '../interface'

export interface IBetweenExpression extends IConditionalExpression {
  $not?: boolean
  left: any
  start: any
  end: any
}
