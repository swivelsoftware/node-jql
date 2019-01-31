import { JQLError } from '../../../utils/error'
import { Expression, IExpression } from './expression'
import { create } from './expression/__create'

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
        try {
          this.expression = create(json.expression)
          this.$as = json.$as
        }
        catch (e) {
          throw new JQLError('fail to create ResultColumn block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}
