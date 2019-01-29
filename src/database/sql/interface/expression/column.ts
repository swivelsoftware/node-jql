import squel = require('squel')
import { Expression, IExpression } from './index'

export interface IColumnExpression extends IExpression {
  table?: string
  name: string
}

export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname = '$column'
  public table?: string
  public name: string

  constructor(json?: IColumnExpression) {
    super(json)
    if (json) {
      this.table = json.table
      this.name = json.name
    }
  }

  public toSquel(): squel.BaseBuilder {
    return squel.str(`${this.table ? `\'${this.table}\'.` : ''}\`${this.name}\``)
  }
}
