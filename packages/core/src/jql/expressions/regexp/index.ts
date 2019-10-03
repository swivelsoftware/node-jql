import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'

/**
 * {left} REGEXP {right}
 */
export class RegexpExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname = RegexpExpression.name

  // @override
  public readonly operator: BinaryOperator = 'REGEXP'

  constructor(json?: IBinaryExpression) {
    super(json ? { ...json, operator: 'REGEXP' } : undefined)
  }

  // @override
  public setOperator(operator: BinaryOperator): RegexpExpression {
    throw new Error('Operator of RegexpExpression cannot be changed')
  }
}

register(RegexpExpression)
