import squel = require('squel')
import { create } from './create'
import { Expression, IExpression } from './index'

export interface IGroupedExpression extends IExpression {
  expressions: IExpression[]
}

abstract class GropuedExpression extends Expression implements IGroupedExpression {
  public classname = '$and'
  public expressions: Expression[]

  constructor(json?: IGroupedExpression) {
    super(json)
    if (json) {
      this.expressions = json.expressions.map((expression) => {
        if (expression.classname === '$column' || expression.classname === 'value') throw new Error(`invalid expression '${expression.classname}' for '${this.classname}'`)
        return create(expression)
      })
    }
  }

  public toSquel(): squel.BaseBuilder {
    let result = squel.expr()
    for (const expr of this.expressions) {
      if (this.classname === '$or') {
        result = result.or(expr.toSquel() as squel.Expression)
      }
      else {
        result = result.and(expr.toSquel() as squel.Expression)
      }
    }
    return result
  }
}

export class AndGroupedExpression extends GropuedExpression {
  public readonly classname = '$and'
}

export class OrGroupedExpression extends GropuedExpression {
  public readonly classname = '$or'
}
