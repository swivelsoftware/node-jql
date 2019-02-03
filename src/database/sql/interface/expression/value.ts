import squel = require('squel')
import { Type } from '../../../metadata/column'
import { Expression } from './__base'

export interface IValueExpression {
  value: any
  type?: Type
}

export class ValueExpression extends Expression implements IValueExpression {
  public readonly classname = '$value'
  public value: any
  public type: Type

  constructor(json?: IValueExpression) {
    super(json)
    if (json) {
      this.value = json.value
      this.type = json.type || true
    }
  }

  public toSquel(): squel.BaseBuilder {
    return squel.rstr(Array.isArray(this.value) ? `(${this.value.map((item) => JSON.stringify(item)).join(', ')})` : JSON.stringify(this.value))
  }
}
