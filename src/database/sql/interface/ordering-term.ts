import { create } from './expression/create'
import { Expression, IExpression } from './expression/index'

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
        this.expression = create(json.expression)
        if (json.order) this.order = json.order
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}
