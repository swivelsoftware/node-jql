import { IQuery } from '../../query/interface'
import { IConditionalExpression } from '../interface'

export interface IInExpression extends IConditionalExpression {
  $not?: boolean
  left: any
  right: any|IQuery
}
