import { Expression } from '..'
import { Type } from '../../index.if'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { IMathExpression, MathOperator } from './index.if'

/**
 * {left} {operator} {right}
 */
export class MathExpression extends Expression implements IMathExpression {
  // @override
  public readonly classname: string = MathExpression.name

  // @override
  public readonly returnType: Type = 'number'

  // @override
  public left: Expression

  // @override
  public operator: MathOperator

  // @override
  public right: Expression

  constructor(json: IMathExpression)
  constructor(left: Expression, operator: MathOperator, right: Expression)
  constructor(...args: any[]) {
    super()

    // parse
    let left: IExpression, operator: MathOperator, right: IExpression
    if (args.length === 1) {
      const json = args[0] as IMathExpression
      left = json.left
      operator = json.operator
      right = json.right
    }
    else {
      left = args[0] as Expression
      operator = args[1] as MathOperator
      right = args[2] as Expression
    }

    // set
    this.left = parse(left)
    this.operator = operator
    this.right = parse(right)
  }

  // @override
  public toJson(): IMathExpression {
    return {
      classname: this.classname,
      left: this.left.toJson(),
      operator: this.operator,
      right: this.right.toJson(),
    }
  }
}

register(MathExpression)
