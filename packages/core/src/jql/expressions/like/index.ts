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
  }

  // @override
  public setOperator(operator: BinaryOperator): LikeExpression {
    throw new SyntaxError('Operator of LikeExpression cannot be changed')
  }
}

register(LikeExpression)
