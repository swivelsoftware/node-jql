
import { Type } from '../../Type'
import { IJQL, IParseable } from '../interface'
import { IQuery } from '../query/interface'

/**
 * Raw JQL defining CREATE statements
 */
export interface ICreateJQL extends IJQL, IParseable {
  /**
   * Entity name
   */
  name: string

  /**
   * Whether to throw error if the target entity exists
   */
  $ifNotExists?: boolean
}

/**
 * Raw JQL for `CREATE DATABASE ...`
 */
export interface ICreateDatabaseJQL extends ICreateJQL {
  /**
   * Database engine
   */
  engine?: string
}

/**
 * Raw JQL for `CREATE TABLE ...`
 */
export interface ICreateTableJQL extends ICreateJQL {
  /**
   * Whether it is a temporary table
   */
  $temporary?: boolean

  /**
   * Related database
   */
  database?: string

  /**
   * Table columns
   */
  columns?: IColumn[]

  /**
   * Column constraints
   */
  constraints?: string[]|string

  /**
   * Table options
   */
  options?: string[]|string

  /**
   * SELECT statement
   */
  $as?: IQuery
}

/**
 * Raw JQL defining column
 */
export interface IColumn<Type = any, Default = any> extends IJQL {
  /**
   * Column name
   */
  name: string

  /**
   * Column type
   */
  type: Type

  /**
   * Whether the column is nullable
   */
  nullable?: boolean

  /**
   * Default value
   */
  defValue?: Default

  /**
   * Extra options
   */
  options?: string[]|string
}

/**
 * Raw JQL for `CREATE FUNCTION ...`
 */
export interface ICreateFunctionJQL extends IJQL, ICreateJQL {
  /**
   * Whether it is an aggregate function
   */
  aggregate?: boolean

  /**
   * Function name
   */
  name: string

  /**
   * Main function
   */
  fn: string|Function

  /**
   * Parameters
   */
  parameters?: Type[]

  /**
   * Return type
   */
  type?: Type
}
