import { Expression } from '.'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { IUnknown } from './index.if'
import { Value } from './value'

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
  private assigned?: Expression

  public get value(): any {
    return this.assigned instanceof Value ? this.assigned.value : this.assigned
  }

  public set value(value: any) {
    if ('classname' in value) value = parse(value)
    if (value instanceof Unknown) throw new SyntaxError('You should not assign an Unknown to an Unknown')
    if (!(value instanceof Expression)) value = new Value(value)
    this.assigned = value
  }

  // @override
  public toJson(): IExpression {
    return this.assigned || { classname: this.classname }
  }
}

register(Unknown)
