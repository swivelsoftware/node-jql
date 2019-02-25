import { JQLError } from '../../../../utils/error'
import { Transaction } from '../../../transaction'
import { parseExpression } from '../../expression'
import { AndExpressions } from '../../expression/grouped'
import { CompiledExpression, ConditionalExpression, Expression } from '../../expression/interface'
import { CompiledSymbolExpression, SymbolExpression } from '../../expression/symbol'
import { CompiledUnknownExpression } from '../../expression/unknown'
import { ICompileSqlOptions } from '../../interface'
import { IGroupBy } from './interface'

/**
 * expression `GROUP BY ... HAVING ...`
 */
export class GroupBy implements IGroupBy {
  public expressions: Expression[]
  public $having?: ConditionalExpression

  constructor(json: IGroupBy) {
    try {
      let expressions = json.expressions
      if (!Array.isArray(expressions)) expressions = [expressions]
      this.expressions = expressions.map((expression) => parseExpression(expression))
      if (json.$having) this.$having = Array.isArray(json.$having) ? new AndExpressions({ expressions: json.$having }) : parseExpression(json.$having) as ConditionalExpression
    }
    catch (e) {
      throw new JQLError('Fail to instantiate GroupBy', e)
    }
  }
}

/**
 * compiled `GroupBy`
 * each expression must be binded to a symbol
 * i.e. there must be a corresponding `ResultColumn`
 */
export class CompiledGroupBy {
  public readonly expressions: CompiledSymbolExpression[]
  public readonly $having?: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<GroupBy>, symbolize: (expression: Expression) => SymbolExpression) {
    try {
      this.expressions = options.parent.expressions.map((expression, i) => {
        const result = symbolize(expression).compile(transaction, options)
        return result
      })
      if (options.parent.$having) this.$having = options.parent.$having.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile GroupBy', e)
    }
  }

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    for (const expression of this.expressions) {
      expression.register(unknowns)
    }
    if (this.$having) this.$having.register(unknowns)
  }
}
