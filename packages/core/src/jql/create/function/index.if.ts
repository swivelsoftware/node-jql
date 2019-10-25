import { IJQL, Type } from '../../index.if'

/**
 * create function
 */
export interface ICreateFunctionJQL<T = Type> extends IJQL {
  name: string
  parameters?: Array<[string, T]>
  returnType: T
  code: string
}
