import { register } from '../../parse'
import { BinaryExpression } from '../binary'
import { BinaryOperator, IBinaryExpression } from '../binary/index.if'
import { Variable } from '../variable'
import { IExpression } from '../index.if'

/**
 * {left} := {right}
 */
export class SetVariableExpression extends BinaryExpression implements IBinaryExpression {
  // @override
  public readonly classname = SetVariableExpression.name

  // @override
  public readonly operator: BinaryOperator = ':='

  constructor(json?: string|IBinaryExpression) {
    super(typeof json === 'object' ? { ...json, operator: ':=' } : undefined)
    if (typeof json === 'string') this.setLeft(new Variable(json))
    if (typeof json !== 'object') this.setOperator()
  }

  // @override
  public setLeft(expr: IExpression): SetVariableExpression {
    if (expr.classname !== 'Variable') throw new SyntaxError('Left expression must be a Variable')
    return super.setLeft(expr) as SetVariableExpression
  }

  // @override
  public setOperator(): SetVariableExpression {
    return super.setOperator(':=') as SetVariableExpression
  }
}

register(SetVariableExpression)
