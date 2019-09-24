import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'
import { Value } from '../value'

/**
 * {left} IS NULL
 */
export class IsNullExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname: string = IsNullExpression.name

  // @override
  public readonly operator: BinaryOperator = 'IS'

  constructor(json: IBinaryExpression)
  constructor(left: Expression, right: Expression)
  constructor(...args: any[]) {
    super(args.length === 1 ? args[0] : { left: args[0] as Expression, operator: 'IS', right: new Value(null) })
  }
}

register(IsNullExpression)
