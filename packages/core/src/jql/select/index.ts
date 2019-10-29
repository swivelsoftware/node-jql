import format from 'string-format'
import { JQL } from '..'
import { ConditionalExpression, Expression } from '../expressions'
import { BetweenExpression } from '../expressions/between'
import { BinaryExpression } from '../expressions/binary'
import { CaseExpression } from '../expressions/case'
import { ColumnExpression } from '../expressions/column'
import { ExistsExpression } from '../expressions/exists'
import { FunctionExpression } from '../expressions/function'
import { AndExpressions, OrExpressions } from '../expressions/grouped'
import { IConditionalExpression, IExpression } from '../expressions/index.if'
import { MathExpression } from '../expressions/math'
import { QueryExpression } from '../expressions/query'
import { parse } from '../parse'
import { FromTable } from './fromTable'
import { IFromTable } from './fromTable/index.if'
import { QueryTable, RemoteTable, SchemaTable, Table } from './fromTable/table'
import { IQuery } from './index.if'
import { LimitBy } from './limitBy'
import { ILimitBy } from './limitBy/index.if'
import { OrderBy } from './orderBy'
import { IOrderBy } from './orderBy/index.if'
import { ResultColumn } from './resultColumn'
import { IResultColumn } from './resultColumn/index.if'

/**
 * SELECT ... FROM ...
 */
export class Query extends JQL implements IQuery {
  // @override
  public readonly classname = Query.name

  // @override
  public $distinct = false

  // @override
  public $select: ResultColumn[] = []

  // @override
  public $from: FromTable[] = []

  // @override
  public $group: Expression[] = []

  // @override
  public $having?: ConditionalExpression

  // @override
  public $where?: ConditionalExpression

  // @override
  public $order: OrderBy[] = []

  // @override
  public $limit?: LimitBy

  constructor(json?: IQuery) {
    super()

    if (json) {
      if (json.$distinct) this.setDistinct()
      if (json.$select) for (const r of json.$select) this.select(r)
      if (json.$from) for (const f of json.$from) this.from(f)
      if (json.$group) for (const e of json.$group) this.groupBy(e)
      if (json.$having) this.having(json.$having)
      if (json.$where) this.where(json.$where)
      if (json.$order) for (const o of json.$order) this.orderBy(o)
      if (json.$limit) this.limitBy(json.$limit)
    }
  }

  /**
   * set distinct flag
   * @param flag [boolean]
   */
  public setDistinct(flag = true): Query {
    this.$distinct = flag
    return this
  }

  /**
   * add result column
   * @param resultColumn [IResultColumn]
   */
  public select(resultColumn: IResultColumn): Query {
    this.$select.push(new ResultColumn(resultColumn))
    return this
  }

  /**
   * add table source
   * @param fromTable [IFromTable]
   */
  public from(fromTable: IFromTable): Query {
    this.$from.push(new FromTable(fromTable))
    return this
  }

  /**
   * add column for grouping
   * @param expression [IExpression]
   */
  public groupBy(expression: IExpression): Query {
    this.$group.push(parse(expression))
    return this
  }

  /**
   * set having clause
   * @param expression [IConditionalExpression]
   */
  public having(expression: IConditionalExpression): Query {
    this.$having = parse(expression)
    return this
  }

  /**
   * set where clause
   * @param expression [IConditionalExpression]
   */
  public where(expression: IConditionalExpression): Query {
    this.$where = parse(expression)
    return this
  }

  /**
   * add ordering column
   * @param orderBy [IOrderBy]
   */
  public orderBy(orderBy: IOrderBy): Query {
    this.$order.push(new OrderBy(orderBy))
    return this
  }

  /**
   * set LIMIT OFFSET
   * @param limitBy [LimitBy]
   */
  public limitBy(limitBy: ILimitBy): Query {
    this.$limit = new LimitBy(limitBy)
    return this
  }

  // @override
  public toJson(): IQuery {
    this.check()
    const json = {
      classname: this.classname,
      $distinct: this.$distinct,
      $select: this.$select.map(r => r.toJson()),
      $from: this.$from.map(f => f.toJson()),
      $group: this.$group.map(g => g.toJson()),
      $order: this.$order.map(o => o.toJson()),
    } as IQuery
    if (this.$having) json.$having = this.$having.toJson()
    if (this.$where) json.$where = this.$where.toJson()
    if (this.$limit) json.$limit = this.$limit.toJson()
    return json
  }

