import squel = require('squel')
import { Expression, IExpression } from '..'
import { checkNull } from '../../../utils/check'
import { parse } from '../parse'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * Mathematical operator
 */
export type MathOperator = '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV'

/**
 * Raw JQL defining mathematical expression
 */
export interface IMathExpression extends IExpression {
  /**
   * Left expression
   */
  left: any

  /**
   * The operator used
   */
  operator: MathOperator

  /**
   * Right expression
   */
  right?: any
}

/**
 * JQL class defining mathematical expression
 */
export class MathExpression extends Expression implements IMathExpression {
  public readonly classname = MathExpression.name
  public left: Expression
  public operator: MathOperator
  public right: Expression

  /**
   * @param json [Partial<IMathExpression>]
   */
  constructor(json: Partial<IMathExpression>)

  /**
   * @param left [any]
   * @param operator [MathOperator]
   * @param right [any] optional
   */
  constructor(left: any, operator: MathOperator, right?: any)

  constructor(...args: any[]) {
    super()

    // parse args
    let left: any, operator: MathOperator = '+', right: any
    if (args.length === 1) {
      const json = args[0] as IMathExpression
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
    if (!left) throw new SyntaxError('Missing left expression')
    if (!operator) throw new SyntaxError('Missing operator')

    // set args
    this.left = parse(left)
    this.operator = operator || '+'
    this.right = parse(right)
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(
      `? ${this.operator} ?`,
      this.left.toSquel(),
      this.right.toSquel(),
    )
  }

  // @override
  public toJson(): IMathExpression {
    const result: IMathExpression = {
      classname: this.classname,
      left: this.left.toJson(),
      operator: this.operator,
    }
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
