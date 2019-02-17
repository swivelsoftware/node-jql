import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { parseExpression } from './utils'

interface ICase {
  $when: IConditionalExpression
  $then: any
}

export class Case implements ICase {
  public $when: Expression
  public $then: Expression

  constructor(json: ICase) {
    this.$when = parseExpression(json.$when)
    this.$then = parseExpression(json.$then)
  }
}

export class CompiledCase {
  public readonly $when: CompiledExpression
  public readonly $then: CompiledExpression

  constructor(transaction: Transaction, rawCase: Case, options: ICompileOptions) {
    this.$when = rawCase.$when.compile(transaction, options)
    this.$then = rawCase.$then.compile(transaction, options)
  }
}

export interface ICaseExpression {
  cases: ICase[]|ICase
  $else?: any
}

export class CaseExpression extends Expression implements IConditionalExpression, ICaseExpression {
  public readonly classname: string = 'CaseExpression'
  public cases: Case[]
  public $else?: Expression

  constructor(json: ICaseExpression) {
    super()
    let cases = json.cases
    if (!Array.isArray(cases)) cases = [cases]
    this.cases = cases.map((case_) => new Case(case_))
    if (!cases.length) throw new JQLError('There must be at least 1 case in CaseExpression')

    try {
      if (json.$else) this.$else = parseExpression(json.$else)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate CaseExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledCaseExpression {
    return new CompiledCaseExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledCaseExpression extends CompiledExpression {
  public readonly cases: CompiledCase[]
  public readonly $else?: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<CaseExpression>) {
    super(transaction, options)
    try {
      this.cases = options.parent.cases.map((case_) => new CompiledCase(transaction, case_, options))
      if (options.parent.$else) this.$else = options.parent.$else.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile CaseExpression', e)
    }
  }
}
