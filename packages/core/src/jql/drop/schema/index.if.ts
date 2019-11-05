import { IJQL } from '../../index.if'

/**
 * drop schema
 */
export interface IDropSchemaJQL extends IJQL {
  /**
   * Schema name
   */
  name: string

  /**
   * Suppress error if schema does not exists
   */
  $ifExists?: boolean
}
