import squel from 'squel'
import { Expression } from '..'
import { Query } from '../../query'
import { IQuery } from '../../query/interface'
import { IQueryExpression } from '../interface'

export class QueryExpression extends Expression implements IQueryExpression {
  public readonly classname = QueryExpression.name
  public query: Query

  /**
   * @param json [Partial<IQueryExpression>]
   */
  constructor(json: Partial<IQueryExpression>)

  /**
   * @param json [IQuery]
   */
  constructor(query: IQuery)

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
    this.query = new Query(query)
  }

  // @override
  public validate(availableTables: string[]): void {
    this.query.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr('(?)', this.query.toSquel(type, options))
  }

  // @override
  public toJson(): IQueryExpression {
    const result: IQueryExpression = {
      classname: this.classname,
      query: this.query.toJson(),
    }
    return result
  }
}
