import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'

/**
 * {left} LIKE {right}
 */
export class LikeExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname: string = LikeExpression.name

  // @override
  public readonly operator: BinaryOperator = 'LIKE'

  constructor(json: IBinaryExpression)
  constructor(left: Expression, right: Expression)
  constructor(...args: any[]) {
    super(args.length === 1 ? args[0] : { left: args[0] as Expression, operator: 'LIKE', right: args[1] as Expression })
  }
}

register(LikeExpression)
