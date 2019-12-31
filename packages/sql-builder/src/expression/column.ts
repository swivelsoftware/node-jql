import { Expression } from '.'
import { register } from '../parse'
import { IColumnExpression } from './index.if'

/**
 * Column expression
 */
export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname: string = ColumnExpression.name
  public readonly table?: string
  public readonly name: string

  constructor(json: [string, string]|string|IColumnExpression) {
    super()
    if (Array.isArray(json)) {
      this.table = json[0]
      this.name = json[1]
    }
    else if (typeof json === 'string') {
      this.name = json
    }
    else {
      if (json.table) this.table = json.table
      this.name = json.name
    }
  }

  // @override
  public toString(): string {
    return this.table ? `\`${this.table}\`.\`${this.name}\`` : `\`${this.name}\``
  }

  // @override
  public toJson(): IColumnExpression {
    const json: IColumnExpression = {
      classname: this.classname,
      name: this.name,
    }
    if (this.table) json.table = this.table
    return json
  }
}

register(ColumnExpression)
