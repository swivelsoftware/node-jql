import { IJQL, Type } from '../index.if'

/**
 * Column definition
 */
export interface IColumnDef extends IJQL {
  name: string
  type: Type
  length?: number
  notNull?: boolean
  autoIncrement?: boolean
}
