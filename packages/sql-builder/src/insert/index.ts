import _ = require('lodash')
import { stringify } from '../dbType/stringify'
import { IBuilder, IStringify } from '../index.if'
import { register } from '../parse'
import { Query } from '../select'
import { IQuery } from '../select/index.if'
import { IInsert, IInsertSelect } from './index.if'

class InsertBuilder implements IBuilder<Insert> {
  private json: IInsert

  constructor(name: string) {
    this.json = {
      classname: Insert.name,
      name,
      values: [],
    }
  }

  /**
   * Set `schema` for the table
   * @param schema [string]
   */
  public schema(schema: string): InsertBuilder {
    this.json.schema = schema
    return this
  }

  /**
   * Set columns order
   * @param columns [Array<string>]
   */
  public columns(...columns: string[]): InsertBuilder {
    if (columns.length) {
      this.json.columns = columns
    }
    else {
      delete this.json.columns
    }
    this.json.values = []
    return this
  }

  public value(row: any|any[]): InsertBuilder {
    if (!this.json.columns && !Array.isArray(row)) {
      throw new SyntaxError('You must provide a 2D array as values in case you have not specified the order of columns')
    }
    else if (this.json.columns && Array.isArray(row)) {
      throw new SyntaxError('You must provide an object as values in case you have specified the order of columns')
    }
    this.json.values.push(row)
    return this
  }

  // @override
  public build(): Insert {
    return new Insert(this.json)
  }

  // @override
  public toJson(): IInsert {
    return _.cloneDeep(this.json)
  }
}

/**
 * INSERT INTO
 */
export class Insert implements IInsert, IStringify {
  public static Builder = InsertBuilder

  public readonly classname: string = Insert.name
  public readonly schema?: string
  public readonly name: string
  public readonly columns: string[] = []
  public readonly values: any[]

  constructor(json: IInsert) {
    this.schema = json.schema
    this.name = json.name
    if (json.columns) this.columns = json.columns
    this.values = Array.isArray(json.values) ? json.values : [json.values]
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IInsert {
    const json: IInsert = {
      classname: this.classname,
      name: this.name,
      values: this.values,
    }
    if (this.schema) json.schema = this.schema
    if (this.columns.length) json.columns = this.columns
    return json
  }
}

class InsertSelectBuilder implements IBuilder<InsertSelect> {
  private json: IInsertSelect

  constructor(name: string) {
    this.json = {
      classname: Insert.name,
      name,
      query: { classname: 'Query' },
    }
  }

  /**
   * Set `schema` for the table
   * @param schema [string]
   */
  public schema(schema: string): InsertSelectBuilder {
    this.json.schema = schema
    return this
  }

  /**
   * Set columns order
   * @param columns [Array<string>]
   */
  public columns(...columns: string[]): InsertSelectBuilder {
    if (columns.length) {
      this.json.columns = columns
    }
    else {
      delete this.json.columns
    }
    return this
  }

  /**
   * Set query
   * @param query [IQuery]
   */
  public query(query: IQuery): InsertSelectBuilder {
    this.json.query = query
    return this
  }

  // @override
  public build(): InsertSelect {
    if (!this.json.query.select && !this.json.query.from) throw new SyntaxError('You must specify a Query')
    return new InsertSelect(this.json)
  }

  // @override
  public toJson(): IInsertSelect {
    return _.cloneDeep(this.json)
  }
}

/**
 * INSERT INTO SELECT
 */
export class InsertSelect implements IInsertSelect, IStringify {
  public static Builder = InsertSelectBuilder

  public readonly classname: string = InsertSelect.name
  public readonly schema?: string
  public readonly name: string
  public readonly columns: string[] = []
  public readonly query: Query

  constructor(json: IInsertSelect) {
    this.schema = json.schema
    this.name = json.name
    if (json.columns) this.columns = json.columns
    this.query = new Query(json.query)
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IInsertSelect {
    const json: IInsertSelect = {
      classname: this.classname,
      name: this.name,
      query: this.query.toJson(),
    }
    if (this.schema) json.schema = this.schema
    if (this.columns.length) json.columns = this.columns
    return json
  }
}

register(Insert)
register(InsertSelect)
