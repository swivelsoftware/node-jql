import { IConditionalExpression } from '../index.if'
import { IQueryExpression } from '../query/index.if'

/**
 * {$not} EXISTS {query}
 */
export interface IExistsExpression extends IConditionalExpression {
  /**
   * NOT flag
   */
  $not?: boolean

  /**
   * Query
   */
  query: IQueryExpression
}
