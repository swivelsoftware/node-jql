import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '..'
import { checkNull } from '../../../utils/check'
import { JQLError } from '../../../utils/error'
import { parse } from '../parse'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * Binary operator
 */
export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='|'IN'|'IS'|'LIKE'|'REGEXP'

/**
 * Raw JQL for `{left} {operator} {right}`
 */
export interface IBinaryExpression extends IConditionalExpression {
  /**
   * Left expression
   */
  left: any

  /**
   * Whether `NOT` is added before operator
   */
  $not?: boolean

  /**
   * The operator used
   */
  operator: BinaryOperator

  /**
   * Right expression
   */
  right?: any
}

/**
 * JQL class for `{left} {operator} {right}`
 */
export class BinaryExpression extends ConditionalExpression implements IBinaryExpression {
  public readonly classname = BinaryExpression.name
  public left: Expression
  public $not?: boolean
  public operator: BinaryOperator
  public right: any

  /**
   * @param json [Partial<IBinaryExpression>]
   */
  constructor(json: Partial<IBinaryExpression>, ...args: any[])

  /**
   * @param left [any]
   * @param operator [BinaryOperator]
   * @param right [any] optional
   */
  constructor(left: any, operator: BinaryOperator, right?: any)

  constructor(...args: any[]) {
    super()

    // parse args
    let left: any, operator: BinaryOperator = '=', right: any
    if (typeof args[1] !== 'string') {
      const json = args[0] as IBinaryExpression
      left = json.left
      operator = json.operator
      right = json.right
    }
    else {
      left = args[0]
      operator = args[1]
      right = args[2]
    }

    // check args
    if (typeof args[1] === 'boolean' && !args[1]) {
      if (operator === 'IN') throw new JQLError('Use InExpression instead')
      if (operator === 'IS') throw new JQLError('Use IsNullExpression instead')
      if (operator === 'LIKE' || operator === 'REGEXP') throw new JQLError('Use LikeExpression instead')
    }
    if (!left) throw new SyntaxError('Missing left expression')
    if (!operator) throw new SyntaxError('Missing operator')

    // set args
    this.left = parse(left)
    this.operator = operator
    if (!(typeof args[1] === 'boolean' && args[1])) this.right = parse(right)
  }

  // @override
  public validate(availableTables: string[]): void {
    this.left.validate(availableTables)
    if (!checkNull(this.right)) this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.operator} ?`,
        this.left.toSquel(),
        checkNull(this.right) ? null : this.right.toSquel(),
      )
  }

  // @override
  public toJson(): IBinaryExpression {
    const result: IBinaryExpression = {
      classname: this.classname,
      left: this.exprToJson(this.left),
      operator: this.operator,
    }
    if (this.$not) result.$not = this.$not
    if (!checkNull(this.right)) {
      const right = this.exprToJson(this.right)
      if (right) result.right = right
    }
    return result
  }

  private exprToJson(expr: Expression): IExpression|any {
    if (expr instanceof Unknown) return expr.assigned ? expr.value : undefined
    if (expr instanceof Value) return expr.value
    return expr.toJson()
  }
}
