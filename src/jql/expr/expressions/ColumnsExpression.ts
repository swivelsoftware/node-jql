import squel from 'squel'
import { Expression } from '..'
import { IColumnExpression, IColumnsExpression } from '../interface'
import { ColumnExpression } from './ColumnExpression'

/**
 * JQL class defining column expression
 */
export class ColumnsExpression extends Expression implements IColumnsExpression {
  public readonly classname = ColumnsExpression.name
  public columns: ColumnExpression[]

  /**
   * @param json [Partial<IColumnsExpression>]
   */
  constructor(json: Partial<IColumnsExpression>)

  /**
   * @param columns [Array<IColumnExpression>]
   */
  constructor(columns: IColumnExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    if (!Array.isArray(args[0])) {
      const json = args[0] as IColumnsExpression
      this.columns = json.columns.map(json => new ColumnExpression(json))
    }
    else  {
      this.columns = args[0].map(json => new ColumnExpression(json))
    }
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const expr of this.columns) expr.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return this.columns.length > 1 ? squel.rstr(`(${this.columns.map(c => c.toString()).join(', ')})`) : this.columns[0].toSquel()
  }

  // @override
  public toJson(): IColumnsExpression {
    return {
      classname: this.classname,
      columns: this.columns.map(c => c.toJson()),
    }
  }
}
