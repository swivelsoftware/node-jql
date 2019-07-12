import squel from 'squel'
import { IJQL, JQL } from '.'
import { IParseable } from './parse'
import { IQuery, Query } from './query'

/**
 * Raw JQL for INSERT INTO ...
 */
export interface IInsertJQL<T = any> extends IJQL, IParseable {
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
  values?: T[]

  /**
   * Columns
   */
  columns?: string[]

  /**
   * Query
   */
  query?: IQuery
}

/**
 * JQL class for INSERT INTO ...
 */
export class InsertJQL<T = any> extends JQL implements IInsertJQL<T> {
  public readonly classname = InsertJQL.name
  public database?: string
  public name: string
  public values?: T[]
  public columns?: string[]
  public query?: Query

  /**
   * @param json [Partial<IInsertJQL>]
   */
  constructor(json: Partial<IInsertJQL>)

  /**
   * @param name [Array<string>|string]
   * @param query [IQuery]
   * @param columns [Array<string>]
   */
  constructor(name: [string, string]|string, query: IQuery, columns: string[])

  /**
   * @param name [Array<string>|string]
   * @param values [Array]
   */
  constructor(name: [string, string]|string, ...values: T[])

  constructor(...args: any[]) {
    super()

    // parse args
    let database: string|undefined, name: string, columns: string[]|undefined, values: T[]|undefined, query: IQuery|undefined
    if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
      const json = args[0] as IInsertJQL
      database = json.database
      name = json.name
      values = json.values
      columns = json.columns
      query = json.query
    }
    else if ('classname' in args[1] && args[1].classname === 'Query') {
      if (Array.isArray(args[0])) {
        database = args[0][0]
        name = args[0][1]
      }
      else {
        name = args[0]
      }
      query = args[1]
      columns = args[2]
    }
    else {
      if (Array.isArray(args[0])) {
        database = args[0][0]
        name = args[0][1]
      }
      else {
        name = args[0]
      }
      values = args.slice(1)
    }

    // check args
    if (!name) throw new SyntaxError('Missing name')
    if (!values && !query) throw new SyntaxError('Missing values or queries')
    if (values && !values.length) throw new SyntaxError('Missing values')
    if (query && (!columns || !columns.length)) throw new SyntaxError('Missing column definition for query')

    // set args
    this.database = database
    this.name = name
    this.columns = columns
    if (values) this.values = values
    else if (query) this.query = new Query(query)
  }

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel.insert().into(`${this.database ? `${this.database}.` : ''}${this.name}`)
    if (this.values) builder.setFieldsRows(this.values)
    if (this.query) builder.fromQuery(this.columns as string[], this.query.toSquel())
    return builder
  }

  // @override
  public toJson(): IInsertJQL<T> {
    const result = { classname: this.classname, name: this.name } as IInsertJQL
    if (this.database) result.database = this.database
    if (this.values) result.values = this.values
    if (this.query) {
      result.columns = this.columns
      result.query = this.query.toJson()
    }
    return result
  }
}
