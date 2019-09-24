import { Expression } from '..'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { register } from '../parse'

/**
 * {left} REGEXP {right}
 */
export class RegexpExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname: string = RegexpExpression.name

  // @override
  public readonly operator: BinaryOperator = 'REGEXP'

  constructor(json: IBinaryExpression)
  constructor(left: Expression, right: Expression)
  constructor(...args: any[]) {
    super(args.length === 1 ? args[0] : { left: args[0] as Expression, operator: 'REGEXP', right: args[1] as Expression })
  }
}

register(RegexpExpression)
