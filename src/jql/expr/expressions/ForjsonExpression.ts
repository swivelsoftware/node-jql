import squel from 'squel'
import { Expression } from '..'
import { IForjsonExpression } from '../interface'
import { Query } from '../../query'
import { IQuery } from '../../query/interface'
import { IQueryExpression } from '../interface'

/**
 * JQL class defining parameters for function expression
 */
export class ForjsonExpression extends Expression implements IForjsonExpression {
  public readonly classname = ForjsonExpression.name
  public readonly by: 'path'|'auto'
  public readonly query: Query

  /**
   * @param json [Partial<IForjsonExpression>]
   */
  constructor(json: Partial<IForjsonExpression>)

  /**
   * @param prefix [string|null]
   * @param expression [IExpression]
   * @param suffix [string] optional
   */
  constructor(query: IQuery, by: 'path'|'auto')

  constructor(...args: any[]) {
    super()

    // parse args
    let query: IQuery
    if (args[0].classname !== 'Query' && !('$select' in args[0] || '$from' in args[0])) {
      const json = args[0] as IQueryExpression
      query = json.query
    }
    else {
      query = args[0]
    }

    // check args
    if (!query) throw new SyntaxError('Missing query')

    // set args
    this.query =  new Query(query)
    this.by = args.length > 1 ? args[1] : args[0].by
  }

  // @override
  public validate(availableTables: string[]): void {
    this.query.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mssql', options?: any): squel.FunctionBlock {
    if (type !== 'mssql') throw new Error('Unsupported database')
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr(`(? FOR JSON ${this.by.toUpperCase()})`, this.query.toSquel(type, options))
  }

  // @override
  public toJson(): IForjsonExpression {
    const result: IForjsonExpression = {
      classname: 'ForJsonExpression',
      query: this.query.toJson(),
      by: this.by
    }
    return result
  }
}
