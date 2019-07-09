import squel from 'squel'
import { CreateJQL, ICreateJQL } from '.'
import { IQuery, Query } from '../query'

/**
 * Raw JQL for `CREATE TABLE AS ...`
 */
export interface ICreateTableAsJQL extends ICreateJQL {
  /**
   * Whether it is a temporary table
   */
  $temporary?: boolean

  /**
   * Related database
   */
  database?: string

  /**
   * SELECT statement
   */
  $as: IQuery

  /**
   * Table options
   */
  options?: string[]|string
}

/**
 * JQL class for `CREATE TABLE AS ...`
 */
export class CreateTableAsJQL extends CreateJQL implements ICreateTableAsJQL {
  public readonly classname = CreateTableAsJQL.name
  public $temporary: boolean
  public database?: string
  public $as: Query
  public options?: string[]

  /**
   * @param json [Partial<ICreateTableAsJQL>]
   */
  constructor(json: Partial<ICreateTableAsJQL>)

  /**
   * @param name [Array<string>|string]
   * @param $as [IQuery]
   * @param $ifNotExists [boolean] optional
   * @param options [Array<string] optional
   */
  constructor(name: [string, string]|string, $as: IQuery, $ifNotExists?: boolean,  ...options: string[])

  /**
   * @param $temporary [boolean]
   * @param name [Array<string>|string]
   * @param $as [IQuery]
   * @param $ifNotExists [boolean] optional
   * @param options [Array<string] optional
   */
  constructor($temporary: boolean, name: [string, string]|string, $as: IQuery, $ifNotExists?: boolean,  ...options: string[])

  constructor(...args: any) {
    super(
      typeof args[0] === 'boolean' ? (Array.isArray(args[1]) ? args[1][1] : args[1]) : (Array.isArray(args[0]) ? args[0][1] : args[0]),
      typeof args[0] === 'boolean' ? args[3] : args[2],
    )

    // parse args
    let $temporary: boolean|undefined, database: string|undefined, $as: IQuery|undefined, options: string[]|string|undefined
    if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
      const json = args[0] as Partial<ICreateTableAsJQL>
      $temporary = json.$temporary
      database = json.database
      $as = json.$as
      options = json.options
    }
    else if (typeof args[0] === 'boolean') {
      $temporary = args[0]
      if (Array.isArray(args[1])) database = args[1][0]
      $as = args[2]
      options = args.slice(4)
    }
    else {
      if (Array.isArray(args[0])) database = args[0][0]
      $as = args[1]
      options = args.slice(3)
    }

    // check args
    if (!$as) throw new SyntaxError('AS statement is missing')

    // set args
    this.$temporary = $temporary || false
    this.database = database
    this.$as = new Query($as)
    if (options) {
      if (!Array.isArray(options)) options = [options]
      this.options = options
    }
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['createTableAs']({ temporary: this.$temporary }) as squel.QueryBuilder
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['table'](`${this.database ? `${this.database}.` : ''}${this.name}`)
    builder['as'](this.$as.toSquel())
    if (this.options) for (const option of this.options) builder['option'](option)
    return builder
  }

  // @override
  public toJson(): ICreateTableAsJQL {
    const result = super.toJson() as ICreateTableAsJQL
    result.$temporary = this.$temporary
    if (this.database) result.database = this.database
    result.$as = this.$as.toJson()
    if (this.options) result.options = this.options
    return result
  }
}
