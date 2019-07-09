import squel from 'squel'
import { IJQL, JQL } from '..'
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '../expr'
import { AndExpressions } from '../expr/expressions/AndExpressions'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { parse } from '../expr/parse'

/**
 * Raw JQL for `GROUP BY ... HAVING ...`
 */
export interface IGroupBy extends IJQL {
  /**
   * Grouping criteria
   */
  expressions: IExpression[]|IExpression

  /**
   * Grouping conditions
   */
  $having?: IConditionalExpression[]|IConditionalExpression
}

/**
 * JQL class for `GROUP BY ... HAVING ...`
 */
export class GroupBy extends JQL implements IGroupBy {
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
      json.$having = json.$having || []
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
    this.expressions = expressions.map(expression => typeof expression === 'string' ? new ColumnExpression(expression) : parse(expression))
    if ($having.length > 0) this.$having = $having.length > 1 ? new AndExpressions($having) : parse<ConditionalExpression>($having[0])
  }

  // @override
  get [Symbol.toStringTag](): string {
    return GroupBy.name
  }

  /**
   * Apply group statement to query builder
   * @param builder [squel.Select]
   */
  public apply(builder: squel.Select): squel.Select {
    for (const expression of this.expressions) builder = builder.group(expression.toString())
    if (this.$having) builder = builder.having(this.$having.toSquel())
    return builder
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const expression of this.expressions) expression.validate(availableTables)
    if (this.$having) this.$having.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    return this.apply(squel.select({}, [new squel.cls.GroupByBlock(), new squel.cls.HavingBlock()]) as squel.Select)
  }

  // @override
  public toJson(): IGroupBy {
    const result: IGroupBy = { expressions: this.expressions.map(expression => expression.toJson()) }
    if (this.$having) result.$having = this.$having.toJson()
    return result
  }
}
