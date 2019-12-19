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

  constructor(json: IColumnExpression)
  constructor(table: string, name: string)
  constructor(name: string)

  constructor(...args: any) {
    super()
    if (typeof args[0] === 'object') {
      const json: IColumnExpression = args[0]
      if (this.table) this.table = json.table
      this.name = json.name
    }
    else if (args.length === 2) {
      this.table = args[0]
      this.name = args[1]
    }
    else {
      this.name = args[0]
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
