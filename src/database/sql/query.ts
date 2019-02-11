import squel = require('squel')
import { ISql, Sql } from '.'
import { JQLError } from '../../utils/error'
import { Logger } from '../../utils/logger'
import { $and, $between, $binary, $case, $column, $exists, $function, $in, $isNull, $or, $value, Expression, GroupBy, IExpression, IGroupBy, IJoinClause, ILimit, IOrderingTerm, IResultColumn, ITableOrSubquery, JoinClause, Limit, OrderingTerm, ResultColumn, TableOrSubquery } from './interface'
import { create } from './interface/expression/__create'

const logger = new Logger(__dirname)

function createSetter(index: number, expression: Expression) {
  return (value) => {
    expression.parameters = expression.parameters || []
    expression.parameters[index] = value
  }
}

export interface IQuery extends ISql {
  $distinct?: boolean
  $select?: IResultColumn[]|IResultColumn
  $from?: ITableOrSubquery[]|ITableOrSubquery
  $join?: IJoinClause[]|IJoinClause
  $where?: IExpression[]|IExpression
  $group?: IGroupBy
  $order?: IOrderingTerm[]|IOrderingTerm
  $limit?: ILimit
}

export class Query extends Sql implements IQuery {

  get paramsCount(): number {
    return this.setters.length
  }
  public readonly $distinct?: boolean
  public readonly $select: ResultColumn[]
  public readonly $from?: TableOrSubquery[]
  public readonly $join?: JoinClause[]
  public readonly $where?: Expression
  public readonly $group?: GroupBy
  public readonly $order?: OrderingTerm[]
  public readonly $limit?: Limit

  private readonly setters: Array<(value: any) => void> = []

  constructor(json: IQuery) {
    super(json)

    this.$distinct = json.$distinct

    let $select = json.$select || { expression: new $column({ name: '*' }) }
    if (!Array.isArray($select)) $select = [$select]
    this.$select = $select.map((resultColumn) => {
      const resultColumn_ = new ResultColumn(resultColumn)
      this.analyzeExpression(resultColumn_.expression)
      return resultColumn_
    })

    if (json.$from) {
      let $from = json.$from
      if (!Array.isArray($from)) $from = [$from]
      this.$from = $from.map((tableOrSubquery) => {
        const tableOrSubquery_ = new TableOrSubquery(tableOrSubquery)
        if (tableOrSubquery_.query) this.analyzeQuery(tableOrSubquery_.query)
        return tableOrSubquery_
      })
    }

    if (!this.$select.length && (!this.$from || !this.$from.length)) {
      throw new JQLError(`invalid query. you must specify either $select or $from, or both`)
    }

    if (json.$join) {
      let $join = json.$join
      if (!Array.isArray($join)) $join = [$join]
      this.$join = $join.map((joinClause) => {
        const joinClause_ = new JoinClause(joinClause)
        if (joinClause_.tableOrSubquery.query) this.analyzeQuery(joinClause_.tableOrSubquery.query)
        if (joinClause_.$on) this.analyzeExpression(joinClause_.$on)
        return joinClause_
      })
    }

    if (json.$where) {
      const $where = json.$where
      this.$where = Array.isArray($where) ? new $and({ expressions: $where }) : create($where)
      this.analyzeExpression(this.$where)
    }

    if (json.$group) {
      this.$group = new GroupBy(json.$group)
      for (const expression_ of this.$group.expressions) this.analyzeExpression(expression_)
      if (this.$group.$having) this.analyzeExpression(this.$group.$having)
    }

    if (json.$order) {
      let $order = json.$order
      if (!Array.isArray($order)) $order = [$order]
      this.$order = $order.map((orderingTerm) => {
        const orderingTerm_ = new OrderingTerm(orderingTerm)
        this.analyzeExpression(orderingTerm_.expression)
        return orderingTerm_
      })
    }

    if (json.$limit) {
      this.$limit = new Limit(json.$limit)
      this.analyzeExpression(this.$limit.expression)
      if (this.$limit.$offset) this.analyzeExpression(this.$limit.$offset)
    }
  }

