import squel = require('squel')
import { CreateJQL, ICreateJQL } from '.'
import { Column, IColumn } from './column'

/**
 * Raw JQL for `CREATE TABLE ...`
 */
export interface ICreateTableJQL extends ICreateJQL {
  $temporary?: boolean
  database?: string
  columns: IColumn[]
  constraints?: string[]|string
  options?: string[]|string
}

/**
 * JQL class for `CREATE TABLE ...`
 */
export class CreateTableJQL extends CreateJQL implements ICreateTableJQL {
  public readonly classname = CreateTableJQL.name
  public $temporary: boolean
  public database?: string
  public columns: Column[]
  public constraints?: string[]
  public options?: string[]

  /**
   * @param json [Partial<ICreateTableJQL>]
   */
  constructor(json: Partial<ICreateTableJQL>)

  /**
   * @param name [Array<string>|string]
   * @param columns [Array<Column>]
   * @param $ifNotExists [boolean] optional
   * @param constraints [Array<string>|string] optional
   * @param options [Array<string] optional
   */
  constructor(name: [string, string]|string, columns: Column[], $ifNotExists?: boolean, constraints?: string[]|string, ...options: string[])

  /**
   * @param $temporary [boolean]
   * @param name [Array<string>|string]
   * @param columns [Array<Column>]
   * @param $ifNotExists [boolean] optional
   * @param constraints [Array<string>|string] optional
   * @param options [Array<string] optional
   */
  constructor($temporary: true, name: [string, string]|string, columns: Column[], $ifNotExists?: boolean, constraints?: string[]|string, ...options: string[])

  constructor(...args: any) {
    super(
      typeof args[0] === 'boolean' ? (Array.isArray(args[1]) ? args[1][1] : args[1]) : (Array.isArray(args[0]) ? args[0][1] : args[0]),
      typeof args[0] === 'boolean' ? args[3] : args[2],
    )

    // parse args
    let $temporary: boolean|undefined, database: string|undefined, columns: IColumn[], constraints: string[]|string|undefined, options: string[]|string|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateTableJQL>
      $temporary = json.$temporary
      database = json.database
      columns = json.columns || []
      constraints = json.constraints
      options = json.options
    }
    else if (typeof args[0] === 'boolean') {
      $temporary = true
      if (Array.isArray(args[1])) database = args[1][0]
      columns = args[2]
      constraints = args[4]
      options = args.slice(5)
    }
    else {
      if (Array.isArray(args[0])) database = args[0][0]
      columns = args[1]
      constraints = args[3]
      options = args.slice(4)
    }

    // check args
    if (!columns.length) throw new SyntaxError('Table must have at least 1 column')

    // set args
    this.$temporary = $temporary || false
    this.database = database
    this.columns = columns.map(json => new Column(json))
    if (constraints) {
      if (!Array.isArray(constraints)) constraints = [constraints]
      this.constraints = constraints
    }
    if (options) {
      if (!Array.isArray(options)) options = [options]
      this.options = options
    }
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['createTable']({ temporary: this.$temporary }) as squel.QueryBuilder
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['table'](this.database ? `${this.database}.${this.name}` : this.name)
    for (const column of this.columns) builder['column'](column.toSquel())
    if (this.options) for (const option of this.options) builder['option'](option)
    return builder
  }

  // @override
  public toJson(): ICreateTableJQL {
    const result = super.toJson() as ICreateTableJQL
    result.$temporary = this.$temporary
    if (this.database) result.database = this.database
    result.columns = this.columns.map(column => column.toJson())
    if (this.options) result.options = this.options
    return result
  }
}
