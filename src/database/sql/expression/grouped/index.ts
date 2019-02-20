import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { GroupedExpressions, GroupedOperator } from './interface'

/**
 * expression `? AND ?`
 */
export class AndExpressions extends GroupedExpressions {
  public readonly classname = 'AndExpressions'

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledGroupedExpressions {
    return new CompiledGroupedExpressions(transaction, 'AND', {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.and(text, ...values)
    }
    return result
  }
}

/**
 * expression `? OR ?`
 */
export class OrExpressions extends GroupedExpressions {
  public readonly classname = 'OrExpressions'

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledGroupedExpressions {
    return new CompiledGroupedExpressions(transaction, 'OR', {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.or(text, ...values)
    }
    return result
  }
}

/**
 * compiled `GroupedExpressions`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    for (const expression of this.expressions) {
      expression.register(unknowns)
    }
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    return this.expressions.reduce((result, expression) => {
      return this.operator === 'AND'
        ? result && expression.evaluate(transaction, cursor)
        : result || expression.evaluate(transaction, cursor)
    }, false)
  }
}
