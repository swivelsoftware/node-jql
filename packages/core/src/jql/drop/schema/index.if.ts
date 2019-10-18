import { IJQL } from '../../index.if'

/**
 * drop schema
 */
export interface IDropSchemaJQL extends IJQL {
  name: string
  $ifExists?: boolean
}
