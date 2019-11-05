import { IQuery } from '../../select/index.if'
import { IExpression } from '../index.if'

/**
 * SELECT ... FROM ...
 */
export interface IQueryExpression extends IExpression {
  /**
   * Query
   */
  query: IQuery
}
