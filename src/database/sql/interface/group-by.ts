import { create } from './expression/create'
import { $and, Expression, IExpression } from './expression/index'

export interface IGroupBy {
  expressions: IExpression[] | IExpression
  $having?: IExpression[] | IExpression
}

export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: Expression

  constructor(json?: IGroupBy) {
    switch (typeof json) {
      case 'object':
        let expressions = json.expressions
        if (!Array.isArray(expressions)) expressions = [expressions]
        this.expressions = expressions.map((expression) => create(expression))
        if (json.$having) this.$having = Array.isArray(json.$having) ? new $and({ expressions: json.$having }) : create(json.$having)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}
