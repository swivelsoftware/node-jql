import _ = require('lodash')
import { Expression } from '../expression'
import { ColumnExpression } from '../expression/column'
import { FunctionExpression } from '../expression/function'
import { GroupExpression } from '../expression/group'
import { IFunctionExpression, IGroupExpression } from '../expression/index.if'
import { IBuilder, IExpression, IStringify } from '../index.if'
import { parse, register } from '../parse'
import { IDatasource, IFromFunctionTable, IFromTable, IGroupBy, IOrderBy, IQuery, IResultColumn } from './index.if'

class Builder implements IBuilder<Query> {
  private json: IQuery = {
    classname: Query.name,
  }

  /**
   * Add result column
   * @param column [IResultColumn]
   */
  public select(column: IResultColumn): Builder {
    if (!this.json.select) this.json.select = []
    this.json.select.push(column)
    return this
  }

  /**
   * Add data source
   * @param source [IDatasource]
   */
  public from(source: IDatasource): Builder {
    if (!this.json.from) this.json.from = []
    this.json.from.push(source)
    return this
  }

  /**
   * Set GROUP BY constraint
   * @param expr [IExpression|string]
   * @param having [IExpression]
   */
  public groupBy(expr: IExpression|string, having?: IExpression): Builder {
    if (typeof expr === 'string') expr = new ColumnExpression(expr)
    this.json.groupBy = { expr, having }
    return this
  }

  /**
   * Add WHERE expression
   * @param expr [IExpression]
   */
  public where(expr: IExpression): Builder {
    if (this.json.where && this.json.where.classname === GroupExpression.name && (this.json.where as IGroupExpression).operator === 'AND') {
      (this.json.where as IGroupExpression).expressions.push(expr)
    }
    else if (this.json.where) {
      this.json.where = new GroupExpression.Builder('AND')
        .expr(this.json.where)
        .expr(expr)
        .toJson()
    }
    else {
      this.json.where = expr
    }
    return this
  }

  /**
   * Add ORDER BY constraint
   * @param expr [IExpression|string]
   * @param order [string]
   */
  public orderBy(expr: IExpression|string, order?: 'ASC'|'DESC'): Builder {
    if (!this.json.orderBy) this.json.orderBy = []
    if (typeof expr === 'string') expr = new ColumnExpression(expr)
    this.json.orderBy.push({ expr, order })
    return this
  }

  // @override
  public build(): Query {
    if (!this.json.select && !this.json.from) throw new SyntaxError('You must specify either 1 result column or 1 datasource')
    return new Query(this.json)
  }

  // @override
  public toJson(): IQuery {
    return _.cloneDeep(this.json)
  }
}

/**
 * Selected result column
 */
export class ResultColumn implements IResultColumn, IStringify {
  public readonly expr: Expression
  public readonly as?: string

  constructor(expr: [string, string]|string|IExpression, as?: string)
  constructor(json: IResultColumn)
  constructor(...args: any[]) {
    if (Array.isArray(args[0]) || typeof args[0] === 'string') {
      this.expr = new ColumnExpression(args[0] as [string, string]|string)
      this.as = args[1]
    }
    else if ('classname' in args[0]) {
      this.expr = parse(args[0])
      this.as = args[1]
    }
    else {
      const json = args[0] as IResultColumn
      this.expr = parse(json.expr)
      if (json.as) this.as = json.as
    }
  }

