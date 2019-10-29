import { register } from '../../parse'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { Value } from '../value'

/**
 * {left} IS NULL
 */
export class IsNullExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname = IsNullExpression.name

  // @override
  public readonly operator: BinaryOperator = 'IS'

  constructor(json?: IBinaryExpression) {
    super(json ? { ...json, operator: 'IS', right: new Value(null) } : undefined)
    if (!json) this.setOperator().setRight()
  }

  // @override
  public setOperator(): IsNullExpression {
    return super.setOperator('IS') as IsNullExpression
  }

  // @override
  public setRight(): IsNullExpression {
    return super.setRight(new Value(null)) as IsNullExpression
  }
}

register(IsNullExpression)
