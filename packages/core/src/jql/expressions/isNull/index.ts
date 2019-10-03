import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { IExpression } from '../index.if'
import { register } from '../parse'
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
  }

  // @override
  public setOperator(operator: BinaryOperator): IsNullExpression {
    throw new Error('Operator of IsNullExpression cannot be changed')
  }

  // @override
  public setRight(expr: IExpression): IsNullExpression {
    throw new Error('Right expression of IsNullExpression cannot be changed')
  }
}

register(IsNullExpression)
