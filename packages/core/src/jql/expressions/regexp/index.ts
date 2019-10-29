import { register } from '../../parse'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'

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
    if (!json) this.setOperator()
  }

  // @override
  public setOperator(): RegexpExpression {
    return super.setOperator('REGEXP') as RegexpExpression
  }
}

register(RegexpExpression)
