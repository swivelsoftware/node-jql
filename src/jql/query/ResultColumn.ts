import squel from 'squel'
import { JQL } from '..'
import { Expression } from '../expr'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { IExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { IResultColumn } from './interface'

/**
 * JQL class defining selected columns in query
 */
export class ResultColumn extends JQL implements IResultColumn {
  public expression: Expression
  public $as?: string

  /**
   * @param json [IResultColumn]
   */
  constructor(json: IResultColumn)

  /**
   * @param expression [expression|string]
   * @param $as [string] optional
   */
  constructor(expression: IExpression|string, $as?: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let expression: IExpression, $as: string|undefined
    if (args.length === 1 && typeof args[0] === 'object' && !('classname' in args[0])) {
      const json = args[0] as IResultColumn
      expression = json.expression
      $as = json.$as
    }
    else {
      expression = typeof args[0] === 'string' ? new ColumnExpression(args[0]) : args[0]
      $as = args[1]
    }

    // set args
    this.expression = parseExpr(expression)
    this.$as = $as
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
  public toSquel(): squel.QueryBuilder {
    const builder = squel.select({}, [new squel.cls.GetFieldBlock()]) as squel.Select
    return builder.field(this.expression.toSquel(), this.$as)
  }

  // @override
  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    return result
  }
}
