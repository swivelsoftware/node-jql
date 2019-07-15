import { AxiosRequestConfig } from 'axios'
import squel from 'squel'
import { IJQL, IParseable, JQL } from '..'
import { Type } from '../../Type'
import { ConditionalExpression, IConditionalExpression } from '../expr'
import { AndExpressions } from '../expr/expressions/AndExpressions'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { FunctionExpression } from '../expr/expressions/FunctionExpression'
import { parse } from '../expr/parse'
import { GroupBy, IGroupBy } from './GroupBy'
import { ILimitOffset, LimitOffset } from './LimitOffset'
import { IOrderBy, OrderBy } from './OrderBy'
import { IResultColumn, ResultColumn } from './ResultColumn'

/**
 * Raw JQL for SELECT query
 */
export interface IQuery extends IJQL, IParseable {
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

  /**
   * Link queries with UNION
   */
  $union?: IQuery
}

/**
 * JQL class for SELECT query
 */
export class Query extends JQL implements IQuery {
  public readonly classname = Query.name
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from?: FromTable[]
  public $where?: ConditionalExpression
  public $group?: GroupBy
  public $order?: OrderBy[]
  public $limit?: LimitOffset
  public $union?: Query

  /**
   * @param json [Partial<IQuery>]
   */
  constructor(json: Partial<IQuery>)

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
    let $union: IQuery|undefined
    if (Array.isArray(args[0])) {
      $select = args[0]
      $from = args[1]
      $where = args.slice(2)
    }
    else if (typeof args[0] === 'object' && args[0] !== null) {
      const json = args[0] as Partial<IQuery>
      $distinct = json.$distinct
      $select = json.$select || '*'
      $from = json.$from
      $where = json.$where
      $group = json.$group
      $order = json.$order
      $limit = json.$limit
      $union = json.$union
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

    // $union
    if ($union) this.$union = new Query($union)
  }

  /**
   * Whether the query returns all columns
   */
  get isSimpleWildcard(): boolean {
    return this.$select.length === 1 && this.$select[0].expression instanceof ColumnExpression && !this.$select[0].expression.table && this.$select[0].expression.isWildcard
  }

  /**
   * Whether the query returns result length
   */
  get isSimpleCountWildcard(): boolean {
    return this.$select.length === 1 && this.$select[0].expression instanceof FunctionExpression && this.$select[0].expression.isSimpleCount
  }

  /**
   * Whether this should be a quick query
   */
  get isQuick(): boolean {
    return (
      this.isSimpleWildcard &&                                                                        // wildcard
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
      this.isSimpleCountWildcard &&                                                                   // count wildcard
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
    if (this.$union) this.$union.validate()
  }

  // @override
  public toSquel(): squel.Select {
    let builder = squel.select()
    if (this.$from) for (const table of this.$from) builder = table.apply(builder)
    if (!this.isSimpleWildcard) for (const { expression, $as } of this.$select) builder = builder.field(expression.toSquel(), $as)
    if (this.$where) builder = builder.where(this.$where.toSquel(false))
    if (this.$group) builder = this.$group.apply(builder)
    if (this.$order) {
      for (const { expression, order } of this.$order) {
        const { text, values } = expression.toSquel().toParam()
        builder = builder.order(text, order === 'ASC', ...values)
      }
    }
    if (this.$limit) builder = squel.select({}, [...builder.blocks, new squel.cls.StringBlock({}, this.$limit.toString())]) as squel.Select
    if (this.$union) builder = builder.union(this.$union.toSquel())
    return builder
  }

  // @override
  public toJson(): IQuery {
    const result: IQuery = { classname: this.classname }
    if (this.$distinct) result.$distinct = true
    if (this.$select.length) result.$select = this.$select.map(resultColumn => resultColumn.toJson())
    if (this.$from) result.$from = this.$from.map(fromTable => fromTable.toJson())
    if (this.$where) result.$where = this.$where.toJson()
    if (this.$group) result.$group = this.$group.toJson()
    if (this.$order) result.$order = this.$order.map(orderBy => orderBy.toJson())
    if (this.$limit) result.$limit = this.$limit.toJson()
    if (this.$union) result.$union = this.$union.toJson()
    return result
  }
}

/**
 * Join operator for table
 */
export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

/**
 * Raw JQL defining join clause
 */
export interface IJoinClause extends IJQL {
  /**
   * Join operator
   */
  operator?: JoinOperator

