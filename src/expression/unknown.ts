import squel = require('squel')
import { Expression, IExpression } from '.'
import { Type } from '../Sql'

export interface IUnknown extends IExpression {
  type?: Type[]|Type
}

export class Unknown extends Expression implements IUnknown {
  public readonly classname = 'Unknown'
  public type?: Type[]

  constructor(json?: IUnknown) {
    super()
    if (json) this.type = json.type ? (Array.isArray(json.type) ? json.type : [json.type]) : undefined
  }

  // @override
  public validate() { /* do nothing */ }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr('?')
  }
}
