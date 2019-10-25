import format from 'string-format'
import { Expression } from '..'
import { Type } from '../../index.if'
import { parse, register } from '../../parse'
import { IExpression } from '../index.if'
import { Unknown } from '../unknown'
import { IMathExpression, MathOperator } from './index.if'

/**
 * {left} {operator} {right}
 */
export class MathExpression extends Expression implements IMathExpression {
  // @override
  public readonly classname = MathExpression.name

  // @override
  public readonly returnType: Type = 'number'

  // @override
  public left: Expression = new Unknown()

  // @override
  public operator: MathOperator = '+'

  // @override
  public right: Expression = new Unknown()

  constructor(json?: IMathExpression) {
    super()

    if (json) {
      this
        .setLeft(json.left)
        .setOperator(json.operator)
        .setRight(json.right)
    }
  }

  /**
   * set LEFT expression
   * @param expr [IExpression]
   */
  public setLeft(expr?: IExpression): MathExpression {
    this.left = expr ? parse(expr) : new Unknown()
    return this
  }

  /**
   * set binary operator
   * @param operator [MathOperator]
   */
  public setOperator(operator: MathOperator): MathExpression {
    this.operator = operator
    return this
  }

  /**
   * set RIGHT expression
   * @param expr [IExpression]
   */
  public setRight(expr?: IExpression): MathExpression {
    this.right = expr ? parse(expr) : new Unknown()
    return this
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

  // @override
  public toString(): string {
    return format('{0} {1} {2}',
      this.left.toString(),
      this.operator,
      this.right.toString(),
    )
  }
}

register(MathExpression)
