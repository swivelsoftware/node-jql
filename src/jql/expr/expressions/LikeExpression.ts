import { BinaryOperator, ILikeExpression, IUnknown } from '../interface'
import { parseExpr } from '../parse'
import { BinaryExpression } from './BinaryExpression'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} LIKE {right}`
 */
export class LikeExpression extends BinaryExpression implements ILikeExpression {
  public readonly classname = LikeExpression.name
  public readonly operator: BinaryOperator = 'LIKE'
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
  constructor(left: any, $not: boolean, right?: IUnknown|string)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: 'LIKE', right: args[2] } : { ...args[0], operator: 'LIKE' }, true)

    // parse args
    let $not = false, right: IUnknown|string|undefined
    if (args.length === 1) {
      const json = args[0] as ILikeExpression
      $not = json.$not || false
      right = json.right
    }
    else {
      $not = args[1]
      right = args[2]
    }

    // set args
    this.$not = $not
    this.right = parseExpr(right)
  }
}
