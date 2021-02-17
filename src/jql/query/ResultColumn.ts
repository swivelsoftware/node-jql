import squel from 'squel'
import { Expression } from '../expr'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { IExpression, IColumnExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { IResultColumn, QueryPartition } from './interface'

/**
 * JQL class defining selected columns in query
 */
export class ResultColumn extends QueryPartition implements IResultColumn {
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

  /**
   * Apply result column to query builder
   * @param type [squel.Flavour]
   * @param builder [squel.Select]
   * @param options [any]
   */
  public apply(type: squel.Flavour, builder: squel.Select, options?: any): squel.Select {
    if (!this.partitionBy.length) {
      return builder.field(this.expression.toSquel(type, options), this.$as)
    }
    else {
      return builder.field(`${this.expression.toString(type, options)} OVER (PARTITION BY ${this.partitionBy.map(e => e.toString(type, options)).join(', ')})`, this.$as)
    }
  }

  // @override
  public validate(availableTables: string[]): void {
    this.expression.validate(availableTables)
  }

  // @override
  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    if (this.partitionBy.length) result.partitionBy = this.partitionBy.map(e => e.toJson())
    return result
  }
}
