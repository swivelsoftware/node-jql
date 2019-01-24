import { Expression } from "./expression/index";
import { create } from "./expression/__create";

type Order = 'ASC' | 'DESC'

interface OrderingTermJson {
  expression: Expression
  order?: Order
}

export class OrderingTerm implements OrderingTermJson {
  expression: Expression
  order?: Order

  constructor (orderingTerm?: OrderingTermJson) {
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