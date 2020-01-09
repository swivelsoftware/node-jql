import { ISQL } from '../index.if'
import { IQuery } from '../select/index.if'

/**
 * INSERT INTO
 */
export interface IInsert extends ISQL {
  schema?: string
  name: string
  columns?: string[]
  values: any
}

/**
 * INSERT INTO SELECT
 */
export interface IInsertSelect extends ISQL {
  schema?: string
  name: string
  columns?: string[]
  query: IQuery
}
