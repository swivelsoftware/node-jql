import squel = require('squel')
import { IQuery, Query } from '../../query'
import { Expression } from './__base'

export interface IExistsExpression {
  $not?: boolean
  query: IQuery
}

export class ExistsExpression extends Expression implements IExistsExpression {
  public readonly classname = '$exists'
  public $not?: boolean
  public query: Query

  constructor(json?: IExistsExpression) {
    super(json)
    if (json) {
      this.$not = json.$not
      this.query = new Query(json.query)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const result = squel.expr()
    const expr = this.$not ? 'NOT EXISTS ?' : 'EXISTS ?'
    const params: any[] = []
    params.push(this.query.toSquel())
    return result.and(expr, ...params)
  }
}
