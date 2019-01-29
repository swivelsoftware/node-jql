import squel = require('squel')
import { create } from './create'
import { Expression, IExpression, IUnknownExpression } from './index'

type ExprOperator = '=' | '<>' | '<' | '<=' | '>' | '>=' | 'IS' | 'IS NULL' | 'IS NOT NULL' | 'LIKE' | 'NOT LIKE'

export interface IBinaryExpression extends IUnknownExpression {
  left: IExpression
  operator: ExprOperator
  right?: IExpression
}

export class BinaryExpression extends Expression implements IBinaryExpression {
  public readonly classname = '$binary'
  public left: Expression
  public operator: ExprOperator
  public right?: Expression

  constructor(json?: IBinaryExpression) {
    super(json)
    if (json) {
      this.left = create(json.left)
      this.operator = json.operator
      if (json.right) this.right = create(json.right)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const parameters = [...(this.parameters || [])]
    const result = squel.expr()
    const expr = `? ${this.operator} ?`
    const params: any[] = []
    params.push(this.left.toSquel())
    params.push(this.right ? this.right.toSquel() : parameters.shift())
    return result.and(expr, ...params)
  }
}
