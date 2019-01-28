import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

export interface IBetweenExpression extends IExpression, IUnknownExpression {
  $not?: boolean
  left: IExpression
  start?: IExpression
  end?: IExpression
}

export class BetweenExpression implements IBetweenExpression {
  public readonly classname = '$between'
  public parameters?: string[]
  public $not?: boolean
  public left: IExpression
  public start?: IExpression
  public end?: IExpression

  constructor(json?: IBetweenExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.$not = json.$not
        this.left = create(json.left)
        if (json.start) this.start = create(json.start)
        if (json.end) this.end = create(json.end)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `? ${this.$not ? 'NOT ' : ''}BETWEEN ? AND ?`
  }
}
