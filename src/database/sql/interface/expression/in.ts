import { IQuery, Query } from '../../query'
import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

export interface InJson extends IExpression, IUnknownExpression {
  $not?: boolean
  left: IExpression
  query?: IQuery
}

export class InExpression implements InJson {
  public readonly classname = '$in'
  public parameters?: string[]
  public $not?: boolean
  public left: IExpression
  public query?: Query

  constructor(json?: InJson) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.$not = json.$not
        this.left = create(json.left)
        if (json.query) { this.query = new Query(json.query) }
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `? ${this.$not ? 'NOT ' : ''}IN ?`
  }
}
