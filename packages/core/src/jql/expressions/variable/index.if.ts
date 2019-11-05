import { IExpression } from '../index.if'

/**
 * Defined variable
 */
export interface IVariable extends IExpression {
  /**
   * Variable name
   */
  name: string
}
