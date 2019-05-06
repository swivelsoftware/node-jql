import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'
import { Unknown } from './unknown'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='

export interface IBinaryExpression extends IConditionalExpression {
  left: any
  operator: BinaryOperator
  right?: any
}

export class BinaryExpression extends ConditionalExpression implements IBinaryExpression {
  public readonly classname = 'BinaryExpression'
  public left: Expression
  public operator: BinaryOperator
  public right: Expression

  constructor(expr: IBinaryExpression) {
    super()
    try {
      this.left = parse(expr.left)
      this.operator = expr.operator
      this.right = parse(expr.right)
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate BinaryExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'BinaryExpression'
  }

  get template(): string {
    return `? ${this.operator} ?`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        this.template,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }

  // @override
  public toJson(): IBinaryExpression {
    const result: IBinaryExpression = {
      classname: this.classname,
      left: this.left.toJson(),
      operator: this.operator,
    }
    if (!(this.right instanceof Unknown) || this.right.value) result.right = this.right.toJson()
    return result
  }
}
