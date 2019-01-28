import { IExpression } from './index'

export interface IColumnExpression extends IExpression {
  table?: string
  name: string
}

export class ColumnExpression implements IColumnExpression {
  public readonly classname = '$column'
  public table?: string
  public name: string

  constructor(json?: IColumnExpression) {
    switch (typeof json) {
      case 'object':
        this.table = json.table
        this.name = json.name
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `${this.table ? `\'${this.table}\'.` : ''}\`${this.name}\``
  }
}
