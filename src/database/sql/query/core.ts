import uuid = require('uuid/v4')
import { createReadonly } from '../../../utils/create'
import { JQLError } from '../../../utils/error'
import { Column, RealTable, Table } from '../../schema'
import { Transaction } from '../../transaction'
import { CompiledBetweenExpression } from '../expression/between'
import { CompiledBinaryExpression } from '../expression/binary'
import { CompiledCaseExpression } from '../expression/case'
import { ColumnExpression } from '../expression/column'
import { CompiledExpression, Expression, IConditionalExpression } from '../expression/core'
import { CompiledExistsExpression } from '../expression/exists'
import { CompiledFunctionExpression } from '../expression/function'
import { AndExpressions, CompiledGroupedExpressions } from '../expression/grouped'
import { CompiledInExpression } from '../expression/in'
import { CompiledIsNullExpression } from '../expression/isNull'
import { CompiledLikeExpression } from '../expression/like'
import { CompiledUnknownExpression } from '../expression/unknown'
import { parseExpression } from '../expression/utils'
import { CompiledSql, ICompileOptions, ICompileSqlOptions, Sql } from './base'
import { CompiledGroupBy, GroupBy, IGroupBy } from './groupBy'
import { ILimit } from './limit'
import { CompiledOrderingTerm, IOrderingTerm, OrderingTerm } from './orderingTerm'
import { CompiledResultColumn, IResultColumn, ResultColumn } from './resultColumn'
import { CompiledTableOrSubquery, ITableOrSubquery, TableOrSubquery } from './tableOrSubquery'

export function isIQuery(object: any): object is IQuery {
  return '$select' in object || '$from' in object
}

export interface IQuery {
  $distinct?: boolean
  $select?: IResultColumn[]|IResultColumn
  $from?: ITableOrSubquery[]|ITableOrSubquery
  $where?: IConditionalExpression[]|IConditionalExpression
  $group?: IGroupBy
  $order?: IOrderingTerm[]|IOrderingTerm
  $limit?: ILimit
}

export class Query extends Sql implements IQuery {
  public $distinct?: boolean
  public $select: ResultColumn[]
  public $from?: TableOrSubquery[]
  public $where?: Expression
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
      if (!Array.isArray($select)) $select = [$select]
      this.$select = $select.map((json) => new ResultColumn(json))

      // $from
      let $from = json.$from
      if ($from) {
        if (!Array.isArray($from)) $from = [$from]
        this.$from = $from.map((json) => new TableOrSubquery(json))
      }

      // $where
      const $where = json.$where
      if ($where) {
        this.$where = Array.isArray($where) ? new AndExpressions({ expressions: $where }) : parseExpression($where)
      }

      // $group
      const $group = json.$group
      if ($group) {
        this.$group = new GroupBy($group)
      }

      // $order
      let $order = json.$order
      if ($order) {
        if (!Array.isArray($order)) $order = [$order]
        this.$order = $order.map((json) => new OrderingTerm(json))
      }

      // $limit
      this.$limit = json.$limit
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
}

export class CompiledQuery extends CompiledSql {
  public readonly $distinct?: boolean
  public readonly $select: CompiledResultColumn[]
  public readonly $from: CompiledTableOrSubquery[]
  public readonly $where: CompiledExpression
  public readonly $group: CompiledGroupBy
  public readonly $order: CompiledOrderingTerm[]
  public readonly $limit?: ILimit

  // schema of the resultset
  public readonly resultsetSchema: Table

  // tables involved
  public readonly tables: RealTable[]

  // unknowns
  public readonly unknowns: CompiledUnknownExpression[] = []

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
    this.$select = $select.map((resultColumn) => new CompiledResultColumn(transaction, {
      ...options,
      tables: this.tables,
      parent: resultColumn,
    }))
    for (const resultColumn of this.$select) this.analyze(resultColumn)

    // get resultset schema
    const resultsetSchema = this.resultsetSchema = new Table(options.$as || uuid())
    for (const { $as, expression, type, symbol } of this.$select) {
      resultsetSchema.addColumn(new Column($as || expression.toString(), type, symbol))
    }

    // analyze $from
    for (const tableOrSubquery of this.$from) this.analyze(tableOrSubquery)

    // compile $where
    if (options.parent.$where) {
      this.$where = options.parent.$where.compile(transaction, {
        ...options,
        tables: this.tables,
      })
      this.analyze(this.$where)
    }

    // compile $group
    if (options.parent.$group) {
      this.$group = new CompiledGroupBy(transaction, {
        ...options,
        tables: this.tables,
        parent: options.parent.$group,
      })
      this.analyze(this.$group)
    }

    // compile $order
    if (options.parent.$order) {
      this.$order = options.parent.$order.map((orderingTerm) => new CompiledOrderingTerm(transaction, {
        ...options,
        tables: this.tables,
        parent: orderingTerm,
      }))
      for (const orderingTerm of this.$order) this.analyze(orderingTerm)
    }

    // $limit
    this.$limit = createReadonly(options.parent.$limit)
  }

  // @override
  public compile(transaction: Transaction): CompiledQuery {
    return super.compile(transaction) as CompiledQuery
  }

  private analyze(sql: CompiledSql|CompiledResultColumn|CompiledTableOrSubquery|CompiledGroupBy|CompiledOrderingTerm, unknowns: CompiledUnknownExpression[] = this.unknowns) {
    if (sql instanceof CompiledQuery) {
      unknowns.push(...sql.unknowns)
    }
    else if (sql instanceof CompiledResultColumn || sql instanceof CompiledOrderingTerm) {
      this.analyze(sql.expression, unknowns)
    }
    else if (sql instanceof CompiledTableOrSubquery) {
      if (sql.table instanceof CompiledQuery) {
        this.analyze(sql.table, unknowns)
      }
    }
    else if (sql instanceof CompiledGroupBy) {
      for (const expression of sql.expressions) {
        this.analyze(expression, unknowns)
      }
      if (sql.$having) this.analyze(sql.$having, unknowns)
    }
    else if (sql instanceof CompiledBetweenExpression) {
      this.analyze(sql.left, unknowns)
      this.analyze(sql.start, unknowns)
      this.analyze(sql.end, unknowns)
    }
    else if (sql instanceof CompiledBinaryExpression || sql instanceof CompiledInExpression || sql instanceof CompiledLikeExpression) {
      this.analyze(sql.left, unknowns)
      this.analyze(sql.right, unknowns)
    }
    else if (sql instanceof CompiledCaseExpression) {
      for (const case_ of sql.cases) {
        this.analyze(case_.$when, unknowns)
        this.analyze(case_.$then, unknowns)
      }
      if (sql.$else) this.analyze(sql.$else)
    }
    else if (sql instanceof CompiledExistsExpression) {
      this.analyze(sql.query, unknowns)
    }
    else if (sql instanceof CompiledFunctionExpression) {
      for (const parameter of sql.parameters) {
        this.analyze(parameter, unknowns)
      }
    }
    else if (sql instanceof CompiledGroupedExpressions) {
      for (const expression of sql.expressions) {
        this.analyze(expression, unknowns)
      }
    }
    else if (sql instanceof CompiledIsNullExpression) {
      this.analyze(sql.left, unknowns)
    }
    else if (sql instanceof CompiledUnknownExpression) {
      unknowns.push(sql)
    }
  }
}
