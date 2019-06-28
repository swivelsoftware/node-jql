import squel = require('squel')
import { CreateJql, ICreateJql } from '.'
import { Column, IColumn } from './column'

/**
 * Raw JQL for `CREATE TABLE ...`
 */
export interface ICreateTableJQL extends ICreateJql {
  columns: IColumn[]
  constraints?: string[]|string
  options?: string[]|string
}

/**
 * JQL class for `CREATE TABLE ...`
 */
export class CreateTableJQL extends CreateJql implements ICreateTableJQL {
  public readonly classname = CreateTableJQL.name
  public columns: Column[]
  public constraints?: string[]
  public options?: string[]

  /**
   * @param json [Partial<ICreateTableJQL>]
   */
  constructor(json: Partial<ICreateTableJQL>)

  /**
   * @param name [string]
   * @param columns [Array<Column>]
   * @param $ifNotExists [boolean] optional
   * @param constraints [Array<string>|string] optional
   * @param options [Array<string>] optional
   */
  constructor(name: string, columns: Column[], $ifNotExists?: boolean, constraints?: string[]|string, ...options: string[])

  constructor(...args: any) {
    super(args[0], args[2])

    // parse args
    let columns: IColumn[], constraints: string[]|string|undefined, options: string[]|string|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateTableJQL>
      columns = json.columns || []
      constraints = json.constraints
      options = json.options
    }
    else {
      columns = args[1]
      constraints = args[3]
      options = args.slice(4)
    }

    // check args
    if (!columns.length) throw new SyntaxError('Table must have at least 1 column')

    // set args
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
    const builder = squel['createTable']() as squel.QueryBuilder
    if (this.$ifNotExists) builder['ifNotExists']()
    builder['table'](this.name)
    for (const column of this.columns) builder['column'](column.toSquel())
    if (this.options) for (const option of this.options) builder['option'](option)
    return builder
  }

  // @override
  public toJson(): ICreateTableJQL {
    const result = super.toJson() as ICreateTableJQL
    result.columns = this.columns.map(column => column.toJson())
    if (this.options) result.options = this.options
    return result
  }
}
