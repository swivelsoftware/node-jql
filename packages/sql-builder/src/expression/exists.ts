import { Expression } from '.'
import { register } from '../parse'
import { IQuery } from '../select/index.if'
import { IExistsExpression, IQueryExpression } from './index.if'
import { QueryExpression } from './query'

/**
 * (NOT) EXISTS [query]
 */
export class ExistsExpression extends Expression implements IExistsExpression {
  public readonly classname: string = ExistsExpression.name
  public readonly not: boolean = false
  public readonly query: QueryExpression

  constructor(json: IQueryExpression|IQuery|IExistsExpression) {
    super()
    if (json.classname === ExistsExpression.name || json.classname === QueryExpression.name) {
      this.query = new QueryExpression((json as IExistsExpression|IQueryExpression).query)
    }
    else {
      this.query = new QueryExpression(json as IQuery)
    }
  }

  // @override
  public toString(): string {
    return `EXISTS ${this.query.toString()}`
  }

  // @override
  public toJson(): IQueryExpression {
    return {
      classname: this.classname,
      query: this.query.toJson(),
    }
  }
}

register(ExistsExpression)
