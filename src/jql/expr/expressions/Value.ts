import { type } from '../../../type'
import { IValue } from '../interface'
import { Unknown } from './Unknown'

/**
 * JQL class for constants
 */
export class Value extends Unknown implements IValue {
  public readonly classname = Value.name
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
    super(...args)

    // parse args
    let value: any
    if (typeof args[0] === 'object' && 'value' in args[0]) {
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
  public toJson(): IValue {
    return {
      classname: this.classname,
      value: this.value,
    }
  }
}
