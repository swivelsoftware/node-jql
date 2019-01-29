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

  constructor(orderingTerm?: IOrderingTerm) {
    switch (typeof orderingTerm) {
      case 'object':
        this.expression = create(orderingTerm.expression)
        if (orderingTerm.order) this.order = orderingTerm.order
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'orderingTerm' object`)
    }
  }
}
