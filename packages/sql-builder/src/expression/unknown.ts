import { Expression } from '.'
import { IExpression } from '../index.if'
import { register } from '../parse'
import { IUnknown } from './index.if'

/**
 * Check whether this is Unknown json
 * @param expression [IExpression]
 */
export function isUnknown(expression: IExpression) {
  return expression instanceof Unknown || expression.classname === Unknown.name
}

/**
 * Unknown phrase
 */
export class Unknown extends Expression implements IUnknown {
  public readonly classname: string = Unknown.name
  public assigned?: IExpression

  // @override
  public toString(): string {
    return this.assigned ? this.assigned.toString() : '?'
  }

  // @override
  public toJson(): IExpression {
    return this.assigned || { classname: this.classname }
  }
}

register(Unknown)
