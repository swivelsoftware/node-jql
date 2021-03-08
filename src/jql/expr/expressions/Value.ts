import squel = require('squel')
import { Expression } from '..'
import { type, Type } from '../../../Type'
import { IValue } from '../interface'

/**
 * JQL class for constants
 */
export class Value extends Expression implements IValue {
  public readonly classname = Value.name
  public type: Type[] = ['any']
  public value: any

  /**
   * @param json [Partial<IValue>]
   */
  constructor(json: Partial<IValue>)

  /**
   * @param value [any]
   */
  constructor(value: any)

  constructor(...args: any[]) {
    super()

    // parse args
    let value: any
    if (typeof args[0] === 'object' && args[0] !== null && 'value' in args[0]) {
      const json = args[0] as IValue
      value = json.value
    }
    else {
      value = args[0]
    }

    // set args
    const type_ = typeof value
    if (type_ === 'bigint' || type_ === 'function') throw new TypeError(`Invalid type ${type_} for node-jql`)
    this.type = [type(this.value = value)]
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(type: squel.Flavour = 'mysql'): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    if (Array.isArray(this.value)) {
      let format = ''
      for (let i = 0, length = this.value.length; i < length; i += 1) format += (i > 0 ? ', ' : '') + '?'
      format = `(${format})`
      return squel_.rstr(format, ...this.value)
    }
    return squel_.rstr('?', this.value)
  }

  // @override
  public toJson(): IValue {
    return {
      classname: this.classname,
      value: this.value,
    }
  }
}
