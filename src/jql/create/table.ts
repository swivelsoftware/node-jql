import squel from 'squel'
import { CreateJQL } from '.'
import { Query } from '../query'
import { IQuery } from '../query/interface'
import { Column } from './column'
import { IColumn, ICreateTableJQL } from './interface'

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
  public $as?: Query

  /**
   * @param json [Partial<ICreateTableJQL>]
   */
  constructor(json: Partial<ICreateTableJQL>)

  /**
   * @param name [Array<string>|string]
   * @param columns [Array<IColumn>]
   * @param $ifNotExists [boolean] optional
   * @param constraints [Array<string>|string] optional
   * @param options [Array<string] optional
   */
  constructor(name: [string, string]|string, columns: IColumn[], $ifNotExists?: boolean, constraints?: string[]|string, ...options: string[])

  /**
   * @param $temporary [boolean]
   * @param name [Array<string>|string]
   * @param columns [Array<IColumn>]
   * @param $ifNotExists [boolean] optional
   * @param constraints [Array<string>|string] optional
   * @param options [Array<string] optional
   */
  constructor($temporary: true, name: [string, string]|string, columns: IColumn[], $ifNotExists?: boolean, constraints?: string[]|string, ...options: string[])

  constructor(...args: any) {
    super(
      typeof args[0] === 'boolean' ? (Array.isArray(args[1]) ? args[1][1] : args[1]) : (Array.isArray(args[0]) ? args[0][1] : args[0]),
      typeof args[0] === 'boolean' ? args[3] : args[2],
    )

    // parse args
    let $temporary: boolean|undefined, database: string|undefined, columns: IColumn[], constraints: string[]|string|undefined, options: string[]|string|undefined, $as: IQuery|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateTableJQL>
      $temporary = json.$temporary
      database = json.database
      columns = json.columns || []
      constraints = json.constraints
      options = json.options
      $as = json.$as
    }
    else if (typeof args[0] === 'boolean') {
      $temporary = args[0]
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
    if (!$as && !columns.length) throw new SyntaxError('Table must have at least 1 column')

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
    if ($as) this.$as = new Query($as)
  }

  // @override
  public validate(availableTables: string[] = []): void {
    if (this.$as) this.$as.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['createTable']({ temporary: this.$temporary }) as squel.QueryBuilder
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['table'](`${this.database ? `${this.database}.` : ''}${this.name}`)
    for (const column of this.columns) builder['column'](column.toSquel())
    if (this.options) for (const option of this.options) builder['option'](option)
    if (this.$as) builder['as'](this.$as.toSquel())
    return builder
  }

  // @override
  public toJson(): ICreateTableJQL {
    const result = super.toJson() as ICreateTableJQL
    result.$temporary = this.$temporary
    if (this.database) result.database = this.database
    result.columns = this.columns.map(column => column.toJson())
    if (this.constraints) result.constraints = this.constraints
    if (this.options) result.options = this.options
    if (this.$as) result.$as = this.$as.toJson()
    return result
  }
}
