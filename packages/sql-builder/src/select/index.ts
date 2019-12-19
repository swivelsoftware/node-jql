import { Expression } from '../expression'
import { FunctionExpression } from '../expression/function'
import { IStringify } from '../index.if'
import { parse, register } from '../parse'
import { IDatasource, IFromFunctionTable, IFromTable, IQuery, IResultColumn } from './index.if'

/**
 * Selected result column
 */
export class ResultColumn implements IResultColumn, IStringify {
  public readonly expr: Expression
  public readonly as?: string

  constructor(json: IResultColumn) {
    this.expr = parse(json.expr)
    if (json.as) this.as = json.as
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

  constructor(json: IFromTable) {
    super(json)
    if (json.database) this.database = json.database
    this.name = json.name
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

  constructor(json: IFromFunctionTable) {
    super(json)
    this.expr = new FunctionExpression(json.expr)
    this.as = json.as
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
 * SELECT
 */
export class Query implements IQuery, IStringify {
  public readonly classname: string = Query.name
  public readonly select?: ResultColumn[]
  public readonly from?: Datasource[]

  constructor(json: IQuery) {
    if (json.select) this.select = json.select.map(json => new ResultColumn(json))
    if (json.from) this.from = json.from.map(json => parse(json))
  }

  // @override
  public toString(): string {
    let str = this.select ? `SELECT ${this.select.map(sel => sel.toString()).join(', ')}` : 'SELECT *'
    if (this.from) str += ` FROM ${this.from.map(fr => fr.toString()).join(', ')}`
    return str
  }

  // @override
  public toJson(): IQuery {
    const json: IQuery = {
      classname: this.classname,
    }
    if (this.select) json.select = this.select.map(sel => sel.toJson())
    if (this.from) json.from = this.from.map(fr => fr.toJson())
    return json
  }
}

register(FromTable)
register(FromFunctionTable)
