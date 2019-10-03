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
  public readonly classname = QueryExpression.name

  // @override
  public query: Query

  constructor(json: IQueryExpression|Query) {
    super()

    // parse
    let query: IQuery
    if ('classname' in json && json.classname === 'QueryExpression') {
      query = (json as IQueryExpression).query
    }
    else {
      query = json as Query
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

  // @override
  public toString(): string {
    return `(${this.query.toString()})`
  }
}

register(QueryExpression)
