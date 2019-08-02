import squel from 'squel'
import { IIsNullExpression } from '../interface'
import { BinaryExpression } from './BinaryExpression'

/**
 * JQL class for `{left} IS NULL`
 */
export class IsNullExpression extends BinaryExpression implements IIsNullExpression {
  public readonly classname = IsNullExpression.name
  public operator: 'IS'
  public right: null

  /**
   * @param json [Partial<IIsNullExpression>]
   */
  constructor(json: Partial<IIsNullExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   */
  constructor(left: any, $not: boolean)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: 'IS' } : args[0], true)

    // parse args
    let $not = false
    if (args.length === 1) {
      const json = args[0] as IIsNullExpression
      $not = json.$not || false
    }
    else {
      $not = args[1]
    }

    // set args
    this.$not = $not
    this.right = null
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? IS ${this.$not ? 'NOT ' : ''}NULL`,
        this.left.toSquel(),
      )
  }
}
