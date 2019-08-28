import squel from 'squel'
import { Query } from '../../query'
import { IQuery } from '../../query/interface'
import { IInExpression, IUnknown, IValue } from '../interface'
import { parseExpr } from '../parse'
import { BinaryExpression } from './BinaryExpression'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} IN {right}`
 */
export class InExpression extends BinaryExpression implements IInExpression {
  public readonly classname = InExpression.name
  public operator: 'IN'
  public right: Unknown|Value|Query

  /**
   * @param json [Partial<IInExpression>]
   */
  constructor(json: Partial<IInExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   * @param right [IUnknown|IValue|Array|IQuery] optional
   */
  constructor(left: any, $not: boolean, right?: IUnknown|IValue|any[]|IQuery)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: 'IN', right: args[2] } : { ...args[0], operator: 'IN' }, true)

    // parse args
    let $not = false, right: IUnknown|IValue|any[]|IQuery|undefined
    if (args.length === 1) {
      const json = args[0] as IInExpression
      $not = json.$not || false
      right = json.right
    }
    else {
      $not = args[1]
      right = args[2]
    }

    // set args
    this.$not = $not
    if (right && !Array.isArray(right) && right.classname === 'Query') this.right = new Query(right as IQuery)
    if (!this.right) this.right = parseExpr<Unknown|Value>(right)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.$not ? 'NOT ' : ''}IN ?`,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }
}
