import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'

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
  }

  // @override
  public setOperator(operator: BinaryOperator): LikeExpression {
    throw new Error('Operator of LikeExpression cannot be changed')
  }
}

register(LikeExpression)
