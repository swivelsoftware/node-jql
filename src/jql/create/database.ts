import squel = require('squel')
import { CreateJql, ICreateJql } from '.'

/**
 * Raw JQL for `CREATE DATABASE ...`
 */
export interface ICreateDatabaseJQL extends ICreateJql {
  /**
   * Database engine
   */
  engine?: string
}

/**
 * JQL class for `CREATE DATABASE ...`
 */
export class CreateDatabaseJQL extends CreateJql implements ICreateDatabaseJQL {
  public readonly classname = CreateDatabaseJQL.name
  public engine?: string

  /**
   * @param json [Partial<ICreateDatabaseJQL>]
   */
  constructor(json: Partial<ICreateDatabaseJQL>)

  /**
   * @param name [string]
   * @param $ifNotExists [boolean] optional
   * @param engine [string] optional
   */
  constructor(name: string, $ifNotExists?: boolean, engine?: string)

  constructor(...args: any) {
    super(args[0], args[1])

    // parse args
    let engine: string|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateDatabaseJQL>
      engine = json.engine
    }
    else {
      engine = args[2]
    }

    // set args
    this.engine = engine
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['createDatabase']() as squel.QueryBuilder
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['database'](this.name)
    if (this.engine) builder['option'](`ENGINE = ${this.engine}`)
    return builder
  }

  // @override
  public toJson(): ICreateDatabaseJQL {
    const result = super.toJson() as ICreateDatabaseJQL
    if (this.engine) result.engine = this.engine
    return result
  }
}
