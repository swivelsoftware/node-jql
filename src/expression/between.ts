import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'

export interface IBetweenExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  start?: any
  end?: any
}

export class BetweenExpression extends ConditionalExpression implements IBetweenExpression {
  public readonly classname = 'BetweenExpression'
  public left: Expression
  public $not: boolean
  public start: Expression
  public end: Expression

  constructor(expr: IBetweenExpression) {
    super()
    try {
      this.left = parse(expr.left)
      this.$not = expr.$not || false
      this.start = parse(expr.start)
      this.left = parse(expr.left)
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate BetweenExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'BetweenExpression'
  }

  get template(): string {
    return `? ${this.$not ? 'NOT ' : ''}BETWEEN ? AND ?`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.start.validate(availableTables)
    this.end.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        this.template,
        this.left.toSquel(),
        this.start.toSquel(),
        this.end.toSquel(),
      )
  }
}
