import moment = require('moment')
import squel from 'squel'
import { IJQL, JQL } from '.'
import { IParseable } from './parse'

export interface IInsertJQL extends IJQL, IParseable {
  /**
   * Related database
   */
  database?: string

  /**
   * Table name
   */
  name: string

  /**
   * Rows
   */
  values: any[]
}

export class InsertJQL extends JQL implements IInsertJQL {
  public readonly classname = InsertJQL.name
  public database?: string
  public name: string
  public values: any[]

  /**
   * @param json [Partial<IInsertJQL>]
   */
  constructor(json: Partial<IInsertJQL>)

  /**
   * @param name [Array<string>|string]
   * @param values [Array]
   */
  constructor(name: [string, string]|string, ...values: any[])

  constructor(...args: any[]) {
    super()

    // parse args
    let database: string|undefined, name: string, values: any[]
    if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
      const json = args[0] as IInsertJQL
      database = json.database
      name = json.name
      values = json.values
    }
    else if (Array.isArray(args[0])) {
      database = args[0][0]
      name = args[0][1]
      values = args.slice(1)
    }
    else {
      name = args[0]
      values = args.slice(1)
    }

    // check args
    if (!name) throw new SyntaxError('Missing name')
    if (!values.length) throw new SyntaxError('Missing values')

    // set args
    this.database = database
    this.name = name
    this.values = values
  }

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    return squel.insert()
      .into(`${this.database ? `${this.database}.` : ''}${this.name}`)
      .setFieldsRows(this.values)
  }

  // @override
  public toJson(): IInsertJQL {
    const result = { classname: this.classname, name: this.name, values: this.values } as IInsertJQL
    if (this.database) result.database = this.database
    return result
  }
}
