import { IJQL, Type } from '../../../jql/index.if'

/**
 * Column definition
 */
export interface IColumnDef<T = Type> extends IJQL {
  name: string
  type: T
  length?: number
  primaryKey?: boolean
  defaultValue?: any
  notNull?: boolean
  autoIncrement?: boolean
  options?: string[]
}
