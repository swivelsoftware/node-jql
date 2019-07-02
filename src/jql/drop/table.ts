import squel = require('squel')
import { DropJQL, IDropJQL } from '.'

/**
 * Raw JQL for `DROP TABLE ...`
 */
export interface IDropTableJQL extends IDropJQL {
  $temporary?: boolean
  database?: string
}

/**
 * JQL class for `DROP TABLE ...`
 */
export class DropTableJQL extends DropJQL implements IDropTableJQL {
  public readonly classname = DropTableJQL.name
  public $temporary: boolean
  public database?: string

  /**
   * @param json [Partial<IDropTableJQL>]
   */
  constructor(json: Partial<IDropTableJQL>)

  /**
   * @param name [Array<string>|string]
   */
  constructor(name: [string, string]|string)

  /**
   * @param $temporary [boolean]
   * @param name [Array<string>|string]
   */
  constructor($temporary: true, name: [string, string]|string)

  constructor(...args: any) {
    super(
      typeof args[0] === 'boolean' ? (Array.isArray(args[1]) ? args[1][1] : args[1]) : (Array.isArray(args[0]) ? args[0][1] : args[0]),
      typeof args[0] === 'boolean' ? args[3] : args[2],
    )

    // parse args
    let $temporary: boolean|undefined, database: string|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<IDropTableJQL>
      $temporary = json.$temporary
      database = json.database
    }
    else if (typeof args[0] === 'boolean') {
      $temporary = true
      if (Array.isArray(args[1])) database = args[1][0]
    }
    else {
      if (Array.isArray(args[0])) database = args[0][0]
    }

    // set args
    this.$temporary = $temporary || false
    this.database = database
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['dropTable']({ temporary: this.$temporary }) as squel.QueryBuilder
    if (this.$ifExists) builder['ifExists']()
    builder['table'](this.database ? `${this.database}.${this.name}` : this.name)
    return builder
  }

  // @override
  public toJson(): IDropTableJQL {
    const result = super.toJson() as IDropTableJQL
    result.$temporary = this.$temporary
    if (this.database) result.database = this.database
    return result
  }
}
