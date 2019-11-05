import { IJQL, Type } from '../../../jql/index.if'

/**
 * Extra options for creating table
 */
export interface ITableConstraint extends IJQL {
}

/**
 * Raw constraint
 */
export interface ITableRawConstraint extends ITableConstraint {
  /**
   * Constraint value
   */
  value: string
}

/**
 * PRIMARY KEY constraint
 */
export interface ITablePrimaryKeyConstraint extends ITableConstraint {
  /**
   * Primary columns
   */
  columns: string[]
}

// TODO FOREIGN KEY constraint

/**
 * Column definition
 */
export interface IColumnDef<T = Type> extends IJQL {
  /**
   * Column name
   */
  name: string

  /**
   * Column type
   */
  type: T

  /**
   * Column value length
   */
  length?: number

  /**
   * Whether it is a primary column
   */
  primaryKey?: boolean

  /**
   * Default value of the column
   */
  defaultValue?: any

  /**
   * Whether the column can be null
   */
  notNull?: boolean

  /**
   * Whether it is a auto-increment column
   */
  autoIncrement?: boolean

  /**
   * Extra column options
   */
  options?: string[]
}
