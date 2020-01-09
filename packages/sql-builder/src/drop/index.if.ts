import { ISQL } from '../index.if'

/**
 * DROP SCHEMA
 */
export interface IDropSchema extends ISQL {
  ifExists?: boolean
  name: string
}

/**
 * DROP TABLE
 */
export interface IDropTable extends ISQL {
  ifExists?: boolean
  schema?: string
  name: string
}

/**
 * DROP FUNCTION
 */
export interface IDropFunction extends ISQL {
  ifExists?: boolean
  name: string
}
