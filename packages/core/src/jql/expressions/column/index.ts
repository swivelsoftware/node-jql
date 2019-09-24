import { Expression } from '..'
import { register } from '../parse'
import { IColumnExpression } from './index.if'

/**
 * {table}.{name}
 */
export class ColumnExpression extends Expression implements IColumnExpression {
  // @override
  public readonly classname: string = ColumnExpression.name

  // @override
  public table?: string

  // @override
  public name: string

  constructor(json: IColumnExpression)
  constructor(name: string)
  constructor(table: string, name: string)
  constructor(...args: any[]) {
    super()

    // parse
    let table: string|undefined, name: string
    if (args.length === 1 && typeof args[0] === 'object') {
      const json = args[0] as IColumnExpression
      table = json.table
      name = json.name
    }
    else if (args.length === 2) {
      table = args[0] as string
      name = args[1] as string
    }
    else {
      name = args[0] as string
    }

    // set
    this.table = table
    this.name = name
  }

  // @override
  public toJson(): IColumnExpression {
    return {
      classname: this.classname,
      table: this.table,
      name: this.name,
    }
  }

  // @override
  public toString(): string {
    let result = ''
    if (this.table) result += `\`${this.table}\`.`
    result += `\`${this.name}\``
    return result
  }
}

register(ColumnExpression)
