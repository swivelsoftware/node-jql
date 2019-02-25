import { JQLError } from '../../../../utils/error'
import { Type } from '../../../schema/interface'
import { Transaction } from '../../../transaction'
import { parseExpression } from '../../expression'
import { CompiledCaseExpression } from '../../expression/case'
import { CompiledColumnExpression } from '../../expression/column'
import { CompiledFunctionExpression } from '../../expression/function'
import { CompiledExpression, Expression } from '../../expression/interface'
import { CompiledUnknownExpression } from '../../expression/unknown'
import { CompiledValueExpression } from '../../expression/value'
import { ICompileSqlOptions } from '../../interface'
import { IResultColumn } from './interface'

/**
 * expression `SELECT ...`
 */
export class ResultColumn implements IResultColumn {
  public expression: Expression
  public $as?: string

  constructor(json: IResultColumn) {
    try {
      this.expression = parseExpression(json.expression)
      this.$as = json.$as
    }
    catch (e) {
      throw new JQLError('Fail to instantiate ResultColumn', e)
    }
  }
}

/**
 * compiled `ResultColumn`
 */
export class CompiledResultColumn {
  public readonly expression: CompiledExpression
  public readonly type: Type
  public readonly $as?: string
  public readonly symbol: symbol

  constructor(transaction: Transaction, options: ICompileSqlOptions<ResultColumn>) {
    try {
      this.expression = options.parent.expression.compile(transaction, options)
      this.$as = options.parent.$as
      this.symbol = Symbol(this.$as || this.expression.toString())
      if (this.expression instanceof CompiledCaseExpression) {
        this.type = 'any'
      }
      else if (this.expression instanceof CompiledColumnExpression) {
        this.type = this.expression.column.type
        this.symbol = this.expression.column.symbol
      }
      else if (this.expression instanceof CompiledFunctionExpression) {
        this.type = this.expression.jqlFunction.type
      }
      else if (this.expression instanceof CompiledValueExpression) {
        this.type = this.expression.type
      }
      else {
        this.type = 'boolean'
      }
    }
    catch (e) {
      throw new JQLError('Fail to compile ResultColumn', e)
    }
  }

  public register(unknowns: CompiledUnknownExpression[]) {
    this.expression.register(unknowns)
  }

  // @override
  public toString(): string {
    return this.expression.toString()
  }
}
