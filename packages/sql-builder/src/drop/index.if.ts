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
  database?: string
  name: string
}
