import squel = require('squel')
import { ICursor } from '../../cursor/interface'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../interface'
import { CompiledExpression, Expression } from './interface'
import { CompiledUnknownExpression } from './unknown'

/**
 * symbolized expression
 * 1) resultColumn-groupBy mapping
 * 2) resultColumn-orderingTerm mapping
 */
export class SymbolExpression extends Expression {
  public readonly classname: string
  public readonly symbol: symbol

  constructor(readonly expression: Expression, symbol: symbol) {
    super()
    Object.assign(this, expression)
    this.classname = expression.classname
    this.symbol = symbol
  }

  // @override
  public validate(tables: string[]) {
    this.expression.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledSymbolExpression {
    return new CompiledSymbolExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.BaseBuilder {
    return this.expression.toSquel()
  }
}

/**
 * compiled `SymbolExpression`
 */
export class CompiledSymbolExpression extends CompiledExpression {
  public readonly expression: CompiledExpression
  public readonly symbol: symbol

  constructor(transaction: Transaction, options: ICompileSqlOptions<SymbolExpression>) {
    super(transaction, options)
    this.symbol = options.parent.symbol
  }

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.expression.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): any {
    return this.expression.evaluate(transaction, cursor)
  }
}
