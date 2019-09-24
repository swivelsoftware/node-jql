import { IConditionalExpression } from '../index.if'

/**
 * {$not} EXISTS {query}
 */
export interface IExistsExpression extends IConditionalExpression {
  $not?: boolean
  query: IQuery
}
