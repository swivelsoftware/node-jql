import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { Expression, IExpression } from './__base'
import { create } from './__create'

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
        throw new JQLError(`invalid 'json' object`)
    }
  }
}

export interface ICaseExpression {
  cases: ICase[]|ICase
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
      if (!cases.length) throw new JQLError('there must be at least 1 case in $case')
      if (json.$else) this.$else = create(json.$else)
    }
  }

  public toSquel(): squel.BaseBuilder {
    let result = squel.case(null as any)
    for (const { $when, $then } of this.cases) {
      result = result
        .when('?', $when.toSquel())
        .then($then.toSquel())
    }
    if (this.$else) result = result.else(this.$else.toSquel())
    return result
  }
}
