import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { CompiledExpression, Expression, IExpression } from '../expression/core'
import { parseExpression } from '../expression/utils'
import { ICompileSqlOptions } from './base'

type Order = 'ASC'|'DESC'

export interface IOrderingTerm {
  expression: IExpression
  order?: Order
}

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

export class CompiledOrderingTerm {
  public readonly expression: CompiledExpression
  public readonly order: Order
  public readonly symbol: symbol

  constructor(transaction: Transaction, options: ICompileSqlOptions<OrderingTerm>) {
    try {
      this.expression = options.parent.expression.compile(transaction, options)
      this.order = options.parent.order
      this.symbol = Symbol(this.expression.toString())
    }
    catch (e) {
      throw new JQLError('Fail to compile OrderingTerm', e)
    }
  }
}
