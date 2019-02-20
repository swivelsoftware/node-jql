import { IConditionalExpression } from '../expression/interface'
import { IGroupBy } from './groupBy/interface'
import { IOrderingTerm } from './orderingTerm/interface'
import { IResultColumn } from './resultColumn/interface'
import { ITableOrSubquery, IJoinedTableOrSubquery } from './tableOrSubquery/interface'

export function isQuery(object: any): object is IQuery {
  return '$select' in object || '$from' in object
}

export interface IQuery {
  $distinct?: boolean
  $select?: IResultColumn[]|IResultColumn|string
  $from?: (ITableOrSubquery|IJoinedTableOrSubquery)[]|IJoinedTableOrSubquery|ITableOrSubquery|string
  $where?: IConditionalExpression[]|IConditionalExpression
  $group?: IGroupBy|string
  $order?: IOrderingTerm[]|IOrderingTerm|string
  $limit?: ILimit|number
}

export interface ILimit {
  value: number
  $offset?: number
}
