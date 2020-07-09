import { AxiosRequestConfig } from 'axios'
import { Type } from '../../Type'
import { IConditionalExpression, IExpression, IColumnExpression } from '../expr/interface'
import { IJQL, IParseable } from '../interface'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'

/**
 * Raw JQL for SELECT query
 */
export interface IQuery extends IJQL, IParseable {
  /**
   * Use SELECT DISTINCT instead
   */
  $distinct?: boolean

  /**
   * SELECT ...
   */
  $select?: IResultColumn[]|IResultColumn|string

  /**
   * FROM ...
   */
  $from?: IFromTable[]|IFromTable|string

  /**
   * WHERE ...
   */
  $where?: IConditionalExpression[]|IConditionalExpression

  /**
   * GROUP BY ... HAVING ...
   */
  $group?: IGroupBy|string

  /**
   * ORDER BY ...
   */
  $order?: IOrderBy[]|IOrderBy|string

  /**
   * LIMIT ... OFFSET ...
   */
  $limit?: ILimitOffset|number

  /**
   * Link queries with UNION
   */
  $union?: IQuery
}

/**
 * Raw JQL defining selected columns in query
 */
export interface IResultColumn extends IJQL {
  /**
   * Result column context
   */
  expression: IExpression

  /**
   * alias column name
   */
  $as?: string

  /**
   * partition column
   */
  partitionBy?: IColumnExpression[]|ColumnExpression
}

/**
 * Join operator for table
 */
export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

/**
 * Raw JQL defining join clause
 */
export interface IJoinClause extends IJQL {
  /**
   * Join operator
   */
  operator?: JoinOperator

  /**
   * Table for joining
   */
  table: IFromTable|string

  /**
   * Joining condition
   */
  $on?: IConditionalExpression[]|IConditionalExpression
}

/**
 * Raw JQL defining tables for query
 */
export interface IFromTable extends IJQL {
  /**
   * Database where the table is in
   */
  database?: string

  /**
   * Table definition
   */
  table: string|IQuery|IRemoteTable

  /**
   * Alias table name
   */
  $as?: string

  /**
   * Join clauses
   */
  joinClauses?: IJoinClause[]|IJoinClause
}

/**
 * Raw JQL defining remote table through API
 */
export interface IRemoteTable extends AxiosRequestConfig {
  /**
   * Result structure
   */
  columns: {
    name: string,
    type?: Type,
    $as?: string,
    nullable?: boolean,
  }[]
}

/**
 * Raw JQL for `GROUP BY ... HAVING ...`
 */
export interface IGroupBy extends IJQL {
  /**
   * Grouping criteria
   */
  expressions: IExpression[]|IExpression

  /**
   * Grouping conditions
   */
  $having?: IConditionalExpression[]|IConditionalExpression
}

/**
 * Raw JQL for ordering terms in query
 */
export interface IOrderBy extends IJQL {
  /**
   * Sorting context
   */
  expression: IExpression

  /**
   * Sorting order
   */
  order?: 'ASC'|'DESC'
}

/**
 * Raw JQL for `LIMIT {$limit} OFFSET {$offset}`
 */
export interface ILimitOffset extends IJQL {
  /**
   * Limit result count
   */
  $limit: number|IExpression

  /**
   * Result start from ...
   */
  $offset?: number|IExpression
}
