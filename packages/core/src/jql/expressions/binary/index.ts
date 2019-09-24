import format from 'string-format'
import { ConditionalExpression, Expression } from '..'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { Unknown } from '../unknown'
import { BinaryOperator, IBinaryExpression } from './index.if'

/**
 * {left} {operator} {right}
 */
export class BinaryExpression extends ConditionalExpression implements IBinaryExpression {
  // @override
  public readonly classname: string = BinaryExpression.name

  // @override
  public left: Expression

  // @override
  public operator: BinaryOperator

  // @override
  public right: Expression

  constructor(json: IBinaryExpression)
  constructor(left: Expression, operator: BinaryOperator, right: Expression)
  constructor(...args: any[]) {
    super()

    // parse
    let left: IExpression, operator: BinaryOperator, right: IExpression
    if (args.length === 1) {
      const json = args[0] as IBinaryExpression
      left = json.left
      operator = json.operator
      right = json.right || new Unknown(['any'])
    }
    else {
      left = args[0] as Expression
      operator = args[1] as BinaryOperator
      right = args[2] as Expression
    }

    // set
    this.left = parse(left)
    this.operator = operator
    this.right = parse(right)
  }

  // @override
  public toJson(): IBinaryExpression {
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

register(BinaryExpression)
