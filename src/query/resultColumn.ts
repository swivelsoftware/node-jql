import { Expression, IExpression } from '../expression'
import { parse } from '../expression/parse'
import { JQLError } from '../utils/error'

export interface IResultColumn {
  expression: IExpression
  $as?: string
}

export class ResultColumn implements IResultColumn {
  public expression: Expression
  public $as?: string

  constructor(json: IResultColumn) {
    try {
      this.expression = parse(json.expression)
      this.$as = json.$as
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate ResultColumn', e)
    }
  }
}
