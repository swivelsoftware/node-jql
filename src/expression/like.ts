import squel from 'squel'
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'
import { Unknown } from './unknown'

export interface ILikeExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  right?: Unknown|string
}

export class LikeExpression extends ConditionalExpression implements ILikeExpression {
  public readonly classname = 'LikeExpression'
  public left: Expression
  public $not?: boolean
  public right: Unknown|string

  constructor(json: ILikeExpression) {
    super()
    try {
      this.$not = json.$not
      this.left = parse(json.left)
      this.right = json.right || new Unknown()
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
    params.push(typeof this.right === 'string' ? this.right : this.right.toSquel())
    return squel.expr()
      .and(
        this.template,
        ...params,
      )
  }

  // @override
  public toJson(): ILikeExpression {
    const result: ILikeExpression = {
      classname: this.classname,
      left: this.left.toJson(),
    }
    if (this.$not) result.$not = this.$not
    if (typeof this.right === 'string') result.right = this.right
    return result
  }
}
