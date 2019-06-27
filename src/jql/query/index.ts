import squel = require('squel')
import { IJql, Jql } from '..'
import { checkNull } from '../../utils/check'
import { ConditionalExpression, IConditionalExpression } from '../expr'
import { AndExpressions } from '../expr/expressions/AndExpressions'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { FunctionExpression } from '../expr/expressions/FunctionExpression'
import { parse } from '../expr/parse'
import { FromTable, IFromTable } from './FromTable'
import { GroupBy, IGroupBy } from './GroupBy'
import { ILimitOffset, LimitOffset } from './LimitOffset'
import { IOrderBy, OrderBy } from './OrderBy'
import { IResultColumn, ResultColumn } from './ResultColumn'

/**
 * Raw JQL for SELECT query
 */
export interface IQuery extends IJql {
  /**
   * Use SELECT DISTINCT instead
   */
  $distinct?: boolean

  /**
   * SELECT ...
   */
  $select?: IResultColumn[]|IResultColumn|string

  /**
   * FROM ...
   */
  $from?: IFromTable[]|IFromTable|string

  /**
   * WHERE ...
   */
  $where?: IConditionalExpression[]|IConditionalExpression

  /**
   * GROUP BY ... HAVING ...
   */
  $group?: IGroupBy|string

  /**
   * ORDER BY ...
   */
  $order?: IOrderBy[]|IOrderBy|string

  /**
   * LIMIT ... OFFSET ...
   */
  $limit?: ILimitOffset|number
}

/**
 * JQL class for SELECT query
 */
export class Query extends Jql implements IQuery {
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from?: FromTable[]
  public $where?: ConditionalExpression
  public $group?: GroupBy
  public $order?: OrderBy[]
  public $limit?: LimitOffset

  /**
   * @param json [IQuery]
   */
  constructor(json: IQuery)

  /**
   * @param $select [Array<IResultColumn>]
   * @param $from [IFromTable|string]
   * @param $where [Array<IConditionalExpression>] optional
   */
  constructor($select: IResultColumn[], $from: IFromTable|string, ...$where: IConditionalExpression[])

  /**
   * @param database [string|null]
   * @param table [string]
   */
  constructor(database: string|null, table: string)

  /**
   * @param table [string]
   */
  constructor(table: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let $distinct: boolean|undefined
    let $select: IResultColumn[]|IResultColumn|string = '*'
    let $from: IFromTable[]|IFromTable|string|undefined
    let $where: IConditionalExpression[]|IConditionalExpression|undefined
    let $group: IGroupBy|string|undefined
    let $order: IOrderBy[]|IOrderBy|string|undefined
    let $limit: ILimitOffset|number|undefined
    if (typeof args[0] === 'object' && args[0] !== null) {
      const json = args[0] as IQuery
      $distinct = json.$distinct
      $select = json.$select || '*'
      $from = json.$from
      $where = json.$where
      $group = json.$group
      $order = json.$order
      $limit = json.$limit
    }
    else if (Array.isArray(args[0])) {
      $select = args[0]
      $from = args[1]
      $where = args.slice(2)
    }
    else if (args.length === 2) {
      $from = { database: args[0] || undefined, table: args[1] }
    }
    else {
      $from = args[0]
    }

    // $distinct
    this.$distinct = $distinct

    // $select
    if (!Array.isArray($select)) {
      if (typeof $select === 'string') $select = new ResultColumn($select)
      $select = [$select]
    }
    this.$select = $select.map(json => new ResultColumn(json))

    // $from
    if ($from) {
      if (!Array.isArray($from)) {
        if (typeof $from === 'string') $from = { table: $from }
        $from = [$from]
      }
      this.$from = $from.map(json => new FromTable(json))
    }

    // $where
    if ($where) this.$where = Array.isArray($where) ? new AndExpressions($where) : parse($where) as ConditionalExpression

    // $group
    if ($group) {
      if (typeof $group === 'string') $group = { expressions: new ColumnExpression($group) }
      this.$group = new GroupBy($group)
    }

    // $order
    if ($order) {
      if (!Array.isArray($order)) {
        if (typeof $order === 'string') $order = { expression: new ColumnExpression($order) }
        $order = [$order]
      }
      this.$order = $order.map(json => new OrderBy(json))
    }

    // $limit
    if ($limit) {
      if (typeof $limit === 'number') $limit = { $limit }
      this.$limit = new LimitOffset($limit)
    }
  }

