import { IJQL, IParseable } from '../interface'
import { IQuery } from '../query/interface'

/**
 * Raw JQL for INSERT INTO ...
 */
export interface IInsertJQL<T = any> extends IJQL, IParseable {
  /**
   * Related database
   */
  database?: string

  /**
   * Table name
   */
  name: string

  /**
   * Rows
   */
  values?: T[]

  /**
   * Columns
   */
  columns?: string[]

  /**
   * Query
   */
  query?: IQuery
}
