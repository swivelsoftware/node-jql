import squel = require('squel')
import { IJql, Jql } from '..'
import { DatabaseBlock, IfNotExistsBlock } from '../blocks'

/**
 * Raw JQL for `CREATE DATABASE ...`
 */
export interface ICreateDatabaseJQL extends IJql {
  name: string
  $ifNotExists?: boolean
}

/**
 * JQL class for `CREATE DATABASE ...`
 */
export class CreateDatabaseJQL extends Jql implements ICreateDatabaseJQL {
  public name: string
  public $ifNotExists: boolean

  /**
   * @param json [ICreateDatabaseJQL]
   */
  constructor(json: ICreateDatabaseJQL)

  /**
   * @param name [string]
   * @param $ifNotExists [boolean] optional
   */
  constructor(name: string, $ifNotExists?: boolean)

  constructor(...args: any) {
    super()

    // parse args
    let name: string, $ifNotExists = false
    if (typeof args[0] === 'object') {
      const json = args[0] as ICreateDatabaseJQL
      name = json.name
      $ifNotExists = json.$ifNotExists || false
    }
    else {
      name = args[0]
      $ifNotExists = args[1] || false
    }

    // set args
    this.name = name
    this.$ifNotExists = $ifNotExists
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.BaseBuilder {
    const builder = new squel.cls.QueryBuilder({}, [
      new squel.cls.StringBlock({}, 'CREATE DATABASE'),
      new IfNotExistsBlock(),
      new DatabaseBlock(),
    ])
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['database'](this.name)
    return builder
  }

  // @override
  public toJson(): ICreateDatabaseJQL {
    const result = { name: this.name } as ICreateDatabaseJQL
    if (this.$ifNotExists) result.$ifNotExists = true
    return result
  }
}
