import { JQLError } from '../../../../utils/error'
import { Transaction } from '../../../transaction'
import { parseExpression } from '../../expression'
import { CompiledExpression, Expression } from '../../expression/interface'
import { CompiledUnknownExpression } from '../../expression/unknown'
import { ICompileSqlOptions } from '../../interface'
import { IOrderingTerm, Order } from './interface'

/**
 * expression `ORDER BY ...`
 */
export class OrderingTerm implements IOrderingTerm {
  public expression: Expression
  public order: Order

  constructor(json: IOrderingTerm) {
    try {
      this.expression = parseExpression(json.expression)
      this.order = json.order || 'ASC'
    }
    catch (e) {
      throw new JQLError('Fail to instantiate OrderingTerm', e)
    }
  }
}

/**
 * compiled `OrderingTerm`
 */
export class CompiledOrderingTerm {
  public readonly expression: CompiledExpression
  public readonly order: Order
  public readonly symbol: symbol

  constructor(transaction: Transaction, options: ICompileSqlOptions<OrderingTerm>, symbol?: symbol) {
    try {
      this.expression = options.parent.expression.compile(transaction, options)
      this.order = options.parent.order
      this.symbol = symbol || Symbol(this.expression.toString())
    }
    catch (e) {
      throw new JQLError('Fail to compile OrderingTerm', e)
    }
  }

  public register(unknowns: CompiledUnknownExpression[]) {
    this.expression.register(unknowns)
  }
}
