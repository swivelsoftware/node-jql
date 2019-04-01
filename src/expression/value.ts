import squel = require('squel')
import { Expression, IExpression } from '.'
import { Type } from '../Sql'
import { JQLError } from '../utils/error'

export interface IValue extends IExpression {
  value: any
  type?: Type
}

export class Value extends Expression implements IValue {
  public readonly classname = 'Value'
  public value: any
  public type: Type

  constructor(json: any|IValue) {
    super()
    try {
      if (typeof json !== 'object') json = { value: json }
      const type = typeof json.value
      if (type === 'bigint' || type === 'function') throw new JQLError(`TypeError: Invalid value type '${type}'`)

      this.value = json.value
      this.type = json.type || type
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate Value', e)
    }
  }

  // @override
  public validate() { /* do nothing */ }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr('?', this.value)
  }
}
