import squel from 'squel'
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '..'
import { IJQL } from '../..'
import { parse } from '../parse'

/**
 * Raw JQL for `WHEN {$when} THEN {$then}`
 */
export interface ICase extends IJQL {
  /**
   * Condition check
   */
  $when: IConditionalExpression

  /**
   * If condition matched
   */
  $then: any
}

/**
 * Raw JQL for `CASE {cases} ELSE {$else}`
 */
export interface ICaseExpression extends IExpression {
  /**
   * cases
   */
  cases: ICase[]|ICase

  /**
   * When no case matched
   */
  $else?: IExpression
}

/**
 * JQL class for `CASE {cases} ELSE {$else}`
 */
export class CaseExpression extends Expression implements ICaseExpression {
  public readonly classname = CaseExpression.name
  public cases: Array<{ $when: ConditionalExpression, $then: Expression }>
  public $else?: Expression

  /**
   * @param json [Partial<ICaseExpression>]
   */
  constructor(json: Partial<ICaseExpression>)

  /**
   * @param cases [Array<ICase>]
   * @param $else [IExpression] optional
   */
  constructor(cases: ICase[], $else?: IExpression)

  constructor(...args: any[]) {
    super()

    // parse args
    let cases: ICase[], $else: IExpression|undefined
    if (!Array.isArray(args[0])) {
      const json = args[0] as ICaseExpression
      cases = Array.isArray(json.cases) ? json.cases : [json.cases]
      $else = json.$else
    }
    else {
      cases = args[0]
      $else = args[1]
    }

    // check args
    if (!cases.length) throw new SyntaxError('Missing cases. There must be at lease 1 case')

    // set args
    this.cases = cases.map(({ $when, $then }) => ({ $when: parse($when), $then: parse($then) }))
    if ($else) this.$else = parse($else)
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const { $when, $then } of this.cases) {
      $when.validate(availableTables)
      $then.validate(availableTables)
    }
    if (this.$else) this.$else.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    const params = [] as any[]
    this.cases.forEach(({ $when, $then }) => params.push($when.toSquel(), $then.toSquel()))
    if (this.$else) params.push(this.$else.toSquel())
    return squel.expr().and(`CASE ${this.cases.map(() => 'WHEN ? THEN ?').join(' ')}${this.$else ? ' ELSE ?' : ''}`, ...params)
  }

  // @override
  public toJson(): ICaseExpression {
    const result: ICaseExpression = {
      classname: this.classname,
      cases: this.cases.map(({ $when, $then }) => ({ $when: $when.toJson(), $then: $then.toJson() })),
    }
    if (this.$else) result.$else = this.$else.toJson()
    return result
  }
}
