import squel from 'squel'
import { JQL } from '..'
import { Expression } from '../expr'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { IExpression, IColumnExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { IResultColumn } from './interface'

/**
 * JQL class defining selected columns in query
 */
export class ResultColumn extends JQL implements IResultColumn {
  public expression: Expression
  public $as?: string
  public partitionBy: ColumnExpression[]

  /**
   * @param json [IResultColumn]
   */
  constructor(json: IResultColumn)

  /**
   * @param expression [Expression|string]
   * @param $as [string] optional
   * @param partitionBy [Array<ColumnExpression>] optional
   */
  constructor(expression: IExpression|string, $as?: string, ...partitionBy: IColumnExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let expression: IExpression, $as: string|undefined, partitionBy: IColumnExpression[] = []
    if (args.length === 1 && typeof args[0] === 'object' && !('classname' in args[0])) {
      const json = args[0] as IResultColumn
      expression = json.expression
      $as = json.$as
      if (json.partitionBy) partitionBy = Array.isArray(json.partitionBy) ? json.partitionBy : [json.partitionBy]
    }
    else {
      expression = typeof args[0] === 'string' ? new ColumnExpression(args[0]) : args[0]
      $as = args[1]
      partitionBy = args.slice(2)
    }

    // set args
    this.expression = parseExpr(expression)
    this.$as = $as
    this.partitionBy = partitionBy.map(e => new ColumnExpression(e))
  }

  // @override
  get [Symbol.toStringTag](): string {
    return ResultColumn.name
  }

  // @override
  public validate(availableTables: string[]): void {
    this.expression.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    let result = `${this.expression.toSquel()}`
    if (this.partitionBy.length) result += ` OVER (PARTIION BY ${this.partitionBy.map(e => e.toString()).join(', ')})`
    if (this.$as) result += ` AS \`${this.$as}\``
    return squel.rstr(result)
  }

  // @override
  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    if (this.partitionBy.length) result.partitionBy = this.partitionBy.map(e => e.toJson())
    return result
  }
}
