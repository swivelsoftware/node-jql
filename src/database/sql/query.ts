import { ResultColumn } from "./interface/result-column";
import { TableOrSubquery } from "./interface/table-or-subquery";
import { JoinClause } from "./interface/join-clause";
import { Expression, $between, $binary, $case, $column, $exists, $function, $in, $like, $value, $and, $or } from "./interface/expression/index";
import { GroupBy } from "./interface/group-by";
import { OrderingTerm } from "./interface/ordering-term";
import { Limit } from "./interface/limit";
import { Sql } from "./index";
import { create } from "./interface/expression/__create";

interface QueryJson extends Sql {
  $distinct?: boolean
  $select?: ResultColumn[] | ResultColumn
  $from: TableOrSubquery[] | TableOrSubquery
  $join?: JoinClause[] | JoinClause
  $where?: Expression[] | Expression
  $group?: GroupBy
  $order?: OrderingTerm[] | OrderingTerm
  $limit?: Limit
}

export class Query implements QueryJson {
  $distinct?: boolean
  $select: ResultColumn[]
  $from: TableOrSubquery[]
  $join?: JoinClause[]
  $where?: Expression
  $group?: GroupBy
  $order?: OrderingTerm[]
  $limit?: Limit

  constructor (json?: QueryJson) {
    switch (typeof json) {
      case 'object':
        this.$distinct = json.$distinct

        let $select = json.$select || { expression: { classname: 'column', name: '*' } }
        if (!Array.isArray($select)) $select = [$select]
        this.$select = $select.map(resultColumn => new ResultColumn(resultColumn))

        let $from = json.$from
        if (!Array.isArray($from)) $from = [$from]
        this.$from = $from.map(tableOrSubquery => new TableOrSubquery(tableOrSubquery))

        if (json.$join) {
          let $join = json.$join
          if (!Array.isArray($join)) $join = [$join]
          this.$join = $join.map(joinClause => new JoinClause(joinClause))
        }

        if (json.$where) {
          let $where = json.$where
          if (!Array.isArray($where)) $where = [$where]
          this.$where = Array.isArray($where) ? create({ classname: '$and', expressions: $where }) : create($where)
        }

        if (json.$group) this.$group = new GroupBy(json.$group)

        if (json.$order) {
          let $order = json.$order
          if (!Array.isArray($order)) $order = [$order]
          this.$order = $order.map(orderingTerm => new OrderingTerm(orderingTerm))
        }

        if (json.$limit) this.$limit = new Limit(json.$limit)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'query' object`)
    }
  }

  private validateExpression (expression: Expression, tableAliases: { [key: string]: boolean }): boolean {
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
      let { $when, $else } = expression
      if (!Array.isArray($when)) $when = [$when]
      for (const { $when: $when_, $then } of $when) {
        this.validateExpression($when_, tableAliases)
        this.validateExpression($then, tableAliases)
      }
      if ($else) this.validateExpression($else, tableAliases)
    }
    else if (expression instanceof $column) {
      let { table, name } = expression
      if (table && !tableAliases[table]) throw new Error(`unknown column '${table}.${name}'`)
    }
    else if (expression instanceof $exists) {
      let { query } = expression
      query.validate()
    }
    else if (expression instanceof $function) {
      // no need to precheck
    }
    else if (expression instanceof $in) {
      let { left, query } = expression
      this.validateExpression(left, tableAliases)
      query.validate()
    }
    else if (expression instanceof $like) {
      let { left, right } = expression
      this.validateExpression(left, tableAliases)
      this.validateExpression(right, tableAliases)
    }
    else if (expression instanceof $value) {
      // no need to precheck
    }
    else {
      throw new Error(`invalid expression '${expression.classname}'`)
    }
    return true
  }

  validate (): boolean {
    // check $from
    let $from = this.$from
    if (!Array.isArray($from)) $from = [$from]
    let tableAliases = {}
    for (const { $as, name, query } of $from) {
      // check table/alias duplicate
      const tableAlias = ($as || name) as string
      if (tableAliases[tableAlias]) {
        throw new Error(`not unique table/alias '${tableAliases[tableAlias]}'`)
      }
      tableAliases[tableAlias] = true

      // check query
      if (query) query.validate()
    }

    // check $join
    if (this.$join) {
      let $join = this.$join
      if (!Array.isArray($join)) $join = [$join]
      for (let { tableOrSubquery: { $as, name, query }, $on, $using } of $join) {
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
      let { expressions, $having } = this.$group
      this.validateExpression(expressions, tableAliases)
      if ($having) this.validateExpression($having, tableAliases)
    }

    return true
  }
}