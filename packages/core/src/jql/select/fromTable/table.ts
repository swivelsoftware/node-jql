import { Query } from '..'
import { JQL } from '../..'
import { ColumnDef } from '../../create/column'
import { IColumnDef } from '../../create/index.if'
import { IQuery } from '../index.if'
import { IDatabaseTable, IRemoteTable, ISelectTable, ITable } from './index.if'
import { register } from './parse'

/**
 * Table interface
 */
export abstract class Table extends JQL implements ITable {
  // @override
  public $as?: string
}

/**
 * {function}({database}.{table})
 */
export class DatabaseTable extends Table implements IDatabaseTable {
  // @override
  public readonly classname = DatabaseTable.name

  // @override
  public function?: string

  // @override
  public database?: string

  // @override
  public table: string

  constructor(json?: IDatabaseTable) {
    super()

    if (json) {
      if (json.function) {
        if (!json.$as) throw new SyntaxError('Missing alias name for table')
        this.setFunction(json.function, json.$as)
      }
      if (json.database) {
        this.setTable(json.database, json.table)
      }
      else {
        this.setTable(json.table)
      }
    }
  }

  /**
   * set table function
   * @param name [string]
   * @param $as [string]
   */
  public setFunction(name: string, $as: string): DatabaseTable {
    this.function = name
    this.$as = $as
    return this
  }

  /**
   * set table
   * @param name [string]
   */
  public setTable(name: string): DatabaseTable
  /**
   * set table
   * @param database [string]
   * @param table [string]
   */
  public setTable(database: string, table: string): DatabaseTable
  public setTable(...args: any[]): DatabaseTable {
    if (args.length === 1) {
      this.database = undefined
      this.table = args[0] as string
    }
    else {
      this.database = args[0] as string
      this.table = args[1] as string
    }
    return this
  }

  /**
   * set alias name
   * @param name [string]
   */
  public setAlias(name: string): DatabaseTable {
    this.$as = name
    return this
  }

  // @override
  public toJson(): IDatabaseTable {
    this.check()
    return {
      classname: this.classname,
      function: this.function,
      database: this.database,
      table: this.table,
      $as: this.$as,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let table = `\`${this.table}\``
    if (this.database) table = `\`${this.database}\`.${table}`
    if (this.function) table = `${this.function}(${table})`
    if (this.$as) table = `${table} \`${this.$as}\``
    return table
  }

  // @override
  protected check(): void {
    if (this.function && !this.$as) throw new SyntaxError('Missing alias name for table')
  }
}

/**
 * Table from query
 */
export class SelectTable extends Table implements ISelectTable {
  // @override
  public readonly classname = SelectTable.name

  // @override
  public query: Query

  constructor(json?: ISelectTable) {
    super()

    if (json) {
      if (!json.$as) throw new SyntaxError('Alias name is required')
      this.setQuery(json.query, json.$as)
    }
  }

  /**
   * set query
   * @param query [IQuery]
   * @param $as [string]
   */
  public setQuery(query: IQuery, $as: string): SelectTable {
    this.query = new Query(query)
    this.$as = $as
    return this
  }

  // @override
  public toJson(): ISelectTable {
    this.check()
    return {
      classname: this.classname,
      query: this.query.toJson(),
      $as: this.$as,
    }
  }

  // @override
  public toString(): string {
    this.check()
    return `(${this.query.toString()}) \`${this.$as}\``
  }

  // @override
  protected check(): void {
    if (!this.query) throw new SyntaxError('Query is not defined')
    if (!this.$as) throw new SyntaxError('Missing alias name for table')
  }
}

/**
 * Table from API
 */
export class RemoteTable<RequestConfig> extends Table implements IRemoteTable<RequestConfig> {
  // @override
  public readonly classname = RemoteTable.name

  // @override
  public columns: ColumnDef[]

  // @override
  public requestConfig: RequestConfig

  constructor(json?: IRemoteTable<RequestConfig>) {
    super()

    if (json) {
      if (!json.$as) throw new SyntaxError('Alias name is required')
      this.setAPI(json.requestConfig, json.columns, json.$as)
    }
  }

  /**
   * set API configuration
   * @param config [Request]
   * @param columns [Array<IColumnDef>]
   * @param $as [string]
   */
  public setAPI(config: RequestConfig, columns: IColumnDef[], $as: string): RemoteTable<RequestConfig> {
    this.requestConfig = config
    this.columns = columns.map(c => new ColumnDef(c))
    this.$as = $as
    return this
  }

  // @override
  public toJson(): IRemoteTable {
    return {
      classname: this.classname,
      columns: this.columns.map(c => c.toJson()),
      requestConfig: this.requestConfig,
      $as: this.$as,
    }
  }

  // @override
  public toString(): string {
    return `FETCH(${JSON.stringify(this.requestConfig)}) \`${this.$as}\``
  }

  // @override
  protected check(): void {
    if (!this.requestConfig) throw new SyntaxError('API configuration is not defined')
    if (!this.$as) throw new SyntaxError('Missing alias name for table')
  }
}

register(DatabaseTable)
register(SelectTable)
register(RemoteTable)
