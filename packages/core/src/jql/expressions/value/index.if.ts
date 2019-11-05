import { IExpression } from '../index.if'

/**
 * Constant value
 */
export interface IValue extends IExpression {
  /**
   * Value
   */
  value: any

  /**
   * Whether to show the raw value
   */
  raw?: boolean
}
