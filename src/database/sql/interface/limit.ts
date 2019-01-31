import { JQLError } from '../../../utils/error'
import { Expression, IExpression } from './expression'
import { create } from './expression/__create'

export interface ILimit {
  expression: IExpression
  $offset?: IExpression
}

const allow = ['$case', '$function', '$value']

export class Limit implements ILimit {
  public expression: Expression
  public $offset?: Expression

  constructor(json?: ILimit) {
    switch (typeof json) {
      case 'object':
        try {
          this.expression = create(json.expression, { allow })
          if (json.$offset) this.$offset = create(json.$offset, { allow })
        }
        catch (e) {
          throw new JQLError('fail to create Limit block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}
