import { Expression } from '..'
import { Type } from '../../index.if'
import { register } from '../parse'
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
    case 'undefined':
      return 'any'
    case 'object':
      if (value === null) return 'any'
      if (value instanceof Date) return 'datetime'
      return 'object'
  }
}

/**
 * Constant value
 */
export class Value extends Expression implements IValue {
  // @override
  public readonly classname: string = Value.name

  // @override
  public value: any

  constructor(json: IValue)
  constructor(value: any)
  constructor(...args: any[]) {
    super()

    // parse
    let value: any
    if ('classname' in args[0]) {
      const json = args[0] as IValue
      value = json.value
    }
    else {
      value = args[0] as any
    }

    // set
    this.value = value
  }

  get type(): Type {
    return typeOf(this.value)
  }

  // @override
  public toJson(): IValue {
    return {
      classname: this.classname,
      value: this.value,
    }
  }

  // @override
  public toString(): string {
    if (Array.isArray(this.value)) return this.value.length === 0 ? 'NULL' : `(${this.value.map(v => JSON.stringify(v)).join(', ')})`
    return JSON.stringify(this.value)
  }
}

register(Value)
