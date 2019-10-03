import format from 'string-format'
import { ConditionalExpression, Expression } from '..'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { Unknown } from '../unknown'
import { IBetweenExpression } from './index.if'

/**
 * {left} {$not} BETWEEN {start} AND {end}
 */
export class BetweenExpression extends ConditionalExpression implements IBetweenExpression {
  // @override
  public readonly classname = BetweenExpression.name

  // @override
  public left: Expression = new Unknown()

  // @override
  public $not = false

  // @override
  public start: Expression = new Unknown()

  // @override
  public end: Expression = new Unknown()

  constructor(json?: IBetweenExpression) {
    super()

    if (json) {
      this
        .setLeft(json.left)
        .setNot(json.$not)
        .setStart(json.start)
        .setEnd(json.end)
    }
  }

  /**
   * set LEFT expression
   * @param expr [IExpression]
   */
  public setLeft(expr?: IExpression): BetweenExpression {
    this.left = expr ? parse(expr) : new Unknown()
    return this
  }

  /**
   * set NOT flag
   * @param expr [IExpression]
   */
  public setNot(flag = false): BetweenExpression {
    this.$not = flag
    return this
  }

  /**
   * set START expression
   * @param expr [IExpression]
   */
  public setStart(expr?: IExpression): BetweenExpression {
    this.start = expr ? parse(expr) : new Unknown()
    return this
  }

  /**
   * set END expression
   * @param expr [IExpression]
   */
  public setEnd(expr?: IExpression): BetweenExpression {
    this.end = expr ? parse(expr) : new Unknown()
    return this
  }

  // @override
  public toJson(): IBetweenExpression {
    return {
      classname: this.classname,
      left: this.left.toJson(),
      $not: this.$not,
      start: this.start.toJson(),
      end: this.end.toJson(),
    }
  }

  // @override
  public toString(): string {
    return format(
      this.$not ? '{0} NOT BETWEEN {1} AND {2}' : '{0} BETWEEN {1} AND {2}',
      this.left.toString(),
      this.start.toString(),
      this.end.toString(),
    )
  }
}

register(BetweenExpression)
