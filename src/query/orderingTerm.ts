import { Expression, IExpression } from '../expression'
import { parse } from '../expression/parse'
import { InstantiateError } from '../utils/error/InstantiateError'

export type Order = 'ASC'|'DESC'

export interface IOrderingTerm {
  expression: IExpression
  order?: Order
}

export class OrderingTerm implements IOrderingTerm {
  public expression: Expression
  public order: Order

  constructor(json: IOrderingTerm) {
    try {
      this.expression = parse(json.expression)
      this.order = json.order || 'ASC'
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate OrderingTerm', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'OrderingTerm'
  }

  public toJson(): IOrderingTerm {
    return {
      expression: this.expression.toJson(),
      order: this.order,
    }
  }
}
