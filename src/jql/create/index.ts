import { IJql, Jql } from '..'
import { IParseable } from '../parse'

/**
 * Raw JQL defining CREATE statements
 */
export interface ICreateJql extends IJql, IParseable {
  /**
   * Entity name
   */
  name: string

  /**
   * Whether to throw error if the target entity exists
   */
  $ifNotExists?: boolean
}

/**
 * JQL class defining CREATE statements
 */
export abstract class CreateJql extends Jql implements ICreateJql {
  public readonly classname = CreateJql.name
  public name: string
  public $ifNotExists: boolean

  /**
   * @param json [Partial<ICreateJql>]
   */
  constructor(json: Partial<ICreateJql>)

  /**
   * @param name [string]
   * @param $ifNotExists [boolean] optionsl
   */
  constructor(name: string, $ifNotExists?: boolean)

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string|undefined, $ifNotExists: boolean|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateJql>
      name = json.name
      $ifNotExists = json.$ifNotExists
    }
    else {
      name = args[0]
      $ifNotExists = args[1]
    }

    // check args
    if (!name) throw new SyntaxError('Missing name')

    // set args
    this.name = name
    this.$ifNotExists = $ifNotExists || false
  }

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public toJson(): ICreateJql {
    const result = { classname: this.classname, name: this.name } as ICreateJql
    if (this.$ifNotExists) result.$ifNotExists = true
    return result
  }
}
