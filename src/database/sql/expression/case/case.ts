import { parseExpression } from '..'
import { Transaction } from '../../../transaction'
import { ICompileOptions } from '../../interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { ICase } from './interface'

/**
 * expression `WHEN ? THEN ?` in `CaseExpression`
 */
export class Case implements ICase {
  public $when: ConditionalExpression
  public $then: Expression

  constructor(json: ICase) {
    this.$when = parseExpression(json.$when) as ConditionalExpression
    this.$then = parseExpression(json.$then)
  }

  public validate(tables: string[]) {
    this.$when.validate(tables)
    this.$then.validate(tables)
  }
}

/**
 * compiled `Case`
 */
export class CompiledCase {
  public readonly $when: CompiledExpression
  public readonly $then: CompiledExpression

  constructor(transaction: Transaction, case_: Case, options: ICompileOptions) {
    this.$when = case_.$when.compile(transaction, options)
    this.$then = case_.$then.compile(transaction, options)
  }
}
