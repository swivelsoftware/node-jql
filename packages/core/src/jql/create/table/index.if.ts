import { IColumnDef } from '../../../engine/memory/table/index.if'
import { IJQL } from '../../index.if'
import { Query } from '../../select'

/**
 * create table
 */
export interface ICreateTable extends IJQL {
  schema?: string
  name: string
  $ifNotExists?: boolean
}

/**
 * normally create table
 */
export interface ICreateSchemaTableJQL extends ICreateTable {
  columns: IColumnDef[]
  constraints?: ITableConstraint[]
}

/**
 * create table from query
 */
export interface ICreateQueryTableJQL extends ICreateTable {
  $as: Query
}

/**
 * create table from API
 */
export interface ICreateRemoteTableJQL<R> extends ICreateTable {
  columns: IColumnDef[]
  requestConfig: R
}

/**
 * extra options for create table
 */
export interface ITableConstraint extends IJQL {
}

/**
 * raw constraint
 */
export interface ITableRawConstraint extends ITableConstraint {
  value: string
}

/**
 * PRIMARY KEY constraint
 */
export interface ITablePrimaryKeyConstraint extends ITableConstraint {
  columns: string[]
}

// TODO FOREIGN KEY constraint
