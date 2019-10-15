import { Expression } from '..'
import { register } from '../parse'
import { IColumnExpression } from './index.if'

/**
 * {table}.{name}
 */
export class ColumnExpression extends Expression implements IColumnExpression {
  // @override
  public readonly classname = ColumnExpression.name

  // @override
  public table?: string

  // @override
  public name: string

  constructor(json?: IColumnExpression) {
    super()

    if (json) {
      if (json.table) {
        this.setColumn(json.table, json.name)
      }
      else {
        this.setColumn(json.name)
      }
    }
  }

  /**
   * set column
   * @param name [string]
   */
  public setColumn(name: string): ColumnExpression
  /**
   * set column
   * @param table [string]
   * @param name [string]
   */
  public setColumn(table: string, name: string): ColumnExpression
  public setColumn(...args: any[]): ColumnExpression {
    if (args.length === 1) {
      this.table = undefined
      this.name = args[0] as string
    }
    else {
      this.table = args[0] as string
      this.name = args[1] as string
    }
    return this
  }

  // @override
  public toJson(): IColumnExpression {
    this.check()
    return {
      classname: this.classname,
      table: this.table,
      name: this.name,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = ''
    if (this.table) result += `\`${this.table}\`.`
    result += `\`${this.name}\``
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Column name is not defined')
  }
}

register(ColumnExpression)
