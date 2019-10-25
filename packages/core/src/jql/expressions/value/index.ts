import { Expression } from '..'
import { checkNull } from '../../../utils'
import { Type } from '../../index.if'
import { register } from '../../parse'
import { IValue } from './index.if'

/**
 * Get type of value
 * @param value [any]
 */
export function typeOf(value: any): Type {
  const type = typeof value
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return type
    case 'object':
      if (value === null) return 'any'
      if (value instanceof Date) return 'datetime'
      return 'object'
    case 'undefined':
    default:
      return 'any'
  }
}

/**
 * Constant value
 */
export class Value extends Expression implements IValue {
  // @override
  public readonly classname = Value.name

  // @override
  public value: any

  // @override
  public raw = false

  constructor(json: IValue | any) {
    super()

    // parse
    let value: any, raw = false
    if (typeof json === 'object' && !checkNull(json) && 'classname' in json) {
      value = (json as IValue).value
      raw = (json as IValue).raw || false
    }
    else {
      value = json as any
    }

    // set
    this.value = value

    if (raw) this.setRaw(raw)
  }

  get type(): Type {
    return typeOf(this.value)
  }

  /**
   * Set if the value is JQL raw string
   * @param flag [boolean]
   */
  public setRaw(flag = true): Value {
    this.raw = flag
    return this
  }

  // @override
  public toJson(): IValue {
    return {
      classname: this.classname,
      value: this.value,
      raw: this.raw,
    }
  }

  // @override
  public toString(): string {
    if (checkNull(this.value)) return 'NULL'
    if (Array.isArray(this.value)) return this.value.length === 0 ? 'NULL' : `(${this.value.map(v => JSON.stringify(v)).join(', ')})`
    return this.raw ? String(this.value) : JSON.stringify(this.value)
  }
}

register(Value)
