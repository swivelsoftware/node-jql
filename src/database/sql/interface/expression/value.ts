import squel = require('squel')
import { Expression, IExpression } from './index'

export interface IValueExpression extends IExpression {
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
    return squel.str(JSON.stringify(this.value))
  }
}
