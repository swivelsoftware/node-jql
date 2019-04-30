import squel = require('squel')
import { ConditionalExpression, IConditionalExpression } from '../expression'
import { ColumnExpression } from '../expression/column'
import { AndExpressions } from '../expression/grouped'
import { parse } from '../expression/parse'
import { Sql } from '../Sql'
import { InstantiateError } from '../utils/error/InstantiateError'
import { GroupBy, IGroupBy } from './groupBy'
import { IOrderingTerm, OrderingTerm } from './orderingTerm'
import { IResultColumn, ResultColumn } from './resultColumn'
import { IJoinedTableOrSubquery, isJoinedTableOrSubquery, ITableOrSubquery, JoinedTableOrSubquery, TableOrSubquery } from './tableOrSubquery'

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
