import squel = require('squel')
import { Logger } from '../../utils/logger'
import { ISql, Sql } from './index'
import { create } from './interface/expression/create'
import { $and, $between, $binary, $case, $column, $exists, $function, $in, $or, $value, Expression, IExpression } from './interface/expression/index'
import { GroupBy, IGroupBy } from './interface/group-by'
import { IJoinClause, JoinClause } from './interface/join-clause'
import { ILimit, Limit } from './interface/limit'
import { IOrderingTerm, OrderingTerm } from './interface/ordering-term'
import { IResultColumn, ResultColumn } from './interface/result-column'
import { ITableOrSubquery, TableOrSubquery } from './interface/table-or-subquery'

const logger = new Logger(__dirname)

export interface IQuery extends ISql {
  $distinct?: boolean
  $select?: IResultColumn[] | IResultColumn
  $from?: ITableOrSubquery[] | ITableOrSubquery
  $join?: IJoinClause[] | IJoinClause
  $where?: IExpression[] | IExpression
  $group?: IGroupBy
  $order?: IOrderingTerm[] | IOrderingTerm
  $limit?: ILimit
}

export class Query extends Sql implements IQuery {
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from: TableOrSubquery[]
  public $join?: JoinClause[]
  public $where?: Expression
  public $group?: GroupBy
  public $order?: OrderingTerm[]
  public $limit?: Limit

  constructor(json?: IQuery) {
    super(json)
    if (json) {
      this.$distinct = json.$distinct

      let $select = json.$select || { expression: new $column({ name: '*' }) }
      if (!Array.isArray($select)) $select = [$select]
      this.$select = $select.map((resultColumn) => new ResultColumn(resultColumn))

      if (json.$from) {
        let $from = json.$from
        if (!Array.isArray($from)) $from = [$from]
        this.$from = $from.map((tableOrSubquery) => new TableOrSubquery(tableOrSubquery))
      }

      if (!this.$select.length && !this.$from.length) {
        throw new Error(`invalid query. you must specify either $select or $from, or both`)
      }

      if (json.$join) {
        let $join = json.$join
        if (!Array.isArray($join)) $join = [$join]
        this.$join = $join.map((joinClause) => new JoinClause(joinClause))
      }

      if (json.$where) {
        let $where = json.$where
        if (!Array.isArray($where)) $where = [$where]
        this.$where = Array.isArray($where) ? new $and({ expressions: $where }) : create($where)
      }

      if (json.$group) this.$group = new GroupBy(json.$group)

      if (json.$order) {
        let $order = json.$order
        if (!Array.isArray($order)) $order = [$order]
        this.$order = $order.map((orderingTerm) => new OrderingTerm(orderingTerm))
      }

      if (json.$limit) this.$limit = new Limit(json.$limit)
    }
  }

  public validate(): boolean {
    // check $from
    let $from = this.$from
    if (!Array.isArray($from)) $from = [$from]
    const tableAliases = {}
    for (const { $as, name, query } of $from) {
      // check table/alias duplicate
      const tableAlias = ($as || name) as string
      if (tableAliases[tableAlias]) {
        throw new Error(`not unique table/alias '${tableAliases[tableAlias]}'`)
      }
      tableAliases[tableAlias] = true

      // check query
      if (query) { query.validate() }
    }

    // check $join
    if (this.$join) {
      let $join = this.$join
      if (!Array.isArray($join)) $join = [$join]
      for (const { tableOrSubquery: { $as, name, query }, $on, $using } of $join) {
        // check table/alias duplicate
        const tableAlias = ($as || name) as string
        if (tableAliases[tableAlias]) {
          throw new Error(`not unique table/alias '${tableAliases[tableAlias]}'`)
        }
        tableAliases[tableAlias] = true

        // check query
        if (query) query.validate()

        // check $on
        if ($on) this.validateExpression($on, tableAliases)
      }
    }

    // check $select
    let $select = this.$select
    if (!Array.isArray($select)) $select = [$select]
    for (const { expression } of $select) {
      this.validateExpression(expression, tableAliases)
    }

    // check $where
    if (this.$where) this.validateExpression(this.$where, tableAliases)

    // check $group
    if (this.$group) {
      const { expressions, $having } = this.$group
      for (const expression of expressions) this.validateExpression(expression, tableAliases)
      if ($having) this.validateExpression($having, tableAliases)
    }

    return true
  }

