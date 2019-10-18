import { IJQL } from '../../index.if'

/**
 * create schema
 */
export interface ICreateSchemaJQL extends IJQL {
  name: string
  $ifNotExists?: boolean
  options?: string[]
}
