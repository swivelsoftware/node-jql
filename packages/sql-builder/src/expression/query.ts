import { Expression } from '.'
import { register } from '../parse'
import { Query } from '../select'
import { IQuery } from '../select/index.if'
import { IQueryExpression } from './index.if'

/**
 * Query
 */
export class QueryExpression extends Expression implements IQueryExpression {
  public readonly classname: string = QueryExpression.name
  public readonly query: Query

  constructor(json: IQuery|IQueryExpression) {
    super()
    if (json.classname === Query.name) {
      this.query = new Query(json as IQuery)
    }
    else {
      this.query = new Query((json as IQueryExpression).query)
    }
  }

  // @override
  public toString(): string {
    return this.query.toString()
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
