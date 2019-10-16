import { IConditionalExpression, IExpression } from '../expressions/index.if'
import { IJQL } from '../index.if'
import { IFromTable } from './fromTable/index.if'
import { ILimitBy } from './limitBy/index.if'
import { IOrderBy } from './orderBy/index.if'
import { IResultColumn } from './resultColumn/index.if'

/**
 * SELECT ... FROM ...
 */
export interface IQuery extends IJQL {
  $distinct?: boolean
  $select?: IResultColumn[]
  $from?: IFromTable[]
  $group?: IExpression[]
  $having?: IConditionalExpression
  $where?: IConditionalExpression
  $order?: IOrderBy[]
  $limit?: ILimitBy
}
