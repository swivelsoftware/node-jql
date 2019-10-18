import { IJQL } from '../../index.if'
import { ISchemaTable } from '../../select/fromTable/index.if'

/**
 * drop table
 */
export interface IDropTableJQL extends IJQL {
  table: ISchemaTable
  $ifExists?: boolean
}
