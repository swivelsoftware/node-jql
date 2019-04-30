import { Expression, IExpression } from '../expression'
import { parse } from '../expression/parse'
import { InstantiateError } from '../utils/error/InstantiateError'

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
      throw new InstantiateError('Fail to instantiate ResultColumn', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'ResultColumn'
  }

  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    return result
  }
}
