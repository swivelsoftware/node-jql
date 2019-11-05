import { IJQL, Type } from '../../index.if'

/**
 * Create function
 */
export interface ICreateFunctionJQL<T = Type> extends IJQL {
  /**
   * Function name
   */
  name: string

  /**
   * Types of parameters
   */
  parameters?: Array<[string, T]>

  /**
   * Return type
   */
  returnType: T

  /**
   * Function script
   */
  code: string
}
