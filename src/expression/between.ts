import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'
import { Unknown } from './unknown'

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
      this.end = parse(expr.end)
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

  // @override
  public toJson(): IBetweenExpression {
    const result: IBetweenExpression = {
      classname: this.classname,
      left: this.left.toJson(),
    }
    if (this.$not) result.$not = true
    if (!(this.start instanceof Unknown) || this.start.value) result.start = this.start.toJson()
    if (!(this.end instanceof Unknown) || this.end.value) result.end = this.end.toJson()
    return result
  }
}
