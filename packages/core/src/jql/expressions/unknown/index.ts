import { Expression } from '..'
import { check } from '../..'
import { checkNull } from '../../../utils'
import { Type } from '../../index.if'
import { register } from '../parse'
import { typeOf, Value } from '../value'
import { IValue } from '../value/index.if'
import { IUnknown } from './index.if'

/**
 * Unknown variable
 */
export class Unknown extends Expression implements IUnknown {
  // @override
  public readonly classname: string = Unknown.name

  // @override
  public type: Type[]

  // assigned value
  private value_: any

  constructor(json: IUnknown)
  constructor(type: Type[])
  constructor(...args: any[]) {
    super()

    // parse
    let type: Type[]
    if (!Array.isArray(args[0])) {
      const json = args[0] as IUnknown
      type = json.type
    }
    else {
      type = args[0] as Type[]
    }

    // set
    this.type = type
  }

  set value(value: any) {
    if (!this.check(value)) throw new SyntaxError(`Unmatched type '${typeOf(value)}'. Expect ${this.type.map(t => `'${t}'`).join(', ')}`)
    this.value_ = value
  }

  get value(): any {
    return this.value_
  }

  // @override
  public toJson(): IUnknown|IValue {
    return checkNull(this.value_)
      ? { classname: this.classname, type: this.type } as IUnknown
      : new Value(this.value_).toJson()
  }

  // @override
  public toString(): string {
    return checkNull(this.value_)
      ? '?'
      : new Value(this.value_).toString()
  }

  private check(value: any): boolean {
    return this.type.reduce((result, t) => result || check(t, value), false)
  }
}

register(Unknown)
