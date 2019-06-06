import squel from 'squel'
import { Expression, IExpression } from '.'
import { Type } from '../Type'
import { IValue } from './value'

export interface IUnknown extends IExpression {
  type?: Type[]|Type
}

export class Unknown extends Expression implements IUnknown {
  public readonly classname = 'Unknown'
  public value?: any
  public type?: Type[]

  constructor(json?: IUnknown) {
    super()
    if (json) this.type = json.type ? (Array.isArray(json.type) ? json.type : [json.type]) : undefined
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'Unknown'
  }

  // @override
  public validate() { /* do nothing */ }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr('?', this.value)
  }

  // @override
  public toJson(): IValue|IUnknown {
    if (this.value !== undefined && this.value !== null) {
      return {
        classname: 'Value',
        value: this.value,
        type: this.type,
      }
    }
    return {
      classname: this.classname,
      type: this.type,
    }
  }
}
