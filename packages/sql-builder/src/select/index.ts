import _ = require('lodash')
import { dbConfigs, dbType } from '../dbType'
import { stringify } from '../dbType/stringify'
import { Expression } from '../expression'
import { ColumnExpression } from '../expression/column'
import { FunctionExpression } from '../expression/function'
import { GroupExpression } from '../expression/group'
import { IFunctionExpression, IGroupExpression } from '../expression/index.if'
import { IBuilder, IConditional, IExpression, IStringify } from '../index.if'
import { parse, register } from '../parse'
import { IDatasource, IFromFunctionTable, IFromTable, IGroupBy, IJoin, IOrderBy, IQuery, IResultColumn } from './index.if'

/**
 * Default set of JOIN operators supported, based on mysql
 */
const DEFAULT_OPERATORS = [
  'INNER',
  'LEFT',
  'RIGHT',
  'CROSS',
]

class Builder implements IBuilder<Query> {
  private readonly json: IQuery = {
    classname: Query.name,
  }

  /**
   * Set DISTINCT flag
   * @param value [boolean]
   */
  public distinct(value = true): Builder {
    this.json.distinct = value
    return this
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
   * Add WHERE expression
   * @param expr [IConditional]
   */
  public where(expr: IConditional): Builder {
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
   * Set GROUP BY constraint
   * @param expr [IExpression|string]
   * @param having [IConditional]
   */
  public groupBy(expr: IExpression|string, having?: IConditional): Builder {
    if (typeof expr === 'string') expr = new ColumnExpression(expr)
    this.json.groupBy = { expr, having }
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

class JoinBuilder implements IBuilder<Join> {
  private readonly json: IJoin

  constructor(operator: string, table: IDatasource) {
    const SUPPORTED_OPERATORS = _.get(dbConfigs, [dbType, 'joinOperators'], DEFAULT_OPERATORS)
    if (SUPPORTED_OPERATORS.indexOf(operator) === -1) throw new SyntaxError(`Unsupported operator '${operator}'`)

    this.json = {
      operator,
      table,
    }
  }

  /**
   * Set ON statement
   * @param expr [IConditional]
   */
  public on(expr: IConditional): JoinBuilder {
    this.json.on = expr
    return this
  }

  // @override
  public build(): Join {
    return new Join(this.json)
  }

  // @override
  public toJson(): IJoin {
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
    return stringify(ResultColumn.name, this)
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
 * JOIN statement
 */
export class Join implements IJoin, IStringify {
  public static Builder = JoinBuilder

  public readonly operator: string
  public readonly table: Datasource
  public readonly on?: Expression

  constructor(json: IJoin) {
    this.operator = json.operator
    this.table = parse(json.table)
    if (json.on) this.on = parse<Expression>(json.on)
  }

  // @override
  public toString(): string {
    return stringify(Join.name, this)
  }

  // @override
  public toJson(): IJoin {
    const json: IJoin = {
      operator: this.operator,
      table: this.table.toJson(),
    }
    if (this.on) json.on = this.on.toJson()
    return json
  }
}

/**
 * Base data source
 */
export abstract class Datasource implements IDatasource, IStringify {
  public readonly classname: string = Datasource.name
  public readonly as?: string
  public readonly join: Join[] = []

  constructor(json: IDatasource) {
    if (json.as) this.as = json.as
    if (json.join) this.join = json.join.map(json => new Join(json))
  }

  /**
   * Add JOIN statement
   * @param json [IJoin]
   */
  public addJoin(json: IJoin): Datasource {
    this.join.push(new Join(json))
    return this
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IDatasource {
    const json: IDatasource = {
      classname: this.classname,
      as: this.as,
    }
    if (this.join.length) json.join = this.join.map(j => j.toJson())
    return json
  }
}

/**
 * Table data source
 */
export class FromTable extends Datasource implements IFromTable {
  public readonly classname: string = FromTable.name
  public readonly schema?: string
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
      this.schema = args[0][0]
      this.name = args[0][1]
    }
    else if (typeof args[0] === 'string') {
      this.name = args[0]
    }
    else {
      const json = args[0] as IFromTable
      if (json.schema) this.schema = json.schema
      this.name = json.name
    }
  }

  // @override
  public toJson(): IFromTable {
    const json: IFromTable = {
      ...super.toJson(),
      classname: this.classname,
      name: this.name,
    }
    if (this.schema) json.schema = this.schema
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

  constructor(expr: IExpression, having?: IConditional)
  constructor(json: IGroupBy)
  constructor(...args: any[]) {
    if ('classname' in args[0]) {
      this.expr = parse(args[0] as IExpression)
      if (args[1]) this.having = parse<Expression>(args[1] as IConditional)
    }
    else {
      const json = args[0] as IGroupBy
      this.expr = parse(json.expr)
      if (json.having) this.having = parse<Expression>(json.having)
    }
  }

  // @override
  public toString(): string {
    return stringify(GroupBy.name, this)
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

  constructor(expr: IExpression, order?: 'ASC'|'DESC')
  constructor(json: IOrderBy)
  constructor(...args: any[]) {
    if ('classname' in args[0]) {
      this.expr = parse(args[0] as IExpression)
      if (args[1]) this.order = args[1] as 'ASC'|'DESC'
    }
    else {
      const json = args[0] as IOrderBy
      this.expr = parse(json.expr)
      if (json.order) this.order = json.order
    }
  }

  // @override
  public toString(): string {
    return stringify(OrderBy.name, this)
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
  public readonly distinct: boolean = false
  public readonly select: ResultColumn[] = []
  public readonly from?: Datasource[]
  public readonly where?: Expression
  public readonly groupBy?: GroupBy
  public readonly orderBy: OrderBy[] = []

  constructor(json: IQuery) {
    if (json.distinct) this.distinct = true
    if (json.select) this.select = json.select.map(json => new ResultColumn(json))
    if (json.from) this.from = json.from.map(json => parse(json))
    if (json.where) this.where = parse<Expression>(json.where)
    if (json.groupBy) this.groupBy = new GroupBy(json.groupBy)
    if (json.orderBy) this.orderBy = json.orderBy.map(json => new OrderBy(json))
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IQuery {
    const json: IQuery = {
      classname: this.classname,
    }
    if (this.select.length) json.select = this.select.map(sel => sel.toJson())
    if (this.from) json.from = this.from.map(fr => fr.toJson())
    if (this.where) json.where = this.where.toJson()
    if (this.groupBy) json.groupBy = this.groupBy.toJson()
    if (this.orderBy.length) json.orderBy = this.orderBy.map(ord => ord.toJson())
    return json
  }
}

register(FromTable)
register(FromFunctionTable)
register(Query)