  // @override
  public toString(): string {
    return `${this.expr.toString()}${this.as ? ` AS \`${this.as}\`` : ''}`
  }

  // @override
  public toJson(): IResultColumn {
    const json: IResultColumn = {
      expr: this.expr.toJson(),
    }
    if (this.as) json.as = this.as
    return json
  }
}

/**
 * Base data source
 */
export abstract class Datasource implements IDatasource, IStringify {
  public readonly classname: string = Datasource.name
  public readonly as?: string

  constructor(json: IDatasource) {
    if (json.as) this.as = json.as
  }

  // @override
  public abstract toString(): string

  // @override
  public toJson(): IDatasource {
    return {
      classname: this.classname,
      as: this.as,
    }
  }
}

/**
 * Table data source
 */
export class FromTable extends Datasource implements IFromTable {
  public readonly classname: string = FromTable.name
  public readonly database?: string
  public readonly name: string
  public readonly as?: string

  constructor(table: [string, string]|string, as?: string)
  constructor(json: IFromTable)
  constructor(...args: any[]) {
    super(
      Array.isArray(args[0]) || typeof args[0] === 'string'
        ? { classname: FromTable.name, as: args[1] }
        : args[0] as IFromTable,
    )

    if (Array.isArray(args[0])) {
      this.database = args[0][0]
      this.name = args[0][1]
    }
    else if (typeof args[0] === 'string') {
      this.name = args[0]
    }
    else {
      const json = args[0] as IFromTable
      if (json.database) this.database = json.database
      this.name = json.name
    }
  }

  // @override
  public toString(): string {
    return `${this.database ? `\`${this.database}\`.\`${this.name}\`` : `\`${this.name}\``}${this.as ? ` AS \`${this.as}\`` : ''}`
  }

  // @override
  public toJson(): IFromTable {
    const json: IFromTable = {
      ...super.toJson(),
      classname: this.classname,
      name: this.name,
    }
    if (this.database) json.database = this.database
    return json
  }
}

/**
 * Function table data source
 */
export class FromFunctionTable extends Datasource implements IFromFunctionTable {
  public readonly classname: string = FromFunctionTable.name
  public readonly expr: FunctionExpression
  public readonly as: string

  constructor(expr: IFunctionExpression, as: string)
  constructor(json: IFromFunctionTable)
  constructor(...args: any[]) {
    super(
      args.length === 2
        ? {
          classname: FromFunctionTable.name,
          as: args[1],
        }
        : args[0],
    )

    if (args.length === 2) {
      this.expr = new FunctionExpression(args[0])
    }
    else {
      const json = args[0] as IFromFunctionTable
      this.expr = new FunctionExpression(json.expr)
    }
  }

  // @override
  public toString(): string {
    return `${this.expr.toString()}${this.as ? ` AS \`${this.as}\`` : ''}`
  }

  // @override
  public toJson(): IFromFunctionTable {
    return {
      ...super.toJson(),
      classname: this.classname,
      expr: this.expr.toJson(),
      as: this.as,
    }
  }
}

/**
 * Groupping criteria
 */
export class GroupBy implements IGroupBy, IStringify {
  public readonly expr: Expression
  public readonly having?: Expression

  constructor(json: IGroupBy) {
    this.expr = parse(json.expr)
    if (json.having) this.having = parse(json.having)
  }

  // @override
  public toString(): string {
    let str = this.expr.toString()
    if (this.having) str += ` HAVING ${this.having.toString()}`
    return str
  }

  // @override
  public toJson(): IGroupBy {
    const json: IGroupBy = {
      expr: this.expr.toJson(),
    }
    if (this.having) json.having = this.having.toJson()
    return json
  }
}

/**
 * Ordering criteria
 */
export class OrderBy implements IOrderBy, IStringify {
  public readonly expr: Expression
  public readonly order: 'ASC'|'DESC' = 'ASC'

  constructor(json: IOrderBy) {
    this.expr = parse(json.expr)
    if (json.order) this.order = json.order
  }

  // @override
  public toString(): string {
    return `${this.expr.toString()} ${this.order}`
  }

  // @override
  public toJson(): IOrderBy {
    const json: IOrderBy = {
      expr: this.expr.toJson(),
    }
    if (this.order !== 'ASC') json.order = 'DESC'
    return json
  }
}

/**
 * SELECT
 */
export class Query implements IQuery, IStringify {
  public static Builder = Builder

  public readonly classname: string = Query.name
  public readonly select: ResultColumn[] = []
  public readonly from?: Datasource[]
  public readonly groupBy?: GroupBy
  public readonly where?: Expression
  public readonly orderBy: OrderBy[] = []

  constructor(json: IQuery) {
    if (json.select) this.select = json.select.map(json => new ResultColumn(json))
    if (json.from) this.from = json.from.map(json => parse(json))
    if (json.groupBy) this.groupBy = new GroupBy(json.groupBy)
    if (json.where) this.where = parse(json.where)
    if (json.orderBy) this.orderBy = json.orderBy.map(json => new OrderBy(json))
  }

  // @override
  public toString(): string {
    let str = this.select.length ? `SELECT ${this.select.map(sel => sel.toString()).join(', ')}` : 'SELECT *'
    if (this.from) str += ` FROM ${this.from.map(fr => fr.toString()).join(', ')}`
    if (this.groupBy) str += ` GROUP BY ${this.groupBy.toString()}`
    if (this.where) str += ` WHERE ${this.where.toString()}`
    if (this.orderBy.length) str += ` ORDER BY ${this.orderBy.map(ord => ord.toString()).join(', ')}`
    return str
  }

  // @override
  public toJson(): IQuery {
    const json: IQuery = {
      classname: this.classname,
    }
    if (this.select.length) json.select = this.select.map(sel => sel.toJson())
    if (this.from) json.from = this.from.map(fr => fr.toJson())
    if (this.groupBy) json.groupBy = this.groupBy.toJson()
    if (this.where) json.where = this.where.toJson()
    if (this.orderBy.length) json.orderBy = this.orderBy.map(ord => ord.toJson())
    return json
  }
}

register(FromTable)
register(FromFunctionTable)
