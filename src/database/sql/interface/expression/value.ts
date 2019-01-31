import squel = require('squel')
import { Expression } from './__base'

export interface IValueExpression {
  value: any
}

export class ValueExpression extends Expression implements IValueExpression {
  public readonly classname = '$value'
  public value: any

  constructor(json?: IValueExpression) {
    super(json)
    if (json) this.value = json.value
  }

  public toSquel(): squel.BaseBuilder {
    return squel.rstr(Array.isArray(this.value) ? `(${this.value.map((item) => JSON.stringify(item)).join(', ')})` : JSON.stringify(this.value))
  }
}