  /**
   * Whether the query returns all columns
   */
  get isWildcard(): boolean {
    return this.$select.length === 1 && this.$select[0].expression instanceof ColumnExpression && this.$select[0].expression.isWildcard
  }

  /**
   * Whether the query returns result length
   */
  get isCountWildcard(): boolean {
    return (
      this.$select.length === 1 && this.$select[0].expression instanceof FunctionExpression && this.$select[0].expression.name === 'COUNT' && // count function
      this.$select[0].expression.parameters.length === 1 &&                                                                                   // one parameter
      checkNull(this.$select[0].expression.parameters[0].prefix)                                                                              // no DISTINCT
    )
  }

  /**
   * Whether this should be a quick query
   */
  get isQuick(): boolean {
    return (
      this.isWildcard &&                                                                              // wildcard
      !!this.$from && this.$from.length === 1 && !this.$from[0].isJoined &&                           // single table
      !this.$where && !this.$group &&                                                                 // no WHERE and GROUP BY
      (!this.$order || !this.$order.find(({ expression }) => expression instanceof ColumnExpression)) // simple ORDER BY
    )
  }

  /**
   * Whether this should be a quick COUNT query
   */
  get isQuickCount(): boolean {
    return (
      this.isCountWildcard &&                                                                         // count wildcard
      !!this.$from && this.$from.length === 1 && !this.$from[0].isJoined &&                           // single table
      !this.$where && !this.$group &&                                                                 // no WHERE and GROUP BY
      (!this.$order || !this.$order.find(({ expression }) => expression instanceof ColumnExpression)) // simple ORDER BY
    )
  }

  /**
   * Whether some processes for this query can be skipped
   */
  get hasShortcut(): boolean {
    return (
      !this.$distinct &&  // no DISTINCT
      !this.$group &&     // no GROUP BY
      !this.$order &&     // no ORDER BY
      !!this.$limit       // has LIMIT OFFSET
    )
  }

  // @override
  public validate(availableTables: string[] = []): void {
    if (this.$from) for (const table of this.$from) table.validate(availableTables)
    if (this.$select) for (const resultColumn of this.$select) resultColumn.validate(availableTables)
    if (this.$where) this.$where.validate(availableTables)
    if (this.$group) this.$group.validate(availableTables)
    if (this.$order) for (const order of this.$order) order.validate(availableTables)
    if (this.$limit) this.$limit.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Select {
    let builder = squel.select()
    if (this.$from) for (const table of this.$from) builder = table.apply(builder)
    if (!this.isWildcard) for (const { expression, $as } of this.$select) builder = builder.field(expression.toSquel(), $as)
    if (this.$where) builder = builder.where(this.$where.toSquel(false))
    if (this.$group) builder = this.$group.apply(builder)
    if (this.$order) {
      for (const { expression, order } of this.$order) {
        const { text, values } = expression.toSquel().toParam()
        builder = builder.order(text, order === 'ASC', ...values)
      }
    }
    if (this.$limit) builder = squel.select({}, [...builder.blocks, new squel.cls.StringBlock({}, this.$limit.toString())]) as squel.Select
    return builder
  }

  // @override
  public toJson(): IQuery {
    const result: IQuery = {}
    if (this.$distinct) result.$distinct = true
    if (this.$select.length) result.$select = this.$select.map(resultColumn => resultColumn.toJson())
    if (this.$from) result.$from = this.$from.map(fromTable => fromTable.toJson())
    if (this.$where) result.$where = this.$where.toJson()
    if (this.$group) result.$group = this.$group.toJson()
    if (this.$order) result.$order = this.$order.map(orderBy => orderBy.toJson())
    if (this.$limit) result.$limit = this.$limit.toJson()
    return result
  }
}