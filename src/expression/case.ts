import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'

export interface ICase {
  $when: IConditionalExpression
  $then: IExpression
}

export class Case implements ICase {
  public $when: ConditionalExpression
  public $then: Expression

  constructor(json: ICase) {
    this.$when = parse(json.$when) as ConditionalExpression
    this.$then = parse(json.$then)
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'Case'
  }

  // @override
  public validate(availableTables: string[]) {
    this.$when.validate(availableTables)
    this.$then.validate(availableTables)
  }

  public toJson(): ICase {
    return {
      $when: this.$when.toJson(),
      $then: this.$then.toJson(),
    }
  }
}

export interface ICaseExpression extends IConditionalExpression {
  cases: ICase[]|ICase
  $else?: IExpression
}

export class CaseExpression extends Expression implements ICaseExpression {
  public readonly classname = 'CaseExpression'
  public cases: Case[]
  public $else?: Expression

  constructor(json: ICaseExpression) {
    super()
    try {
      let cases = json.cases
      if (!Array.isArray(cases)) cases = [cases]
      this.cases = cases.map(case_ => new Case(case_))
      if (!cases.length) throw new SyntaxError('There must be at least 1 case in CaseExpression')
      if (json.$else) this.$else = parse(json.$else)
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate CaseExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'CaseExpression'
  }

  get template(): string {
    return `CASE ${this.cases.map(() => 'WHEN ? THEN ?').join(' ')}${this.$else ? ' ELSE ?' : ''}`
  }

  // @override
  public validate(availableTables: string[]) {
    for (const case_ of this.cases) case_.validate(availableTables)
    if (this.$else) this.$else.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    const params = [] as any[]
    this.cases.forEach(({ $when, $then }) => params.push($when.toSquel(), $then.toSquel()))
    if (this.$else) params.push(this.$else.toSquel())
    return squel.expr().and(this.template, ...params)
  }

  // @override
  public toJson(): ICaseExpression {
    const result: ICaseExpression = {
      classname: this.classname,
      cases: this.cases.map(case_ => case_.toJson()),
    }
    if (this.$else) result.$else = this.$else.toJson()
    return result
  }
}
