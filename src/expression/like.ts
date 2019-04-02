import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
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
      throw new InstantiateError('Fail to instantiate LikeExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'LikeExpression'
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
