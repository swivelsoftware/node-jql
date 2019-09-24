import { Expression } from '..'
import { Query } from '../../select'
import { IQuery } from '../../select/index.if'
import { register } from '../parse'
import { IQueryExpression } from './index.if'

/**
 * SELECT ... FROM ...
 */
export class QueryExpression extends Expression implements IQueryExpression {
  // @override
  public readonly classname: string = QueryExpression.name

  // @override
  public query: Query

  constructor(json: IQueryExpression)
  constructor(query: Query)
  constructor(...args: any[]) {
    super()

    // parse
    let query: IQuery
    if ('classname' in args[0] && args[0].classname === 'QueryExpression') {
      const json = args[0] as IQueryExpression
      query = json.query
    }
    else {
      query = args[0] as Query
    }

    // set
    this.query = new Query(query)
  }

  // @override
  public toJson(): IQueryExpression {
    return {
      classname: this.classname,
      query: this.query.toJson(),
    }
  }
}

register(QueryExpression)
