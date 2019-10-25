import { JQL } from '../..'
import { parse } from '../../parse'
import { ColumnDef } from './column'
import { CreateTableConstraint, CreateTablePrimaryKeyConstraint } from './constraint'
import { IColumnDef, ICreateSchemaTableJQL, ICreateTableConstraint } from './index.if'

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
  public constraints: CreateTableConstraint[] = []

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
   * set table
   * @param name [string]
   */
  public setTable(name: string): CreateSchemaTableJQL
  /**
   * set table
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
   * set IF NOT EXISTS flag
   * @param flag [boolean]
   */
  public ifNotExists(flag = true): CreateSchemaTableJQL {
    this.$ifNotExists = flag
    return this
  }

  /**
   * add table column
   * @param column [IColumnDef]
   */
  public addColumn<T>(column: IColumnDef<T>): CreateSchemaTableJQL {
    this.columns.push(new ColumnDef(column))
    return this
  }

  /**
   * add table constraint
   * @param constraint [ICreateTableConstraint]
   */
  public addConstraint(constraint: ICreateTableConstraint): CreateSchemaTableJQL {
    this.constraints.push(parse(constraint))
    return this
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

  private getPrimaryConstraint(): CreateTablePrimaryKeyConstraint|undefined {
    const constraints = this.constraints.filter(c => c instanceof CreateTablePrimaryKeyConstraint)
    if (!constraints.length) return
    if (constraints.length > 1) throw new SyntaxError('Multiple PRIMARY KEY constraints are defined')
    return constraints[0] as CreateTablePrimaryKeyConstraint
  }
}
