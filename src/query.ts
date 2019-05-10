import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from './expression'
import { ColumnExpression } from './expression/column'
import { AndExpressions } from './expression/grouped'
import { parse } from './expression/parse'
import { Sql } from './Sql'
import { InstantiateError } from './utils/error/InstantiateError'

export function isQuery(object: any): object is IQuery {
  return '$select' in object || '$from' in object
}

export interface IQuery {
  $distinct?: boolean
  $select?: IResultColumn[]|IResultColumn|string
  $from?: Array<ITableOrSubquery|IJoinedTableOrSubquery>|IJoinedTableOrSubquery|ITableOrSubquery|string
  $where?: IConditionalExpression[]|IConditionalExpression
  $group?: IGroupBy|string
  $order?: IOrderingTerm[]|IOrderingTerm|string
  $limit?: { value: number, $offset?: number }|number
}

export class Query extends Sql {
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from?: TableOrSubquery[]
  public $where?: ConditionalExpression
  public $group?: GroupBy
  public $order?: OrderingTerm[]
  public $limit?: { value: number, $offset?: number }

  constructor(json: IQuery) {
    super()
    try {
      // $distinct
      this.$distinct = json.$distinct

      // $select
      let $select = json.$select
      if (!$select) $select = new ResultColumn({ expression: new ColumnExpression('*') })
      if (!Array.isArray($select)) {
        if (typeof $select === 'string') {
          $select = { expression: new ColumnExpression($select) }
        }
        $select = [$select]
      }
      this.$select = $select.map(json => new ResultColumn(json))

      // $from
      let $from = json.$from
      if ($from) {
        if (!Array.isArray($from)) {
          if (typeof $from === 'string') $from = { table: $from }
          $from = [$from]
        }
        this.$from = $from.map(json => isJoinedTableOrSubquery(json) ? new JoinedTableOrSubquery(json) : new TableOrSubquery(json))
      }

      // $where
      const $where = json.$where
      if ($where) {
        this.$where = Array.isArray($where) ? new AndExpressions({ expressions: $where }) : parse($where) as ConditionalExpression
      }

      // $group
      let $group = json.$group
      if ($group) {
        if (!json.$from) throw new SyntaxError('GROUP BY is useless as FROM is not specified')
        if (typeof $group === 'string') {
          $group = { expressions: new ColumnExpression($group) }
        }
        this.$group = new GroupBy($group)
      }

      // $order
      let $order = json.$order
      if ($order) {
        if (!json.$from) throw new SyntaxError('ORDER BY is useless as FROM is not specified')
        if (!Array.isArray($order)) {
          if (typeof $order === 'string') {
            $order = { expression: new ColumnExpression($order) }
          }
          $order = [$order]
        }
        this.$order = $order.map(json => new OrderingTerm(json))
      }

      // $limit
      if (json.$limit && !json.$from) throw new SyntaxError('LIMIT ... (OFFSET ...) is useless as FROM is not specified')
      this.$limit = typeof json.$limit === 'number' ? { value: json.$limit } : json.$limit
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate Query', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'Query'
  }

  // @override
  public validate(availableTables: string[] = []) {
    // $from
    if (this.$from) {
      const tablesArrays = this.$from.map(tableOrSubquery => tableOrSubquery.validate(availableTables))
      availableTables = availableTables.concat(...tablesArrays)
    }

    // $select
    if (this.$select) {
      for (const resultColumn of this.$select) {
        resultColumn.expression.validate(availableTables)
      }
    }

    // $where
    if (this.$where) {
      this.$where.validate(availableTables)
    }

    // $group
    if (this.$group) {
      for (const expression of this.$group.expressions) {
        expression.validate(availableTables)
      }
      if (this.$group.$having) this.$group.$having.validate(availableTables)
    }

    // $order
    if (this.$order) {
      for (const { expression } of this.$order) expression.validate(availableTables)
    }
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    let query = squel.select()

    // $distinct
    if (this.$distinct) query = query.distinct()

    // $select
    for (const { expression, $as } of this.$select) query = query.field(expression.toSquel(), $as)

    // $from
    if (this.$from) {
      const oneJoinedTable = this.$from.length === 1 && this.$from[0] instanceof JoinedTableOrSubquery
      const noJoinedTable = this.$from.reduce((result, tableOrSubquery) => result && !(tableOrSubquery instanceof JoinedTableOrSubquery), true)

      // no join
      if (noJoinedTable) {
        for (const { table, $as } of this.$from) query = query.from(typeof table === 'string' ? table : table.toSquel(), $as)
      }
      // join to one table
      else if (oneJoinedTable) {
        query = this.join(query, this.$from[0] as JoinedTableOrSubquery)
      }
      // complex join
      else {
        for (const tableOrSubquery of this.$from) {
          if (tableOrSubquery instanceof JoinedTableOrSubquery) {
            query = query.from(this.join(squel.select(), tableOrSubquery))
          }
          else {
            const { table, $as } = tableOrSubquery
            query = query.from(typeof table === 'string' ? table : table.toSquel(), $as)
          }
        }
      }
    }

    // $where
    if (this.$where) {
      query = query.where(this.$where.toSquel())
    }

    // $group
    if (this.$group) {
      for (const expression of this.$group.expressions) query = query.group(expression.toString())
      if (this.$group.$having) query = query.having(this.$group.$having.toSquel())
    }

    // $order
    if (this.$order) {
      for (const { expression, order } of this.$order) {
        const { text, values } = expression.toSquel().toParam()
        query = query.order(text, order === 'ASC', ...values)
      }
    }

    // $limit
    if (this.$limit) {
      query = query.limit(this.$limit.value)
      if (this.$limit.$offset) query = query.offset(this.$limit.$offset)
    }

    return query
  }

  // @override
  public toJson(): IQuery {
    const result: IQuery = {}
    if (this.$distinct) result.$distinct = true
    if (this.$select.length) result.$select = this.$select.map(resultColumn => resultColumn.toJson())
    if (this.$from) result.$from = this.$from.map(tableOrSubquery => tableOrSubquery.toJson())
    if (this.$where) result.$where = this.$where.toJson()
    if (this.$group) result.$group = this.$group.toJson()
    if (this.$order) result.$order = this.$order.map(orderingTerm => orderingTerm.toJson())
    if (this.$limit) result.$limit = this.$limit
    return result
  }

  private join(query: squel.Select, { table, $as, joinClauses }: JoinedTableOrSubquery): squel.Select {
    query = query.from(typeof table === 'string' ? table : table.toSquel(), $as)
    for (const { operator, tableOrSubquery: { table, $as }, $on } of joinClauses) {
      switch (operator) {
        case 'CROSS':
          query = query.cross_join(typeof table === 'string' ? table : table.toSquel(), $as, $on ? $on.toSquel() : undefined)
          break
        case 'FULL':
          query = query.outer_join(typeof table === 'string' ? table : table.toSquel(), $as, $on ? $on.toSquel() : undefined)
          break
        case 'INNER':
          query = query.join(typeof table === 'string' ? table : table.toSquel(), $as, $on ? $on.toSquel() : undefined)
          break
        case 'LEFT':
          query = query.left_join(typeof table === 'string' ? table : table.toSquel(), $as, $on ? $on.toSquel() : undefined)
          break
        case 'RIGHT':
          query = query.right_join(typeof table === 'string' ? table : table.toSquel(), $as, $on ? $on.toSquel() : undefined)
          break
      }
    }
    return query
  }
}

export interface IResultColumn {
  expression: IExpression
  $as?: string
}

export class ResultColumn implements IResultColumn {
  public expression: Expression
  public $as?: string

