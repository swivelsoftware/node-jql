import squel = require('squel')
import { create } from './create'
import { Expression, IExpression } from './index'

interface ICase {
  $when: IExpression
  $then: IExpression
}

export class Case implements ICase {
  public $when: Expression
  public $then: Expression

  constructor(json?: ICase) {
    switch (typeof json) {
      case 'object':
        this.$when = create(json.$when)
        this.$then = create(json.$then)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}

export interface ICaseExpression {
  cases: ICase[] | ICase
  $else?: IExpression
}

export class CaseExpression extends Expression implements ICaseExpression {
  public readonly classname = '$case'
  public cases: Case[]
  public $else?: Expression

  constructor(json?: ICaseExpression) {
    super(json)
    if (json) {
      let cases = json.cases
      if (!Array.isArray(cases)) cases = [cases]
      this.cases = cases.map((case_) => new Case(case_))
      if (!cases.length) throw new Error('there must be at least 1 case in $case')
      if (json.$else) this.$else = create(json.$else)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const result = squel.expr() // TODO use squel.case()
    const params: any[] = []
    const cases = this.cases.map(({ $when, $then }) => {
      params.push($when.toSquel())
      params.push($then.toSquel())
      return `WHEN ? THEN ?`
    })
    const expr = `CASE ${cases.join(' ')}${this.$else ? ' ELSE ?' : ''} END`
    if (this.$else) params.push(this.$else.toSquel())
    return result.and(expr, ...params)
  }
}
