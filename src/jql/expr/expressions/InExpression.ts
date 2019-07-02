import squel from 'squel'
import { IQuery, Query } from '../../query'
import { parse } from '../parse'
import { BinaryExpression, IBinaryExpression } from './BinaryExpression'
import { IUnknown, Unknown } from './Unknown'
import { IValue, Value } from './Value'

/**
 * Raw JQL for `{left} IN {right}`
 */
export interface IInExpression extends IBinaryExpression {
  operator: 'IN',
  right?: IUnknown|IValue|any[]|IQuery
}

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
    super(args.length > 1 ? { left: args[0], operator: 'IN', right: args[2] } : args[0], true)

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
    if (!this.right) this.right = parse<Unknown|Value>(right)
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
