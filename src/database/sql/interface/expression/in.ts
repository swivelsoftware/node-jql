import squel = require('squel')
import { IQuery, Query } from '../../query'
import { create } from './create'
import { Expression, IExpression } from './index'

export interface InJson extends IExpression {
  $not?: boolean
  left: IExpression
  query?: IQuery
}

export class InExpression extends Expression implements InJson {
  public readonly classname = '$in'
  public parameters?: any[]
  public $not?: boolean
  public left: Expression
  public query: Query

  constructor(json?: InJson) {
    super(json)
    if (json) {
      this.$not = json.$not
      this.left = create(json.left)
      if (json.query) this.query = new Query(json.query)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const result = squel.expr()
    const expr = this.$not ? '? NOT IN ?' : 'IN ?'
    const params: any[] = []
    params.push(this.left.toSquel())
    params.push(this.query.toSquel())
    return result.and(expr, ...params)
  }
}
