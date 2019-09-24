import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'

/**
 * {left} IN {right}
 */
export class InExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname: string = InExpression.name

  // @override
  public readonly operator: BinaryOperator = 'IN'

  constructor(json: IBinaryExpression)
  constructor(left: Expression, right: Expression)
  constructor(...args: any[]) {
    super(args.length === 1 ? args[0] : { left: args[0] as Expression, operator: 'IN', right: args[1] as Expression })
  }
}

register(InExpression)
