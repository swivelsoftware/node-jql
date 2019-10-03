import { IConditionalExpression } from '../index.if'
import { IQueryExpression } from '../query/index.if'

/**
 * {$not} EXISTS {query}
 */
export interface IExistsExpression extends IConditionalExpression {
  $not?: boolean
  query: IQueryExpression
}
