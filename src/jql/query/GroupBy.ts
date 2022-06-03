import squel from '@swivel-admin/squel'
import { ConditionalExpression, Expression } from '../expr'
import { AndExpressions } from '../expr/expressions/AndExpressions'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { IConditionalExpression, IExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { IGroupBy, IQuery, QueryPartition } from './interface'

/**
 * JQL class for `GROUP BY ... HAVING ...`
 */
export class GroupBy extends QueryPartition implements IGroupBy {
  public expressions: Expression[]
  public $having?: ConditionalExpression

  /**
   * @param json [IGroupBy]
   */
  constructor(json: IGroupBy)

  /**
   * @param expression [IExpression|string]
   */
  constructor(expression: IExpression|string)

  /**
   * @param expressions [Array<IExpression|string>]
   * @param $having [Array<IConditionalExpression>] optional
   */
  constructor(expressions: Array<IExpression|string>, ...$having: IConditionalExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let expressions: Array<IExpression|string>, $having: IConditionalExpression[] = []
    if (!Array.isArray(args[0]) && typeof args[0] !== 'string' && !('classname' in args[0])) {
      const json = args[0] as IGroupBy
      expressions = Array.isArray(json.expressions) ? json.expressions : [json.expressions]
      if (json.$having) $having = Array.isArray(json.$having) ? json.$having : [json.$having]
    }
    else if (typeof args[0] === 'string') {
      expressions = [new ColumnExpression(args[0])]
    }
    else if (!Array.isArray(args[0])) {
      expressions = [args[0]]
    }
    else {
      expressions = args[0]
      $having = args.slice(1)
    }

    // set args
    this.expressions = expressions.map(expression => typeof expression === 'string' ? new ColumnExpression(expression) : parseExpr(expression))
    if ($having.length > 0) this.$having = $having.length > 1 ? new AndExpressions($having) : parseExpr<ConditionalExpression>($having[0])
  }

  // @override
  public apply(type: squel.Flavour, query: IQuery, builder: squel.Select, options?: any): squel.Select {
    for (let expression of this.expressions) {
      if (type !== 'mysql' && expression instanceof ColumnExpression && !expression.table && query.$select && Array.isArray(query.$select)) {
        const target = query.$select.find(r => r.$as === (expression as ColumnExpression).name)
        if (target) expression = parseExpr(target.expression)
      }
      builder = builder.group(expression.toString(type, options))
    }
    if (this.$having) builder = builder.having(this.$having.toSquel(type, options) as squel.Expression)
    return builder
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const expression of this.expressions) expression.validate(availableTables)
    if (this.$having) this.$having.validate(availableTables)
  }

  // @override
  public toJson(): IGroupBy {
    const result: IGroupBy = { expressions: this.expressions.map(expression => expression.toJson()) }
    if (this.$having) result.$having = this.$having.toJson()
    return result
  }
}
