import { JQL } from '../..'
import { TableDef } from '../../../engine/memory/table'
import { ColumnDef } from '../../../engine/memory/table/column'
import { TableConstraint, TablePrimaryKeyConstraint } from '../../../engine/memory/table/constraint'
import { IColumnDef, ITableConstraint, ITablePrimaryKeyConstraint } from '../../../engine/memory/table/index.if'
import { parse } from '../../parse'
import { Query } from '../../select'
import { ICreateQueryTableJQL, ICreateRemoteTableJQL, ICreateSchemaTableJQL } from './index.if'

/**
 * normally create table
 */
export class CreateSchemaTableJQL extends JQL implements ICreateSchemaTableJQL {
  // @override
  public readonly classname = CreateSchemaTableJQL.name

  // @override
  public schema?: string

  // @override
  public name: string

  // @override
  public $ifNotExists = false

  // @override
  public columns: Array<ColumnDef<any>> = []

  // @override
  public constraints: TableConstraint[] = []

  // @override
  public engine?: string

  constructor(json?: string|ICreateSchemaTableJQL) {
    super()

    if (typeof json === 'string') {
      this.setTable(json)
    }
    else if (json) {
      if (json.schema) {
        this.setTable(json.schema, json.name)
      }
      else {
        this.setTable(json.name)
      }
    }
  }

  /**
   * Set table
   * @param name [string]
   */
  public setTable(name: string): CreateSchemaTableJQL
  /**
   * Set table
   * @param schema [string]
   * @param table [string]
   */
  public setTable(schema: string, table: string): CreateSchemaTableJQL
  public setTable(...args: any[]): CreateSchemaTableJQL {
    if (args.length === 1) {
      this.schema = undefined
      this.name = args[0] as string
    }
    else {
      this.schema = args[0] as string
      this.name = args[1] as string
    }
    return this
  }

  /**
   * Set IF NOT EXISTS flag
   * @param flag [boolean]
   */
  public ifNotExists(flag = true): CreateSchemaTableJQL {
    this.$ifNotExists = flag
    return this
  }

  /**
   * Add table column
   * @param column [IColumnDef]
   */
  public addColumn<T>(column: IColumnDef<T>): CreateSchemaTableJQL {
    this.columns.push(new ColumnDef(column))
    return this
  }

  /**
   * Add table constraint
   * @param constraint [ICreateTableConstraint]
   */
  public addConstraint(constraint: ITableConstraint): CreateSchemaTableJQL {
    this.constraints.push(parse(constraint))
    return this
  }

  /**
   * Convert to TableDef
   */
  public toTableDef(): TableDef {
    const result = new TableDef(this.name)
    for (const c of this.columns) result.addColumn(c)
    for (const c of this.constraints) result.addConstraint(c)
    return result
  }

  // @override
  public toJson(): ICreateSchemaTableJQL {
    this.check()
    return {
      classname: this.classname,
      schema: this.schema,
      name: this.name,
      $ifNotExists: this.$ifNotExists,
      columns: this.columns.map(c => c.toJson()),
      constraints: this.constraints.map(c => c.toJson()),
      engine: this.engine,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = `CREATE TABLE ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}`
    result += this.schema ? `\`${this.schema}\`.\`${this.name}\`` : `\`${this.name}\``
    result += ' ('
    result += this.columns.map(c => c.toString()).join(', ')
    if (this.constraints.length) {
      result += ', '
      result += this.constraints.map(c => c.toString()).join(', ')
    }
    result += ')'
    if (this.engine) result += ` ENGINE=${this.engine}`
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Table name is not defined')
    if (!this.columns.length) throw new SyntaxError('No column is defined')

    const primaryKey = this.getPrimaryColumn()
    const primaryKeyConstraint = this.getPrimaryConstraint()
    if (!primaryKey && !primaryKeyConstraint) {
      throw new SyntaxError('No PRIMAYR KEY is defined')
    }
    if (primaryKey && primaryKeyConstraint) {
      if (primaryKeyConstraint.columns.length !== 1 || primaryKeyConstraint.columns[0] !== primaryKey) {
        throw new SyntaxError('PRIMARY KEY constraints not matched')
      }
    }
  }

  private getPrimaryColumn(): string|undefined {
    const columns = this.columns.filter(c => c.primaryKey)
    if (columns.length > 1) throw new SyntaxError('Use PRIMARY KEY constraint instead of multiple PRIMARY KEY columns')
    if (columns.length === 1) return columns[0].name
  }

  private getPrimaryConstraint(): TablePrimaryKeyConstraint|undefined {
    const constraints = this.constraints.filter(c => c instanceof TablePrimaryKeyConstraint)
    if (!constraints.length) return
    if (constraints.length > 1) throw new SyntaxError('Multiple PRIMARY KEY constraints are defined')
    return constraints[0] as TablePrimaryKeyConstraint
  }
}

/**
 * Create table from query
 */
export class CreateQueryTableJQL extends JQL implements ICreateQueryTableJQL {
  // @override
  public readonly classname = CreateQueryTableJQL.name