  /**
   * Table for joining
   */
  table: IFromTable|string

  /**
   * Joining condition
   */
  $on?: IConditionalExpression[]|IConditionalExpression
}

/**
 * JQL class defining join clause
 */
export class JoinClause extends JQL implements IJoinClause {
  public operator: JoinOperator
  public table: FromTable
  public $on?: ConditionalExpression

  /**
   * @param json [IFromTable]
   */
  constructor(json: IJoinClause)

  /**
   * @param operator [JoinOperator]
   * @param table [IFromTable|string]
   * @param $on [Array<ConditionalExpression>] optional
   */
  constructor(operator: JoinOperator, table: IFromTable|string, ...$on: IConditionalExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let operator: JoinOperator, table: IFromTable|string, $on: IConditionalExpression[]|undefined
    if (args.length === 1) {
      const json = args[0] as IJoinClause
      operator = json.operator || 'INNER'
      table = json.table
      if (json.$on) $on = Array.isArray(json.$on) ? json.$on : [json.$on]
    }
    else {
      operator = args[0]
      table = args[1]
      $on = args.slice(2)
    }

    // check args
    if (operator === 'CROSS' && $on && $on.length) throw new SyntaxError('CROSS JOIN should not be used with ON conditions')
    if (operator !== 'CROSS' && (!$on || !$on.length)) throw new SyntaxError(`ON condition(s) is required for ${operator} JOIN`)

    // set args
    this.operator = operator
    this.table = typeof table === 'string' ? new FromTable(table) : new FromTable(table)
    if ($on) this.$on = $on.length > 1 ? new AndExpressions($on) : parse<ConditionalExpression>($on[0])
  }

  private get joinMethod(): string {
    switch (this.operator) {
      case 'CROSS':
        return 'cross_join'
      case 'FULL':
        return 'outer_join'
      case 'INNER':
        return 'join'
      case 'LEFT':
        return 'left_join'
      case 'RIGHT':
        return 'right_join'
    }
  }

  // @override
  get [Symbol.toStringTag](): string {
    return FromTable.name
  }

  /**
   * Apply join clause to query builder
   * @param builder [squel.Select]
   */
  public apply(builder: squel.Select): squel.Select {
    const { database, table, $as } = this.table
    if (typeof table === 'string') {
      return builder[this.joinMethod](`${database ? `${database}.` : ''}${table}`, $as, this.$on && this.$on.toSquel())
    }
    else if (table instanceof Query) {
      return builder[this.joinMethod](table.toSquel(), $as, this.$on && this.$on.toSquel())
    }
    else {
      return builder[this.joinMethod](`${table.method || 'GET'}(${table.url})`, $as, this.$on && this.$on.toSquel())
    }
  }

  // @override
  public validate(availableTables: string[]): void {
    this.table.validate([])
    if (this.$on) this.$on.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    return this.apply(squel.select({}, [new squel.cls.JoinBlock()]) as squel.Select)
  }

  // @override
  public toJson(): IJoinClause {
    const result = {
      operator: this.operator,
      table: this.table.toJson(),
    } as IJoinClause
    if (this.$on) result.$on = this.$on.toJson()
    return result
  }
}

/**
 * Raw JQL defining tables for query
 */
export interface IFromTable extends IJQL {
  /**
   * Database where the table is in
   */
  database?: string

  /**
   * Table definition
   */
  table: string|IQuery|IRemoteTable

  /**
   * Alias table name
   */
  $as?: string

