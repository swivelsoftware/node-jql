import { IJQL, Type } from '../../index.if'
import { Query } from '../../select'

/**
 * Column definition
 */
export interface IColumnDef<T = Type> extends IJQL {
  name: string
  type: T
  length?: number
  primaryKey?: boolean
  defaultValue?: any
  notNull?: boolean
  autoIncrement?: boolean
}

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
  constraints?: ICreateTableConstraint[]
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
export interface ICreateTableConstraint extends IJQL {
}

/**
 * raw constraint
 */
export interface ICreateTableRawConstraint extends ICreateTableConstraint {
  value: string
}

/**
 * PRIMARY KEY constraint
 */
export interface ICreateTablePrimaryKeyConstraint extends ICreateTableConstraint {
  columns: string[]
}

// TODO FOREIGN KEY constraint
