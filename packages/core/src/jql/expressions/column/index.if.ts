import { IExpression } from '../index.if'

/**
 * {table}.{name}
 */
export interface IColumnExpression extends IExpression {
  $distinct?: boolean
  table?: string
  name: string
}
