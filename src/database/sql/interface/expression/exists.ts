import { IQuery, Query } from '../../query'
import { IExpression, IUnknownExpression } from './index'

export interface IExistsExpression extends IExpression, IUnknownExpression {
  $not?: boolean
  query: IQuery
}

export class ExistsExpression implements IExistsExpression {
  public readonly classname = '$exists'
  public parameters?: string[]
  public $not?: boolean
  public query: Query

  constructor(json?: IExistsExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.$not = json.$not
        this.query = new Query(json.query)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `${this.$not ? 'NOT ' : ''}EXISTS ?`
  }
}
