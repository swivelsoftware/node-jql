// tslint:disable:no-eval

import { ILikeExpression, IUnknown } from '../interface'
import { parseExpr } from '../parse'
import { BinaryExpression } from './BinaryExpression'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} LIKE {right}`
 */
export class LikeExpression extends BinaryExpression implements ILikeExpression {
  public readonly classname = LikeExpression.name
  public operator: 'LIKE'|'REGEXP'
  public right: Unknown|Value

  /**
   * @param json [Partial<ILikeExpression>]
   */
  constructor(json: Partial<ILikeExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   * @param right [IUnknown|string] optional
   */
  constructor(left: any, $not: boolean, right?: IUnknown|RegExp|string)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: args[1], right: args[2] } : args[0], true)

    // parse args
    let $not = false, right: IUnknown|RegExp|string|undefined
    if (args.length === 1) {
      const json = args[0] as ILikeExpression
      $not = json.$not || false
      right = json.right
    }
    else {
      $not = args[1]
      right = args[2]
    }

    // check args
    if (typeof right === 'string' && right.startsWith('/') && right.indexOf('/', 1)) {
      right = eval(right) as RegExp
    }

    // set args
    this.$not = $not
    this.right = parseExpr(right)
  }

  // @override
  public toJson(): ILikeExpression {
    const result = super.toJson() as ILikeExpression
    if (result.right && result.right instanceof RegExp) result.right = result.right.toString()
    return result
  }
}
