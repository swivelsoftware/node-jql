import { IConditionalExpression, IExpression, IColumnExpression, IValue } from '../expr/interface'
import { IJQL, IParseable } from '../interface'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { JQL } from '..'
import squel, { Squel } from 'squel'
import { JQLError } from '../../utils/error'

/**
 * Query partition abstract class
 */
export abstract class QueryPartition extends JQL {
  /**
   * Apply partition to SELECT statement
   * @param type [squel.Flavour]
   * @param query [IQuery]
   * @param builder [squel.Select]
   * @param options [any]
   */
  public abstract apply(type: squel.Flavour, query: IQuery, builder: squel.Select, options?: any): squel.Select

  // @override
  public toSquel(): squel.BaseBuilder {
    throw new JQLError('NOT_AVAILABLE')
  }
}

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
  table: string|IQuery|{ sql: string }

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
  $limit: number|IValue

  /**
   * Result start from ...
   */
  $offset?: number|IValue
}
