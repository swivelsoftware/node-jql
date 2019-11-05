import { Expression } from '..'
import { check } from '../..'
import { checkNull } from '../../../utils'
import { Type } from '../../index.if'
import { register } from '../../parse'
import { typeOf, Value } from '../value'
import { IValue } from '../value/index.if'
import { IUnknown } from './index.if'

/**
 * Unknown variable
 */
export class Unknown extends Expression implements IUnknown {
  // @override
  public readonly classname = Unknown.name

  // @override
  public type: Type = 'any'

  // assigned value
  private value_: any

  constructor(json?: Type|IUnknown)  {
    super()

    if (typeof json === 'string') {
      this.setType(json)
    }
    else if (json) {
      this.setType(json.type)
    }
  }

  /**
   * Set unknown type
   * @param type [Type]
   */
  public setType(type: Type = 'any'): Unknown {
    this.type = type
    return this
  }

  set value(value: any) {
    if (!check(this.type, value)) throw new SyntaxError(`Unmatched type '${typeOf(value)}'. Expect '${this.type}'`)
    this.value_ = value
  }

  get value(): any {
    return this.value_
  }

  /**
   * Convert to Value expression
   */
  public toValue(): Value {
    return new Value(this.value_)
  }

  // @override
  public toJson(): IUnknown|IValue {
    return checkNull(this.value_)
      ? { classname: this.classname, type: this.type } as IUnknown
      : this.toValue().toJson()
  }

  // @override
  public toString(): string {
    return checkNull(this.value_)
      ? '?'
      : this.toValue().toString()
  }
}

register(Unknown)
