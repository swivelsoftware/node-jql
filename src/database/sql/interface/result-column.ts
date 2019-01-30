import { create } from './expression/create'
import { Expression, IExpression } from './expression/index'

export interface IResultColumn {
  expression: IExpression
  $as?: string
}

export class ResultColumn implements IResultColumn {
  public expression: Expression
  public $as?: string

  constructor(json?: IResultColumn) {
    switch (typeof json) {
      case 'object':
        this.expression = create(json.expression)
        this.$as = json.$as
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}
