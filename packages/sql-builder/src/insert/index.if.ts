import { ISQL } from '../index.if'
import { IFromTable, IQuery } from '../select/index.if'

/**
 * INSERT INTO
 */
export interface IInsert extends ISQL {
  into: IFromTable
  columns?: string[]
  values: any
}

/**
 * INSERT INTO SELECT
 */
export interface IInsertSelect extends IInsert {
  query: IQuery
}
