import { register } from '../../parse'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'

/**
 * {left} LIKE {right}
 */
export class LikeExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname = LikeExpression.name

  // @override
  public readonly operator: BinaryOperator = 'LIKE'

  constructor(json?: IBinaryExpression) {
    super(json ? { ...json, operator: 'LIKE' } : undefined)
    if (!json) this.setOperator()
  }

  // @override
  public setOperator(): LikeExpression {
    return super.setOperator('LIKE') as LikeExpression
  }
}

register(LikeExpression)
