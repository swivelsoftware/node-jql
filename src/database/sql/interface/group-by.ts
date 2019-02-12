import { JQLError } from '../../../utils/error'
import { $and, Expression, IExpression } from './expression'
import { create } from './expression/__create'

export interface IGroupBy {
  expressions: IExpression[]|IExpression
  $having?: IExpression[]|IExpression
}

export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: Expression

  constructor(json?: IGroupBy) {
    switch (typeof json) {
      case 'object':
        try {
          let expressions = json.expressions
          if (!Array.isArray(expressions)) expressions = [expressions]
          this.expressions = expressions.map((expression) => create(expression))
          if (json.$having) this.$having = Array.isArray(json.$having) ? new $and({ expressions: json.$having }) : create(json.$having)
        }
        catch (e) {
          throw new JQLError('fail to create GroupBy block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}
