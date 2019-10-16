import { IExpression } from '../../expressions/index.if'
import { IJQL } from '../../index.if'

/**
 * Ordering
 */
export interface IOrderBy extends IJQL {
  expression: IExpression
  direction?: 'ASC'|'DESC'
}
