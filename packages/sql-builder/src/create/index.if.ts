import { IColumn, IConstraint, ISQL } from '../index.if'
import { IQuery } from '../select/index.if'

/**
 * CREATE SCHEMA
 */
export interface ICreateSchema extends ISQL {
  ifNotExists?: boolean
  name: string
  options?: string[]
}

/**
 * General CREATE TABLE
 */
export interface IBaseCreateTable extends ISQL {
  ifNotExists?: boolean
  database?: string
  name: string
  options?: string[]
}

/**
 * CREATE TABLE
 */
export interface ICreateTable extends IBaseCreateTable {
  columns: IColumn[]
  constraints?: IConstraint[]
}

/**
 * CREATE TABLE AS
 */
export interface ICreateTableSelect extends IBaseCreateTable {
  columns?: IColumn[]
  constraints?: IConstraint[]
  whenDuplicate?: 'IGNORE'|'REPLACE'
  query: IQuery
}
