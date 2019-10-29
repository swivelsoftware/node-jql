import { register } from '../../parse'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'

/**
 * {left} IN {right}
 */
export class InExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname = InExpression.name

  // @override
  public readonly operator: BinaryOperator = 'IN'

  constructor(json?: IBinaryExpression) {
    super(json ? { ...json, operator: 'IN' } : undefined)
    if (!json) this.setOperator()
  }

  // @override
  public setOperator(): InExpression {
    return super.setOperator('IN') as InExpression
  }
}

register(InExpression)