  constructor(json: IResultColumn) {
    try {
      this.expression = parse(json.expression)
      this.$as = json.$as
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate ResultColumn', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'ResultColumn'
  }

  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    return result
  }
}

export interface ITableOrSubquery {
  database?: string
  table: string|IQuery
  $as?: string
}

export class TableOrSubquery implements ITableOrSubquery {
  public database?: string
  public table: string|Query
  public $as?: string

  constructor(json: [string, string]|ITableOrSubquery) {
    try {
      if (Array.isArray(json)) {
        json = {
          table: json[0],
          $as: json[1],
        }
      }
      if (typeof json.table === 'string' && !json.database) {
        this.table = json.table
      }
      else {
        if (!!json.$as) throw new SyntaxError(`Missing alias for ${this.table}`)
        this.database = json.database
        this.table = typeof json.table === 'string' ? json.table : new Query(json.table)
      }
      this.$as = json.$as
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate TableOrSubquery', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'TableOrSubquery'
  }

  public validate(availableTables: string[]): string[] {
    if (typeof this.table !== 'string') this.table.validate(availableTables)
    const table = this.$as ? this.$as : this.table as string
    if (availableTables.indexOf(table) > -1) throw new SyntaxError(`Ambiguous table '${table}'`)
    return [table]
  }

  public toJson(): ITableOrSubquery {
    const result: ITableOrSubquery = { table: this.table }
    if (this.database) result.database = this.database
    if (this.$as) result.$as = this.$as
    return result
  }
}

export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

export interface IJoinClause {
  operator?: JoinOperator
  tableOrSubquery: ITableOrSubquery|[string, string]|string
  $on?: IConditionalExpression[]|IConditionalExpression
}

export class JoinClause implements IJoinClause {
  public operator: JoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: ConditionalExpression

