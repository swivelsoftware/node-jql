import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { Case, CompiledCase } from './case'
import { ICaseExpression } from './interface'

/**
 * expression `CASE $cases ELSE ?`
 */
export class CaseExpression extends Expression implements ICaseExpression {
  public readonly classname = 'CaseExpression'
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
  public validate(tables: string[]) {
    for (const case_ of this.cases) case_.validate(tables)
    if (this.$else) this.$else.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledCaseExpression {
    return new CompiledCaseExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    const params = [] as any[]
    const cases = this.cases.map(({ $when, $then }) => {
      params.push($when.toSquel(), $then.toSquel())
      return `WHEN ? THEN ?`
    })
    if (this.$else) params.push(this.$else.toSquel())
    return squel.expr().and(`CASE ${cases.join(' ')}${this.$else ? ' ELSE ?' : ''} END`, ...params)
  }
}

/**
 * compiled `CaseExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    for (const { $when, $then } of this.cases) {
      $when.register(unknowns)
      $then.register(unknowns)
    }
    if (this.$else) this.$else.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): any {
    for (const { $when, $then } of this.cases) {
      if ($when.evaluate(transaction, cursor)) {
        return $then.evaluate(transaction, cursor)
      }
    }
    return this.$else ? this.$else.evaluate(transaction, cursor) : undefined
  }
}