  public toSquel(): squel.BaseBuilder {
    let sql = squel.select()

    // from
    const $from = this.$from
    for (const { name, query, $as } of $from) {
      sql = sql.from(query ? query.toSquel() : name as string, $as)
    }

    // select
    const $select = this.$select
    for (const { expression, $as } of $select) {
      sql = sql.field(expression.toSquel(), $as)
    }

    // join
    const $join = this.$join
    if ($join) {
      for (const { operator: { type }, tableOrSubquery: { name, query, $as }, $on } of $join) {
        const table: squel.BaseBuilder | string = query ? query.toSquel() : name as string
        const expression = $on ? $on.toSquel() as squel.Expression : undefined
        switch (type) {
          case 'INNER':
            sql = sql.join(table, $as, expression)
            break
          case 'LEFT':
            sql = sql.left_join(table, $as, expression)
            break
          case 'RIGHT':
            sql = sql.right_join(table, $as, expression)
            break
          case 'FULL':
            sql = sql.outer_join(table, $as, expression)
            break
          default:
            logger.warn(`'${type} JOIN' not supported. Fallback to 'LEFT JOIN'`)
            sql = sql.left_join(table, $as, expression)
        }
      }
    }

    // where
    const $where = this.$where
    if ($where) sql = sql.where($where.toSquel() as squel.Expression)

    // group
    const $group = this.$group
    if ($group) {
      const { expressions, $having } = $group
      for (const expression of expressions) sql = sql.group(expression.toString())
      if ($having) sql = sql.having($having.toSquel() as squel.Expression)
    }

    // order
    const $order = this.$order
    if ($order) {
      for (const { expression, order } of $order) sql = sql.order(expression.toString(), order !== 'DESC')
    }

    // limit
    const $limit = this.$limit
    if ($limit) {
      const { expression, $offset } = $limit
      const count = +expression.toString()
      if (isNaN(count)) throw new Error('Squel.js does not support Limit with expression')
      sql = sql.limit(count)
      if ($offset) {
        const offset = +$offset.toString()
        if (isNaN(offset)) throw new Error('Squel.js does not support Offset with expression')
        sql = sql.offset(count)
      }
    }

    return sql
  }

  private validateExpression(expression: IExpression, tableAliases: { [key in string]: boolean }): boolean {
    if (expression instanceof $and || expression instanceof $or) {
      const { expressions } = expression
      for (const expression of expressions) {
        this.validateExpression(expression, tableAliases)
      }
    }
    else if (expression instanceof $between) {
      const { left, start, end } = expression
      this.validateExpression(left, tableAliases)
      if (start) this.validateExpression(start, tableAliases)
      if (end) this.validateExpression(end, tableAliases)
    }
    else if (expression instanceof $binary) {
      const { left, right } = expression
      this.validateExpression(left, tableAliases)
      if (right) this.validateExpression(right, tableAliases)
    }
    else if (expression instanceof $case) {
      let { cases: $when, $else } = expression
      if (!Array.isArray($when)) $when = [$when]
      for (const { $when: $when_, $then } of $when) {
        this.validateExpression($when_, tableAliases)
        this.validateExpression($then, tableAliases)
      }
      if ($else) this.validateExpression($else, tableAliases)
    }
    else if (expression instanceof $column) {
      const { table, name } = expression
      if (table && !tableAliases[table]) throw new Error(`unknown column \`${table}\`.\`${name}\``)
    }
    else if (expression instanceof $exists) {
      const { query } = expression
      query.validate()
    }
    else if (expression instanceof $function) {
      // no need to precheck
    }
    else if (expression instanceof $in) {
      const { left, query } = expression
      this.validateExpression(left, tableAliases)
      if (query) query.validate()
    }
    else if (expression instanceof $value) {
      // no need to precheck
    }
    else {
      throw new Error(`invalid expression '${expression.classname}'`)
    }
    return true
  }
}
