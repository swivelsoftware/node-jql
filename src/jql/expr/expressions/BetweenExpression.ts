import squel from 'squel'
import { checkNull } from '../../../utils/check'
import { ConditionalExpression, Expression } from '../../expr'
import { IBetweenExpression, IExpression } from '../interface'
import { parseExpr } from '../parse'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} BETWEEN {start} AND {end}`
 */
export class BetweenExpression extends ConditionalExpression implements IBetweenExpression {
  public readonly classname = BetweenExpression.name
  public left: Expression
  public $not: boolean
  public start: Expression
  public end: Expression

  /**
   * @param json [Partial<IBetweenExpression>]
   */
  constructor(json: Partial<IBetweenExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   * @param start [any] optional
   * @param end [any] optional
   */
  constructor(left: any, $not: boolean, start?: any, end?: any)

  constructor(...args: any[]) {
    super()

    // parse args
    let left: any, $not = false, start: any, end: any
    if (args.length === 1) {
      const json = args[0] as IBetweenExpression
      left = json.left
      $not = json.$not || false
      start = json.start
      end = json.end
    }
    else {
      left = args[0]
      $not = args[1]
      start = args[2]
      end = args[3]
    }

    // check args
    if (checkNull(left)) throw new SyntaxError('Missing left expression')

    // set args
    this.left = parseExpr(left)
    this.$not = $not
    this.start = parseExpr(start)
    this.end = parseExpr(end)
  }

  // @override
  public validate(availableTables: string[]): void {
    this.left.validate(availableTables)
    this.start.validate(availableTables)
    this.end.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.$not ? 'NOT ' : ''}BETWEEN ? AND ?`,
        this.left.toSquel(),
        this.start.toSquel(),
        this.end.toSquel(),
      )
  }

  // @override
  public toJson(): IBetweenExpression {
    const result: IBetweenExpression = {
      classname: this.classname,
      left: this.exprToJson(this.left),
    }
    if (this.$not) result.$not = true
    const start = this.exprToJson(this.start)
    if (!checkNull(start)) result.start = start
    const end = this.exprToJson(this.end)
    if (!checkNull(end)) result.end = end
    return result
  }

  private exprToJson(expr: Expression): IExpression|any {
    // if (expr instanceof Unknown) return expr.assigned ? expr.value : undefined
    // if (expr instanceof Value) return expr.value
    return expr.toJson()
  }
}