  public isValid(): boolean {
    const tableAliases: { [key: string]: boolean } = {}

    // check $from
    if (this.$from) {
      let $from = this.$from
      if (!Array.isArray($from)) $from = [$from]
      for (const { $as, name, query } of $from) {
        // check table/alias duplicate
        const tableAlias = ($as || name) as string
        if (tableAliases[tableAlias]) {
          throw new JQLError(`not unique table/alias '${tableAliases[tableAlias]}'`)
        }
        tableAliases[tableAlias] = true

        // check query
        if (query) query.isValid()
      }
    }

    // check $join
    if (this.$join) {
      let $join = this.$join
      if (!Array.isArray($join)) $join = [$join]
      for (const { tableOrSubquery: { $as, name, query }, $on } of $join) {
        // check table/alias duplicate
        const tableAlias = ($as || name) as string
        if (tableAliases[tableAlias]) {
          throw new JQLError(`not unique table/alias '${tableAliases[tableAlias]}'`)
        }
        tableAliases[tableAlias] = true

        // check query
        if (query) query.isValid()

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

  public setParam(i: number, value: any) {
    const setter = this.setters[i]
    if (!setter) throw new JQLError(`setter index out of bound: ${i}`)
    setter(value)
  }

  public toSquel(): squel.BaseBuilder {
    let sql = squel.select()

    // from
    if (this.$from) {
      for (const { name, query, $as } of this.$from) {
        sql = sql.from(query ? query.toSquel() : name as string, $as)
      }
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
        const table: squel.BaseBuilder|string = query ? query.toSquel() : name as string
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
      if (isNaN(count)) throw new JQLError('Squel.js does not support Limit with expression')
      sql = sql.limit(count)
      if ($offset) {
        const offset = +$offset.toString()
        if (isNaN(offset)) throw new JQLError('Squel.js does not support Offset with expression')
        sql = sql.offset(count)
      }
    }

    return sql
  }

  private analyzeQuery(query: Query) {
    this.setters.push(...query.setters)
  }

  private analyzeExpression(expression: Expression) {
    let index = 0
    if (expression instanceof $between) {
      const { left, start, end } = expression
      this.analyzeExpression(left)
      if (!start) this.setters.push(createSetter(index++, expression))
      if (!end) this.setters.push(createSetter(index++, expression))
    }
    else if (expression instanceof $binary) {
      const { left, right } = expression
      this.analyzeExpression(left)
      if (!right) this.setters.push(createSetter(index++, expression))
    }
    else if (expression instanceof $case) {
      const { cases, $else } = expression
      for (const { $when, $then } of cases) {
        this.analyzeExpression($when)
        this.analyzeExpression($then)
      }
      if ($else) this.analyzeExpression($else)
    }
    else if (expression instanceof $exists) {
      this.analyzeQuery(expression.query)
    }
    else if (expression instanceof $function) {
      for (const parameter of expression.parameters) {
        this.setters.push(createSetter(index++, expression))
      }
    }
    else if (expression instanceof $and || expression instanceof $or) {
      for (const expression_ of expression.expressions) {
        this.analyzeExpression(expression_)
      }
    }
    else if (expression instanceof $in) {
      const { left, right } = expression
      this.analyzeExpression(left)
      if (right) {
        if (right instanceof Expression) {
          this.analyzeExpression(right)
        }
        else {
          this.analyzeQuery(right)
        }
      }
    }
    else if (expression instanceof $isNull) {
      const { left } = expression
      this.analyzeExpression(left)
    }
    else if (expression instanceof $column || expression instanceof $value) {
      // do nothing
    }
  }

  private validateExpression(expression: IExpression, tableAliases: { [key in string]: boolean }) {
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
      if (table && !tableAliases[table]) throw new JQLError(`unknown column \`${table}\`.\`${name}\``)
    }
    else if (expression instanceof $exists) {
      const { query } = expression
      query.isValid()
    }
    else if (expression instanceof $function) {
      // no need to precheck
    }
    else if (expression instanceof $in) {
      const { left, right } = expression
      this.validateExpression(left, tableAliases)
      if (right && right instanceof Query) right.isValid()
    }
    else if (expression instanceof $isNull) {
      const { left } = expression
      this.validateExpression(left, tableAliases)
    }
    else if (expression instanceof $value) {
      // no need to precheck
    }
    else {
      throw new JQLError(`invalid expression '${expression.classname}'`)
    }
  }
}
