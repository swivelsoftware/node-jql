import { IColumnDef, ITableConstraint } from '../../../engine/memory/table/index.if'
import { IJQL } from '../../index.if'
import { Query } from '../../select'

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
   * Query
   */
  $as: Query
}

/**
 * Create table from API
 */
export interface ICreateRemoteTableJQL<R> extends ICreateTable {
  /**
   * Table columns
   */
  columns: IColumnDef[]

  /**
   * Request options
   */
  requestConfig: R
}
