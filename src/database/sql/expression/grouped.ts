import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression, IExpression } from './core'
import { parseExpression } from './utils'

export type GroupedOperator = 'AND'|'OR'

export interface IGroupedExpression {
  expressions: IExpression[]
}

abstract class GroupedExpressions extends Expression implements IConditionalExpression, IGroupedExpression {
  public readonly classname: string = 'GroupedExpressions'
  public expressions: Expression[]

  constructor(json: IGroupedExpression) {
    super()
    try {
      this.expressions = json.expressions.map((expression) => parseExpression(expression))
    }
    catch (e) {
      throw new JQLError('Fail to instantiate GroupedExpressions', e)
    }
  }
}

export class AndExpressions extends GroupedExpressions {
  public readonly classname = 'AndExpressions'

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledGroupedExpressions {
    return new CompiledGroupedExpressions(transaction, 'AND', {
      ...options,
      parent: this,
    })
  }
}

export class OrExpressions extends GroupedExpressions {
  public readonly classname = 'OrExpressions'

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledGroupedExpressions {
    return new CompiledGroupedExpressions(transaction, 'OR', {
      ...options,
      parent: this,
    })
  }
}

export class CompiledGroupedExpressions extends CompiledExpression {
  public readonly expressions: CompiledExpression[]

  constructor(transaction: Transaction, readonly operator: GroupedOperator, options: ICompileSqlOptions<GroupedExpressions>) {
    super(transaction, options)
    try {
      this.expressions = options.parent.expressions.map((expression) => expression.compile(transaction, options))
    }
    catch (e) {
      throw new JQLError('Fail to compile GroupedExpressions', e)
    }
  }
}
