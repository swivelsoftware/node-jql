import { IColumnDef } from '../../create/index.if'
import { IConditionalExpression } from '../../expressions/index.if'
import { IJQL } from '../../index.if'
import { IQuery } from '../index.if'

/**
 * Table interface
 */
export interface ITable extends IJQL {
  $as?: string
}

/**
 * {function}({schema}.{table})
 */
export interface ISchemaTable extends ITable {
  function?: string
  schema?: string
  table: string
}

/**
 * Table from query
 */
export interface ISelectTable extends ITable {
  query: IQuery
}

/**
 * Table from API
 */
export interface IRemoteTable<R> extends ITable {
  columns: IColumnDef[]
  requestConfig: R
}

/**
 * Table join operator
 */
export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

/**
 * Join clauses for table
 */
export interface IJoinClause extends IJQL {
  operator?: JoinOperator
  table: ITable
  $on: IConditionalExpression
}

/**
 * Retrieve data from table
 */
export interface IFromTable extends IJQL {
  table: ITable
  joinClauses?: IJoinClause[]
}
