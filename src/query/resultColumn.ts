import { Expression, IExpression } from '../expression'
import { parse } from '../expression/parse'
import { Unknown } from '../expression/unknown'
import { JQLError } from '../utils/error'
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
      if (this.expression instanceof Unknown) throw new JQLError('A ResultColumn should not be Unknown')
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
}
