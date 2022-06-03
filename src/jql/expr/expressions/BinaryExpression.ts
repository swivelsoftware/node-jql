import squel from '@swivel-admin/squel'
import { ConditionalExpression, Expression } from '..'
import { checkNull } from '../../../utils/check'
import { JQLError } from '../../../utils/error'
import { BinaryOperator, IBinaryExpression, IExpression } from '../interface'
import { parseExpr } from '../parse'

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
      operator = args[1] as BinaryOperator
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
    this.left = parseExpr(left)
    this.operator = operator
    if (!(typeof args[1] === 'boolean' && args[1])) this.right = parseExpr(right)
  }

  // @override
  public validate(availableTables: string[]): void {
    this.left.validate(availableTables)
    if (!checkNull(this.right)) this.right.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.BaseBuilder {
    const squel_ = squel.useFlavour(type as any)
    return squel_.expr()
      .and(
        this.$not ? `? NOT ${this.operator} ?` : `? ${this.operator} ?`,
        this.left.toSquel(type, options),
        checkNull(this.right) ? null : this.right.toSquel(type, options),
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
      if (!checkNull(right)) result.right = right
    }
    return result
  }

  private exprToJson(expr: Expression): IExpression|any {
    return expr.toJson()
  }
}
