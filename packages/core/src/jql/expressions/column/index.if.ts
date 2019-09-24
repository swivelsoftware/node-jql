import { IExpression } from '../index.if'

/**
 * {table}.{name}
 */
export interface IColumnExpression extends IExpression {
  table?: string
  name: string
}