  constructor(json: IJoinClause) {
    try {
      this.operator = json.operator || 'INNER'
      if (typeof json.tableOrSubquery === 'string') json.tableOrSubquery = { table: json.tableOrSubquery }
      this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
      if (json.$on) this.$on = Array.isArray(json.$on) ? new AndExpressions({ expressions: json.$on }) : parse(json.$on) as ConditionalExpression
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate JoinClause', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'JoinClause'
  }

  public toJson(): IJoinClause {
    const result: IJoinClause = {
      operator: this.operator,
      tableOrSubquery: this.tableOrSubquery.toJson(),
    }
    if (this.$on) result.$on = this.$on.toJson()
    return result
  }
}

export function isJoinedTableOrSubquery(value: ITableOrSubquery): value is IJoinedTableOrSubquery {
  return 'joinClauses' in value
}

export interface IJoinedTableOrSubquery extends ITableOrSubquery {
  joinClauses: IJoinClause[]|IJoinClause
}

export class JoinedTableOrSubquery extends TableOrSubquery implements IJoinedTableOrSubquery {
  public joinClauses: JoinClause[] = []

  constructor(json: IJoinedTableOrSubquery) {
    super(json)
    try {
      let joinClauses = json.joinClauses
      if (!Array.isArray(joinClauses)) joinClauses = [joinClauses]
      this.joinClauses = joinClauses.map(joinClause => new JoinClause(joinClause))
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate JoinedTableOrSubquery', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'JoinedTableOrSubquery'
  }

  // @override
  public validate(availableTables: string[] = []): string[] {
    let tables = super.validate(availableTables)
    for (const joinClause of this.joinClauses) {
      tables = tables.concat(joinClause.tableOrSubquery.validate([...availableTables, ...tables]))
    }
    return tables
  }

  // @override
  public toJson(): IJoinedTableOrSubquery {
    return {
      joinClauses: this.joinClauses.map(joinClause => joinClause.toJson()),
      ...super.toJson(),
    }
  }
}

export interface IGroupBy {
  expressions: IExpression[]|IExpression
  $having?: IConditionalExpression[]|IConditionalExpression
}

export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: ConditionalExpression

  constructor(json: IGroupBy) {
    try {
      let expressions = json.expressions
      if (!Array.isArray(expressions)) expressions = [expressions]
      this.expressions = expressions.map(expression => parse(expression))
      if (json.$having) this.$having = Array.isArray(json.$having) ? new AndExpressions({ expressions: json.$having }) : parse(json.$having) as ConditionalExpression
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate GroupBy', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'GroupBy'
  }

  public toJson(): IGroupBy {
    const result: IGroupBy = { expressions: this.expressions.map(expression => expression.toJson()) }
    if (this.$having) result.$having = this.$having.toJson()
    return result
  }
}

export type Order = 'ASC'|'DESC'

export interface IOrderingTerm {
  expression: IExpression
  order?: Order
}

export class OrderingTerm implements IOrderingTerm {
  public expression: Expression
  public order: Order

  constructor(json: IOrderingTerm) {
    try {
      this.expression = parse(json.expression)
      this.order = json.order || 'ASC'
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate OrderingTerm', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'OrderingTerm'
  }

  public toJson(): IOrderingTerm {
    return {
      expression: this.expression.toJson(),
      order: this.order,
    }
  }
}
