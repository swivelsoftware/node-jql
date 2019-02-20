import squel = require('squel')
import uuid = require('uuid/v4')
import { JQLError } from '../../../utils/error'
import { createReadonly } from '../../../utils/readonly'
import { Column } from '../../schema/column'
import { RealTable, Table, TemporaryTable } from '../../schema/table'
import { Transaction } from '../../transaction'
import { parseExpression } from '../expression'
import { ColumnExpression, CompiledColumnExpression } from '../expression/column'
import { AndExpressions } from '../expression/grouped'
import { CompiledExpression, ConditionalExpression } from '../expression/interface'
import { SymbolExpression } from '../expression/symbol'
import { CompiledUnknownExpression } from '../expression/unknown'
import { CompiledSql, ICompileOptions, ICompileSqlOptions, Sql } from '../interface'
import { CompiledGroupBy, GroupBy } from './groupBy'
import { ILimit, IQuery } from './interface'
import { CompiledOrderingTerm, OrderingTerm } from './orderingTerm'
import { CompiledResultColumn, ResultColumn } from './resultColumn'
import { CompiledTableOrSubquery, TableOrSubquery } from './tableOrSubquery'
import { JoinedTableOrSubquery } from './tableOrSubquery/joined'
import { isJoinedTableOrSubquery } from './tableOrSubquery/interface';

/**
 * query
 * `SELECT ...`
 * `FROM ... JOIN ...`
 * `WHERE ...`
 * `GROUP BY ... HAVING ...`
 * `ORDER BY ...`
 * `LIMIT ... OFFSET ...`
 */
