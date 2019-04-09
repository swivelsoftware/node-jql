import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '../expression'
import { AndExpressions } from '../expression/grouped'
import { parse } from '../expression/parse'
import { InstantiateError } from '../utils/error/InstantiateError'

export interface IGroupBy {
  expressions: IExpression[]|IExpression
  $having?: IConditionalExpression[]|IConditionalExpression
}

export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: ConditionalExpression

  constructor(json: IGroupBy) {
    try {
      let expressions = json.expressions
      if (!Array.isArray(expressions)) expressions = [expressions]
      this.expressions = expressions.map((expression) => parse(expression))
      if (json.$having) this.$having = Array.isArray(json.$having) ? new AndExpressions({ expressions: json.$having }) : parse(json.$having) as ConditionalExpression
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate GroupBy', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'GroupBy'
  }
}
