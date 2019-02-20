import { IQuery } from '../../query/interface'
import { IConditionalExpression } from '../interface'

export interface IExistsExpression extends IConditionalExpression {
  $not?: boolean
  query: IQuery
}
