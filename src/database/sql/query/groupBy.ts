import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { CompiledExpression, Expression, IExpression } from '../expression/core'
import { AndExpressions } from '../expression/grouped'
import { parseExpression } from '../expression/utils'
import { ICompileSqlOptions } from './base'

export interface IGroupBy {
  expressions: IExpression[]|IExpression
  $having?: IExpression[]|IExpression
}

export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: Expression

  constructor(json: IGroupBy) {
    try {
      let expressions = json.expressions
      if (!Array.isArray(expressions)) expressions = [expressions]
      this.expressions = expressions.map((expression) => parseExpression(expression))
      if (json.$having) this.$having = Array.isArray(json.$having) ? new AndExpressions({ expressions: json.$having }) : parseExpression(json.$having)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate GroupBy', e)
    }
  }
}

export class CompiledGroupBy {
  public readonly expressions: CompiledExpression[]
  public readonly $having?: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<GroupBy>) {
    try {
      this.expressions = options.parent.expressions.map((expression) => expression.compile(transaction, options))
      if (options.parent.$having) this.$having = options.parent.$having.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile GroupBy', e)
    }
  }
}
