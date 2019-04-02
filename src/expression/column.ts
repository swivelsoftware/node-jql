import squel = require('squel')
import { Expression, IExpression } from '.'

export interface IColumnExpression extends IExpression {
  table?: string
  name: string
}

export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname = 'ColumnExpression'
  public table?: string
  public name: string

  constructor(json: string|[string, string]|IColumnExpression) {
    super()
    if (typeof json === 'string') {
      json = { name: json }
    }
    else if (Array.isArray(json)) {
      json = {
        table: json[0],
        name: json[1],
      }
    }
    this.table = json.table
    this.name = json.name
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'ColumnExpression'
  }

  // @override
  public validate(availableTables: string[]) {
    if (this.table && availableTables.indexOf(this.table) === -1) {
      throw new SyntaxError(`Unknown table '${this.table}'`)
    }
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(`${this.table ? `\`${this.table}\`.` : ''}\`${this.name}\``)
  }
}
