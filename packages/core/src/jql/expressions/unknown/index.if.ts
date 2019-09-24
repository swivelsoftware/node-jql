import { Type } from '../../index.if'
import { IExpression } from '../index.if'

/**
 * Unknown variable
 */
export interface IUnknown extends IExpression {
  type: Type[]
}
