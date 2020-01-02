import _ = require('lodash')
import { Expression } from '.'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { ICase, ICaseExpression } from './index.if'
import { isUnknown } from './unknown'
import { Value } from './value'

class Builder implements IBuilder<CaseExpression> {
  private json: ICaseExpression = {
    classname: CaseExpression.name,
    cases: [],
  }

  /**
   * Add case
   * @param when [IExpression]
   * @param then [IExpression]
   */
  public case(when: IExpression, then: IExpression): Builder {
    this.json.cases.push({ when, then })
    return this
  }

  /**
   * Set `else` expression
   * @param json [IExpression]
   */
  public else(json: IExpression): Builder {
    this.json.else = json
    return this
  }

  // @override
  public build(): CaseExpression {
    if (!this.json.cases.length) throw new SyntaxError(`You must specify at least 1 case`)
    return new CaseExpression(this.json)
  }

  // @override
  public toJson(): ICaseExpression {
    return _.cloneDeep(this.json)
  }
}

/**
 * WHEN [when] THEN [then]
 */
class Case implements ICase {
  public readonly when: Expression
  public readonly then: Expression

  constructor(json: ICase) {
    this.when = parse(json.when)
    this.then = parse(json.then)
  }
}

/**
 * [left] (NOT) [operator] [right]
 */
export class CaseExpression extends Expression implements ICaseExpression {
  public static Builder = Builder

  public readonly classname: string = CaseExpression.name
  public readonly cases: Case[]
  public readonly else: Expression = new Value(null)

  constructor(json: ICaseExpression) {
    super()
    this.cases = json.cases.map(json => new Case(json))
    if (json.else) this.else = parse(json.else)
  }

  // @override
  public toJson(): ICaseExpression {
    const json: ICaseExpression = {
      classname: this.classname,
      cases: [],
    }
    json.cases = this.cases.map(({ when, then }) => ({ when: when.toJson(), then: then.toJson() }))
    if (!isUnknown(this.else)) json.else = this.else.toJson()
    return json
  }
}

register(CaseExpression)
