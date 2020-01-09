import _ = require('lodash')
import { Column } from '../column'
import { Constraint } from '../constraint'
import { stringify } from '../dbType/stringify'
import { IColumn, IConstraint, IStringify } from '../index.if'
import { IBuilder } from '../index.if'
import { parse } from '../parse'
import { Query } from '../select'
import { IQuery } from '../select/index.if'
import { IBaseCreateTable, ICreateTable, ICreateTableSelect } from './index.if'

/**
 * General CREATE TABLE
 */
abstract class BaseCreateTable implements IBaseCreateTable, IStringify {
  public readonly classname: string = BaseCreateTable.name

  public readonly temporary: boolean = false
  public readonly ifNotExists: boolean = false
  public readonly schema?: string
  public readonly name: string
  public readonly options: string[] = []

  constructor(json: IBaseCreateTable) {
    if (json.temporary) this.temporary = json.temporary
    if (json.ifNotExists) this.ifNotExists = json.ifNotExists
    if (json.schema) this.schema = json.schema
    this.name = json.name
    if (json.options) this.options = json.options
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IBaseCreateTable {
    const json: IBaseCreateTable = {
      classname: this.classname,
      name: this.name,
    }
    if (this.ifNotExists) json.ifNotExists = this.ifNotExists
    if (this.schema) json.schema = this.schema
    if (this.options.length) json.options = this.options
    return json
  }
}

class CreateTableBuilder implements IBuilder<CreateTable> {
  private json: ICreateTable

  constructor(name: string) {
    this.json = {
      classname: CreateTable.name,
      name,
      columns: [],
    }
  }

  /**
   * Set `temporary` flag
   * @param value [boolean]
   */
  public temporary(value: boolean = true): CreateTableBuilder {
    this.json.temporary = value
    return this
  }

  /**
   * Set `schema` for the table
   * @param schema [string]
   */
  public schema(schema: string): CreateTableBuilder {
    this.json.schema = schema
    return this
  }

  /**
   * Set `if not exists` flag
   * @param value [boolean]
   */
  public ifNotExists(value: boolean = true): CreateTableBuilder {
    this.json.ifNotExists = value
    return this
  }

  /**
   * Add column
   * @param json [IColumn]
   */
  public column(json: IColumn): CreateTableBuilder {
    this.json.columns.push(json)
    return this
  }

  /**
   * Add constraint
   * @param json [IConstraint]
   */
  public constraint(json: IConstraint): CreateTableBuilder {
    if (!this.json.constraints) this.json.constraints = []
    this.json.constraints.push(json)
    return this
  }

  /**
   * Add name-value option
   * @param name [string]
   * @param value [string]
   */
  public options(name: string, value: string): CreateTableBuilder
  /**
   * Add raw option
   * @param value [string]
   */
  public options(value: string): CreateTableBuilder
  public options(...args: string[]): CreateTableBuilder {
    if (args.length > 1) args[0] = `${args[0].toLocaleUpperCase()} ${args[1]}`
    if (!this.json.options) this.json.options = []
    this.json.options.push(args[0])
    return this
  }

  // @override
  public build(): CreateTable {
    if (!this.json.columns.length) throw new SyntaxError('You must specify at least 1 column')
    // TODO check primary key exists
    return new CreateTable(this.json)
  }

  // @override
  public toJson(): ICreateTable {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE TABLE
 */
export class CreateTable extends BaseCreateTable implements ICreateTable {
  public static Builder = CreateTableBuilder

  public readonly classname: string = CreateTable.name
  public readonly columns: Column[]
  public readonly constraints: Constraint[] = []

  constructor(json: ICreateTable) {
    super(json)
    this.columns = json.columns.map(json => new Column(json))
    if (json.constraints) this.constraints = json.constraints.map(json => parse(json))
  }

  // @override
  public toJson(): ICreateTable {
    const json: ICreateTable = {
      ...super.toJson(),
      classname: this.classname,
      columns: this.columns.map(col => col.toJson()),
    }
    if (this.constraints.length) json.constraints = this.constraints.map(con => con.toJson())
    return json
  }
}

class CreateTableSelectBuilder implements IBuilder<CreateTableSelect> {
  private json: ICreateTableSelect

  constructor(name: string, query: IQuery) {
    this.json = {
      classname: CreateTable.name,
      name,
      query,
    }
  }

  /**
   * Set `schema` for the table
   * @param schema [string]
   */
  public schema(schema: string): CreateTableSelectBuilder {
    this.json.schema = schema
    return this
  }

  /**
   * Set `if not exists` flag
   * @param value [boolean]
   */
  public ifNotExists(value: boolean = true): CreateTableSelectBuilder {
    this.json.ifNotExists = value
    return this
  }

  /**
   * Add column
   * @param json [IColumn]
   */
  public column(json: IColumn): CreateTableSelectBuilder {
    if (!this.json.columns) this.json.columns = []
    this.json.columns.push(json)
    return this
  }

  /**
   * Add constraint
   * @param json [IConstraint]
   */
  public constraint(json: IConstraint): CreateTableSelectBuilder {
    if (!this.json.constraints) this.json.constraints = []
    this.json.constraints.push(json)
    return this
  }

  /**
   * Add name-value option
   * @param name [string]
   * @param value [string]
   */
  public options(name: string, value: string): CreateTableSelectBuilder
  /**
   * Add raw option
   * @param value [string]
   */
  public options(value: string): CreateTableSelectBuilder
  public options(...args: string[]): CreateTableSelectBuilder {
    if (args.length > 1) args[0] = `${args[0].toLocaleUpperCase()} ${args[1]}`
    if (!this.json.options) this.json.options = []
    this.json.options.push(args[0])
    return this
  }

  /**
   * Set how to handle rows with duplciate unique keys
   * @param value [string]
   */
  public whenDuplicate(value: 'IGNORE'|'REPLACE'): CreateTableSelectBuilder {
    this.json.whenDuplicate = value
    return this
  }

  // @override
  public build(): CreateTableSelect {
    return new CreateTableSelect(this.json)
  }

  // @override
  public toJson(): ICreateTableSelect {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE TABLE AS
 */
export class CreateTableSelect extends BaseCreateTable implements ICreateTableSelect {
  public static Builder = CreateTableSelectBuilder

  public readonly classname: string = CreateTableSelect.name
  public readonly columns: Column[] = []
  public readonly constraints: Constraint[] = []
  public readonly whenDuplicate?: 'IGNORE'|'REPLACE'
  public readonly query: Query

  constructor(name: string, query: IQuery)
  constructor(json: ICreateTableSelect)
  constructor(...args: any[]) {
    super(typeof args[0] === 'string' ? { classname: CreateTableSelect.name, name: args[0] } : args[0])
    if (args.length > 1) {
      this.query = new Query(args[1])
    }
    else {
      const json = args[0] as ICreateTableSelect
      if (json.columns) this.columns = json.columns.map(json => new Column(json))
      if (json.constraints) this.constraints = json.constraints.map(json => parse(json))
      if (json.whenDuplicate) this.whenDuplicate = json.whenDuplicate
      this.query = new Query(json.query)
    }
  }

  // @override
  public toJson(): ICreateTableSelect {
    const json: ICreateTableSelect = {
      ...super.toJson(),
      classname: this.classname,
      query: this.query.toJson(),
    }
    if (this.columns.length) json.columns = this.columns.map(col => col.toJson())
    if (this.constraints.length) json.constraints = this.constraints.map(con => con.toJson())
    if (this.whenDuplicate) json.whenDuplicate = this.whenDuplicate
    return json
  }
}