  // @override
  public schema?: string

  // @override
  public name: string

  // @override
  public $ifNotExists = false

  // @override
  public constraint?: TablePrimaryKeyConstraint

  // @override
  public $as: Query

  // @override
  public engine?: string

  constructor(json?: string|ICreateQueryTableJQL) {
    super()

    if (typeof json === 'string') {
      this.setTable(json)
    }
    else if (json) {
      if (json.schema) {
        this.setTable(json.schema, json.name)
      }
      else {
        this.setTable(json.name)
      }
    }
  }

  /**
   * Set table
   * @param name [string]
   */
  public setTable(name: string): CreateQueryTableJQL
  /**
   * Set table
   * @param schema [string]
   * @param table [string]
   */
  public setTable(schema: string, table: string): CreateQueryTableJQL
  public setTable(...args: any[]): CreateQueryTableJQL {
    if (args.length === 1) {
      this.schema = undefined
      this.name = args[0] as string
    }
    else {
      this.schema = args[0] as string
      this.name = args[1] as string
    }
    return this
  }

  /**
   * Set IF NOT EXISTS flag
   * @param flag [boolean]
   */
  public ifNotExists(flag = true): CreateQueryTableJQL {
    this.$ifNotExists = flag
    return this
  }

  /**
   * Set PRIMARY KEY constraint
   * @param constraint [ITablePrimaryKeyConstraint]
   */
  public setConstraint(constraint: ITablePrimaryKeyConstraint): CreateQueryTableJQL {
    this.constraint = new TablePrimaryKeyConstraint(constraint)
    return this
  }

  // TODO toTableDef

  // @override
  public toJson(): ICreateQueryTableJQL {
    this.check()
    const result: ICreateQueryTableJQL = {
      classname: this.classname,
      schema: this.schema,
      name: this.name,
      $ifNotExists: this.$ifNotExists,
      $as: this.$as.toJson(),
      engine: this.engine,
    }
    if (this.constraint) result.constraint = this.constraint.toJson()
    return result
  }

  // @override
  public toString(): string {
    this.check()
    let result = `CREATE TABLE ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}`
    result += this.schema ? `\`${this.schema}\`.\`${this.name}\`` : `\`${this.name}\``
    if (this.constraint) result += `(${this.constraint.toString()})`
    result += ` AS (${this.$as.toString()})`
    if (this.engine) result += ` ENGINE=${this.engine}`
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Table name is not defined')
    if (!this.$as) throw new SyntaxError('Table query is not defined')

    // TODO check primary key exists
  }
}

/**
 * Create table from query
 */
export class CreateRemoteTableJQL<R> extends CreateSchemaTableJQL implements ICreateRemoteTableJQL<R> {
  // @override
  public readonly classname = CreateRemoteTableJQL.name

  // @override
  public requestConfig: R

  // @override
  public toTableDef(): TableDef {
    // TODO
    return super.toTableDef()
  }

  // @override
  public toJson(): ICreateRemoteTableJQL<R> {
    this.check()
    return {
      ...super.toJson(),
      requestConfig: this.requestConfig,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = `CREATE TABLE ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}`
    result += this.schema ? `\`${this.schema}\`.\`${this.name}\`` : `\`${this.name}\``
    result += ' ('
    result += this.columns.map(c => c.toString()).join(', ')
    if (this.constraints.length) {
      result += ', '
      result += this.constraints.map(c => c.toString()).join(', ')
    }
    result += ')'
    result += ` AS ${JSON.stringify(this.requestConfig)}`
    if (this.engine) result += ` ENGINE=${this.engine}`
    return result
  }

  // @override
  protected check(): void {
    super.check()
    if (!this.requestConfig) throw new SyntaxError('Table remote source is not defined')
  }
}
