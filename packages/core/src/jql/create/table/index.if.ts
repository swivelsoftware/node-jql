import { IColumnDef, ITableConstraint, ITablePrimaryKeyConstraint } from '../../../engine/memory/table/index.if'
import { IJQL } from '../../index.if'
import { IQuery } from '../../select/index.if'

/**
 * Create table
 */
export interface ICreateTable extends IJQL {
  /**
   * Schema name
   */
  schema?: string

  /**
   * Table name
   */
  name: string

  /**
   * Suppress error if table exists
   */
  $ifNotExists?: boolean

  /**
   * Engine used
   */
  engine?: string
}

/**
 * Normally create table
 */
export interface ICreateSchemaTableJQL extends ICreateTable {
  /**
   * Table columns
   */
  columns: IColumnDef[]

  /**
   * Table options
   */
  constraints?: ITableConstraint[]
}

/**
 * Create table from query
 */
export interface ICreateQueryTableJQL extends ICreateTable {
  /**
   * PRIMARY KEY options
   */
  constraint?: ITablePrimaryKeyConstraint

  /**
   * Query
   */
  $as: IQuery
}

/**
 * Create table from API
 */
export interface ICreateRemoteTableJQL<R> extends ICreateSchemaTableJQL {
  /**
   * Request options
   */
  requestConfig: R
}
