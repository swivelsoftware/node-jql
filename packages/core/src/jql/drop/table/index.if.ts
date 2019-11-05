import { IJQL } from '../../index.if'
import { ISchemaTable } from '../../select/fromTable/index.if'

/**
 * Drop table
 */
export interface IDropTableJQL extends IJQL {
  /**
   * Target table
   */
  table: ISchemaTable

  /**
   * Suppress error if table does not exists
   */
  $ifExists?: boolean
}
