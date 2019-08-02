import { IJQL, IParseable } from '../interface'

/**
 * Raw JQL defining DROP statements
 */
export interface IDropJQL extends IJQL, IParseable {
  /**
   * Entity name
   */
  name: string

  /**
   * Whether to throw error if the target entity does not exists
   */
  $ifExists?: boolean
}

/**
 * Raw JQL for `DROP DATABASE ...`
 */
export interface IDropDatabaseJQL extends IDropJQL {
}

/**
 * Raw JQL for `DROP TABLE ...`
 */
export interface IDropTableJQL extends IDropJQL {
  $temporary?: boolean
  database?: string
}

/**
 * Raw JQL for `DROP FUNCTION ...`
 */
export interface IDropFunctionJQL extends IDropJQL {
}
