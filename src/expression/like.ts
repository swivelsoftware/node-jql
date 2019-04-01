import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '.'
import { JQLError } from '../utils/error'
import { parse } from './parse'

export interface ILikeExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  right?: string
}

export class LikeExpression extends ConditionalExpression implements ILikeExpression {
  public readonly classname = 'LikeExpression'
  public left: Expression
  public $not?: boolean
  public right?: string

  constructor(json: ILikeExpression) {
    super()
    try {
      this.$not = json.$not
      this.left = parse(json.left)
      this.right = json.right
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate LikeExpression', e)
    }
  }

  get template(): string {
    return `? ${this.$not ? 'NOT ' : ''}LIKE ?`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    const params = [this.left.toSquel()] as any[]
    if (this.right) params.push(this.right)
    return squel.expr()
      .and(
        this.template,
        ...params,
      )
  }
}
