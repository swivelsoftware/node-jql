import squel from 'squel'
import { Expression } from '..'
import { Query } from '../../query'
import { IQuery } from '../../query/interface'
import { BinaryOperator, ICaseExpression, IExpression, IInExpression, IQueryExpression, IUnknown, IValue } from '../interface'
import { parseExpr } from '../parse'
import { BinaryExpression } from './BinaryExpression'
import { CaseExpression } from './CaseExpression'
import { QueryExpression } from './QueryExpression'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} IN {right}`
 */
export class InExpression extends BinaryExpression implements IInExpression {
  public readonly classname = InExpression.name
  public readonly operator: BinaryOperator = 'IN'
  public right: Unknown|Value|QueryExpression|CaseExpression

  /**
   * @param json [Partial<IInExpression>]
   */
  constructor(json: Partial<IInExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   * @param right [IUnknown|IValue|Array|IQuery|IQueryExpression|ICaseExpression] optional
   */
  constructor(left: any, $not: boolean, right?: IUnknown|IValue|any[]|IQuery|IQueryExpression|ICaseExpression)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: 'IN', right: args[2] } : { ...args[0], operator: 'IN' }, true)

    // parse args
    let $not = false, right: IUnknown|IValue|any[]|IQueryExpression|ICaseExpression|undefined
    if (args.length === 1) {
      const json = args[0] as IInExpression
      $not = json.$not || false
      right = json.right && 'classname' in json.right && json.right.classname === 'Query'
        ? new QueryExpression(json.right)
        : json.right
    }
    else {
      $not = args[1]
      right = args[2] && args[2].classname === 'Query'
      ? new QueryExpression(args[2])
      : args[2]
    }

    // set args
    this.$not = $not
    this.right = parseExpr(right)
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
