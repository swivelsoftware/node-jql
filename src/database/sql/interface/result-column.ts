import { create } from './expression/create'
import { IExpression } from './expression/index'

export interface IResultColumn {
  expression: IExpression
  $as?: string
}

export class ResultColumn implements IResultColumn {
  public expression: IExpression
  public $as?: string

  constructor(resultColumn?: IResultColumn) {
    switch (typeof resultColumn) {
      case 'object':
        this.expression = create(resultColumn.expression)
        this.$as = resultColumn.$as
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'resultColumn' object`)
    }
  }
}
