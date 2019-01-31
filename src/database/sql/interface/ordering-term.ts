import { JQLError } from '../../../utils/error'
import { Expression, IExpression } from './expression'
import { create } from './expression/__create'

type Order = 'ASC' | 'DESC'

export interface IOrderingTerm {
  expression: IExpression
  order?: Order
}

export class OrderingTerm implements IOrderingTerm {
  public expression: Expression
  public order?: Order

  constructor(json?: IOrderingTerm) {
    switch (typeof json) {
      case 'object':
        try {
          this.expression = create(json.expression)
          if (json.order) this.order = json.order
        }
        catch (e) {
          throw new JQLError('fail to create OrderingTerm block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}