  // @override
  public toString(): string {
    this.check()
    let template = this.$distinct ? 'SELECT DISTINCT' : 'SELECT'
    const args: any[] = []
    if (!this.$select.length) {
      template += ' *'
    }
    else {
      template += ' {}'
      args.push(this.$select.map(r => r.expression instanceof ColumnExpression ? r.toString(true) : r.toString()).join(', '))
    }
    if (this.$from.length) {
      template += ' FROM {}'
      args.push(this.$from.map(f => f.toString()).join(', '))
    }
    if (this.$group.length) {
      template += ' GROUP BY {}'
      args.push(this.$group.map(g => g.toString()).join(', '))
    }
    if (this.$having) {
      template += ' HAVING {}'
      args.push(this.$having.toString())
    }
    if (this.$where) {
      template += ' WHERE {}'
      args.push(this.$where.toString())
    }
    if (this.$order.length) {
      template += ' ORDER BY {}'
      args.push(this.$order.map(o => o.toString()).join(', '))
    }
    if (this.$limit) {
      template += ' LIMIT {}'
      args.push(this.$limit.$limit)

      if (this.$limit.$offset) {
        template += ' OFFSET {}'
        args.push(this.$limit.$offset)
      }
    }
    return format(template, ...args)
  }

  /**
   * convert to Expression
   */
  public toExpression(): QueryExpression {
    this.check()
    return new QueryExpression(this)
  }

  /**
   * validate the query
   */
  public check(tables: string[] = []): void {
    if (!this.$select.length && !this.$from.length) throw new SyntaxError('Missing data source. Please specify either SELECT or FROM')
    if (this.$having && !this.$group.length) throw new SyntaxError('Invalid use of HAVING without GROUP BY')

    for (const { table, joinClauses } of this.$from) {
      this.registerTable(tables, table)

      for (const { table, $on } of joinClauses) {
        this.registerTable(tables, table)
        this.checkExpr(tables, $on)
      }
    }

    for (const { expression } of this.$select) {
      this.checkExpr(tables, expression)
    }

    for (const expr of this.$group) {
      this.checkExpr(tables, expr)
    }

    if (this.$having) {
      this.checkExpr(tables, this.$having)
    }

    if (this.$where) {
      this.checkExpr(tables, this.$where)
    }

    for (const { expression } of this.$order) {
      this.checkExpr(tables, expression)
    }
  }

  private registerTable(tables: string[], table: Table): void {
    if (table instanceof QueryTable || table instanceof RemoteTable) {
      tables.push(table.$as as string)
    }
    else if (table instanceof SchemaTable) {
      tables.push(table.$as || table.table)
    }
  }

  private checkExpr(tables: string[], expression: Expression): void {
    if (expression instanceof BetweenExpression) {
      this.checkExpr(tables, expression.left)
      this.checkExpr(tables, expression.start)
      this.checkExpr(tables, expression.end)
    }
    else if (expression instanceof BinaryExpression || expression instanceof MathExpression) {
      this.checkExpr(tables, expression.left)
      this.checkExpr(tables, expression.right)
    }
    else if (expression instanceof CaseExpression) {
      for (const { $when, $then } of expression.cases) {
        this.checkExpr(tables, $when)
        this.checkExpr(tables, $then)
      }
      if (expression.$else) this.checkExpr(tables, expression.$else)
    }
    else if (expression instanceof ColumnExpression) {
      if (expression.table && tables.indexOf(expression.table) === -1) {
        throw new SyntaxError(`Unknown table \`${expression.table}\``)
      }
      else if (expression.isWildcard && !tables.length) {
        throw new SyntaxError(`Invalid use of wildcard columns without tables`)
      }
    }
    else if (expression instanceof ExistsExpression) {
      this.checkExpr(tables, expression.query)
    }
    else if (expression instanceof FunctionExpression) {
      for (const expr of expression.parameters) {
        this.checkExpr(tables, expr)
      }
    }
    else if (expression instanceof AndExpressions || expression instanceof OrExpressions) {
      for (const expr of expression.expressions) {
        this.checkExpr(tables, expr)
      }
    }
    else if (expression instanceof QueryExpression) {
      expression.query.check(tables)
    }
  }
}