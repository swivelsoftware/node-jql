import squel = require('squel')
import { Expression } from './__base'

export interface IColumnExpression {
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
    return squel.rstr(`${this.table ? `\`${this.table}\`.` : ''}${this.name === '*' ? '*' : `\`${this.name}\``}`)
  }
}