  /**
   * Join clauses
   */
  joinClauses?: IJoinClause[]|IJoinClause
}

/**
 * Raw JQL defining remote table through API
 */
export interface IRemoteTable extends AxiosRequestConfig {
  /**
   * Result structure
   */
  columns: Array<{ name: string, type?: Type }>
}

/**
 * JQL class defining tables for query
 */
export class FromTable extends JQL implements IFromTable {
  public database?: string
  public table: string|Query|IRemoteTable
  public $as?: string
  public joinClauses: JoinClause[] = []

  /**
   * @param json [IFromTable]
   */
  constructor(json: IFromTable)

  /**
   * @param table [string|Array<string>]
   * @param joinClauses [Array<IJoinClause>] optional
   */
  constructor(table: string|[string, string], ...joinClauses: IJoinClause[])

  /**
   * @param table [string|IQuery|IRemoteTable|Array<string>]
   * @param $as [string]
   * @param joinClauses [Array<IJoinClause>] optional
   */
  constructor(table: string|IQuery|IRemoteTable|[string, string], $as: string, ...joinClauses: IJoinClause[])

  constructor(...args: any[]) {
    super()

    // parse args
    let database: string|undefined, table: string|IQuery|IRemoteTable, $as: string|undefined, joinClauses: IJoinClause[]
    if (args.length === 1 && typeof args[0] === 'object') {
      const json = args[0] as IFromTable
      database = json.database
      table = json.table
      $as = json.$as
      json.joinClauses = json.joinClauses || []
      joinClauses = Array.isArray(json.joinClauses) ? json.joinClauses : [json.joinClauses]
    }
    else if (typeof args[1] === 'string') {
      database = Array.isArray(args[0]) ? args[0][0] : undefined
      table = Array.isArray(args[0]) ? args[0][1] : args[0]
      $as = args[1]
      joinClauses = args.slice(2)
    }
    else {
      database = Array.isArray(args[0]) && args[0].length === 2 ? args[0][0] : undefined
      table = Array.isArray(args[0]) ? args[0].length === 2 ? args[0][1] : args[0][0] : args[0]
      joinClauses = args.slice(1)
    }

    // check args
    if (Array.isArray(table)) throw new SyntaxError(`Invalid table ${JSON.stringify(table)}`)
    if (typeof table !== 'string' && !$as) throw new SyntaxError('Missing alias name')

    // set args
    this.database = database
    this.table = typeof table === 'string' || 'columns' in table ? table : new Query(table)
    this.$as = $as
    if (joinClauses.length > 0) this.joinClauses = joinClauses.map(json => new JoinClause(json))
  }

  get isJoined(): boolean {
    return this.joinClauses.length > 0
  }

  // @override
  get [Symbol.toStringTag](): string {
    return FromTable.name
  }

  /**
   * Apply table to query builder
   * @param builder [squel.Select]
   */
  public apply(builder: squel.Select): squel.Select {
    if (typeof this.table === 'string') {
      builder = builder.from(`${this.database ? `${this.database}.` : ''}${this.table}`, this.$as)
    }
    else if (this.table instanceof Query) {
      builder = builder.from(this.table.toSquel(), this.$as)
    }
    else {
      builder = builder.from(`${this.table.method || 'GET'}(${this.table.url})`, this.$as)
    }
    for (const joinClause of this.joinClauses) joinClause.apply(builder)
    return builder
  }

  // @override
  public validate(availableTables: string[]): void {
    if (typeof this.table !== 'string' && 'validate' in this.table) this.table.validate(availableTables)
    const table = this.$as ? this.$as : this.table as string
    if (availableTables.indexOf(table) > -1) throw new SyntaxError(`Duplicate table name ${table}`)
    availableTables.push(table)
    for (const { table } of this.joinClauses) table.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    return this.apply(squel.select({}, [new squel.cls.FromTableBlock(), new squel.cls.JoinBlock()]) as squel.Select)
  }

  // @override
  public toJson(): IFromTable {
    const result: IFromTable = { table: this.table }
    if (this.database) result.database = this.database
    if (this.$as) result.$as = this.$as
    if (this.joinClauses.length) result.joinClauses = this.joinClauses.map(jql => jql.toJson())
    return result
  }
}