export class Query extends Sql implements IQuery {
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from?: TableOrSubquery[]
  public $where?: ConditionalExpression
  public $group?: GroupBy
  public $order?: OrderingTerm[]
  public $limit?: ILimit

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
          $select = {
            expression: new ColumnExpression({
              name: $select,
            }),
          }
        }
        $select = [$select]
      }
      this.$select = $select.map((json) => new ResultColumn(json))

      // $from
      let $from = json.$from
      if ($from) {
        if (!Array.isArray($from)) {
          if (typeof $from === 'string') $from = { table: $from }
          $from = [$from]
        }
        this.$from = $from.map((json) => isJoinedTableOrSubquery(json) ? new JoinedTableOrSubquery(json) : new TableOrSubquery(json))
      }

      // $where
      const $where = json.$where
      if ($where) {
        this.$where = Array.isArray($where) ? new AndExpressions({ expressions: $where }) : parseExpression($where) as ConditionalExpression
      }

      // $group
      let $group = json.$group
      if ($group) {
        if (typeof $group === 'string') {
          $group = {
            expressions: new ColumnExpression({
              name: $group,
            }),
          }
        }
        this.$group = new GroupBy($group)
      }

      // $order
      let $order = json.$order
      if ($order) {
        if (!Array.isArray($order)) {
          if (typeof $order === 'string') {
            $order = {
              expression: new ColumnExpression({
                name: $order,
              }),
            }
          }
          $order = [$order]
        }
        this.$order = $order.map((json) => new OrderingTerm(json))
      }

      // $limit
      this.$limit = typeof json.$limit === 'number' ? { value: json.$limit } : json.$limit

      // validate
      this.validate()
    }
    catch (e) {
      throw new JQLError('Fail to instantiate Query', e)
    }
  }

  public compile(transaction: Transaction, options?: ICompileOptions): CompiledQuery {
    return new CompiledQuery(transaction, {
      ...options,
      parent: this,
    })
  }

  // further check syntax
  public validate(tables: string[] = []) {
    // check tables/aliases defined
    if (this.$from) {
      const tablesArrays = this.$from.map((tableOrSubquery) => tableOrSubquery.validate(tables))
      tables = tables.concat(...tablesArrays)
    }

    // check $select
    if (this.$select) {
      for (const resultColumn of this.$select) {
        resultColumn.expression.validate(tables)
      }
    }

    // check $where
    if (this.$where) this.$where.validate(tables)

    // check $group
    if (this.$group) {
      for (const expression of this.$group.expressions) {
        expression.validate(tables)
      }
      if (this.$group.$having) this.$group.$having.validate(tables)
    }

    // check $order
    if (this.$order) {
      for (const { expression } of this.$order) expression.validate(tables)
    }
  }

  // @override
  public toSquel(): squel.BaseBuilder {
    let query = squel.select()

    // field
    for (const { expression, $as } of this.$select) query = query.field(expression.toSquel(), $as)

    // from
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

    // where
    if (this.$where) query = query.where(this.$where.toSquel())

    // group & having
    if (this.$group) {
      for (const expression of this.$group.expressions) query = query.group(expression.toString())
      if (this.$group.$having) query = query.having(this.$group.$having.toSquel())
    }

    // order
    if (this.$order) {
      for (const { expression, order } of this.$order) {
        const { text, values } = expression.toSquel().toParam()
        query = query.order(text, order === 'ASC', ...values)
      }
    }

    // limit & offset
    if (this.$limit) {
      query = query.limit(this.$limit.value)
      if (this.$limit.$offset) query = query.offset(this.$limit.$offset)
    }

    return query
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

/**
 * compiled `Query`
 */
export class CompiledQuery extends CompiledSql {
  public readonly $distinct?: boolean
  public readonly $select: CompiledResultColumn[]
  public readonly $from: CompiledTableOrSubquery[]
  public readonly $where?: CompiledExpression
  public readonly $group?: CompiledGroupBy
  public readonly $order?: CompiledOrderingTerm[]
  public readonly $limit?: ILimit

  public readonly resultsetSchema: TemporaryTable             // schema of the resultset
  public readonly tables: RealTable[]                         // tables involved
  public readonly unknowns: CompiledUnknownExpression[] = []  // unknowns

  constructor(transaction: Transaction, options: ICompileSqlOptions<Query>) {
    super(transaction, options)

    // $distinct
    this.$distinct = options.parent.$distinct

    // compile $from to get related tables
    if (options.parent.$from) {
      this.$from = options.parent.$from.map((tableOrSubquery) => new CompiledTableOrSubquery(transaction, {
        ...options,
        parent: tableOrSubquery,
      }))
      this.tables = (options.tables || []).concat(this.$from.map((tableOrSubquery) => tableOrSubquery.compiledSchema))
    }
    else {
      this.tables = options.tables || []
    }

    // break wildcard column first
    const $select = options.parent.$select.reduce<ResultColumn[]>((result, resultColumn, index) => {
      if (resultColumn.expression instanceof ColumnExpression && resultColumn.expression.name === '*') {
        if (!resultColumn.expression.table && index > 0) throw new JQLError('Syntax error: Invalid usage of wildcard operator')
        if (!resultColumn.expression.table && index === 0) {
          for (const table of this.tables) {
            for (const column of table.columns) {
              result.push(new ResultColumn({ expression: new ColumnExpression({ table: table.name, name: column.name }) }))
            }
          }
          return result
        }
        else if (resultColumn.expression.table) {
          const columnExpression = resultColumn.expression
          const table = this.tables.find((table) => table.name === columnExpression.name)
          if (!table) throw new JQLError(`Unknown table '${columnExpression.table}'`)
          for (const column of table.columns) {
            result.push(new ResultColumn({ expression: new ColumnExpression({ table: table.name, name: column.name }) }))
          }
          return result
        }
      }
      result.push(resultColumn)
      return result
    }, [])

    // compile $select
    const symbols: { [key in string]: symbol } = {}
    this.$select = $select.map((resultColumn) => new CompiledResultColumn(transaction, {
      ...options,
      tables: this.tables,
      parent: resultColumn,
    }))
    for (const resultColumn of this.$select) {
      resultColumn.register(this.unknowns)

      // register symbol for later use
      symbols[resultColumn.toString()] = resultColumn.symbol
      if (resultColumn.$as) symbols[resultColumn.$as] = resultColumn.symbol
    }

    // get resultset schema
    const table = new Table(options.$as || uuid())
    for (const { $as, expression, type, symbol } of this.$select) {
      let column: Column
      if (expression instanceof CompiledColumnExpression) {
        column = expression.column
      }
      else {
        column = new Column($as || expression.toString(), type, symbol)
      }
      table.addColumn(column, true)
    }
    this.resultsetSchema = new TemporaryTable(transaction, table)

    // analyze $from
    for (const tableOrSubquery of this.$from) tableOrSubquery.register(this.unknowns)

    // compile $where
    if (options.parent.$where) {
      this.$where = options.parent.$where.compile(transaction, {
        ...options,
        tables: this.tables,
      })
      this.$where.register(this.unknowns)
    }

    // compile $group
    if (options.parent.$group) {
      this.$group = new CompiledGroupBy(transaction, {
        ...options,
        tables: this.tables,
        parent: options.parent.$group,
      }, (expression) => {
        const key = expression.toString()
        const symbol = symbols[key]
        if (!symbol) throw new JQLError(`Grouping Column '${key}' must be a selected field`)
        return new SymbolExpression(expression, symbol)
      })
      this.$group.register(this.unknowns)
    }

    // compile $order
    if (options.parent.$order) {
      this.$order = options.parent.$order.map((orderingTerm) => {
        const key = orderingTerm.expression.toString()
        const symbol = symbols[key]
        return new CompiledOrderingTerm(transaction, {
          ...options,
          tables: this.tables,
          parent: orderingTerm,
        }, symbol)
      })
      for (const orderingTerm of this.$order) orderingTerm.register(this.unknowns)
    }

    // $limit
    if (options.parent.$limit) this.$limit = createReadonly(options.parent.$limit)
  }

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    unknowns.push(...this.unknowns)
  }

  // @override
  public compile(transaction: Transaction): CompiledQuery {
    return super.compile(transaction) as CompiledQuery
  }
}
