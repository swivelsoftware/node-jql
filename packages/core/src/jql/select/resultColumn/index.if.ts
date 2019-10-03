import { IExpression } from '../../expressions/index.if'
import { IJQL } from '../../index.if'

/**
 * Selected column in the result set
 */
export interface IResultColumn extends IJQL {
  expression: IExpression
  $as?: string
}
