import { Schema } from '../../../schema'
import { IConditionalExpression } from '../../expression/interface'
import { IQuery } from '../interface'

export interface ITableOrSubquery {
  schema?: string|Schema
  table: string|IQuery
  $as?: string
}

export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

export interface IJoinClause {
  operator?: JoinOperator
  tableOrSubquery: ITableOrSubquery|string
  $on?: IConditionalExpression[]|IConditionalExpression
  $using?: string[]|string
}

export interface IJoinedTableOrSubquery extends ITableOrSubquery {
  joinClauses: IJoinClause[]|IJoinClause
}

export function isJoinedTableOrSubquery(value: ITableOrSubquery): value is IJoinedTableOrSubquery {
  return 'joinClauses' in value
}
