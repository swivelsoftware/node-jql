import { IExpression } from '../index.if'

/**
 * {table}.{name}
 */
export interface IColumnExpression extends IExpression {
  /**
   * DISTINCT flag
   */
  $distinct?: boolean

  /**
   * Table name
   */
  table?: string

  /**
   * Column name
   */
  name: string
}
