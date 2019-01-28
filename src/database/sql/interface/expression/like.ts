import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

export interface ILikeExpression extends IExpression, IUnknownExpression {
  $not?: boolean
  left: IExpression
  right?: IExpression
}

export class LikeExpression implements ILikeExpression {
  public readonly classname = '$like'
  public parameters?: string[]
  public $not?: boolean
  public left: IExpression
  public right?: IExpression

  constructor(json?: ILikeExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.$not = json.$not
        this.left = create(json.left)
        if (json.right) this.right = create(json.right)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `? ${this.$not ? 'NOT ' : ''}LIKE ?`
  }
}
