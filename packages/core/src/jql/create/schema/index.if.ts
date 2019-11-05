import { IJQL } from '../../index.if'

/**
 * Create schema
 */
export interface ICreateSchemaJQL extends IJQL {
  /**
   * Schema name
   */
  name: string

  /**
   * Suppress error if schema with the same name exists
   */
  $ifNotExists?: boolean

  /**
   * Schema options
   */
  options?: string[]
}
