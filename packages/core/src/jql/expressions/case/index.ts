import format from 'string-format'
import { ConditionalExpression, Expression } from '..'
import { IConditionalExpression, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { ICaseExpression } from './index.if'

/**
 * Case WHEN {$when} THEN {$then} ... ELSE {$else} END
 */
export class CaseExpression extends Expression implements ICaseExpression {
  // @override
  public readonly classname = CaseExpression.name

  // @override
  public cases: Array<{ $when: ConditionalExpression, $then: Expression }> = []

  // @override
  public $else?: Expression

  constructor(json?: ICaseExpression) {
    super()

    if (json) {
      for (const { $when, $then } of json.cases) {
        this.addCase($when, $then)
      }
      if (json.$else) this.setElse(json.$else)
    }
  }

  /**
   * add case statement
   * @param when [IConditionalExpression]
   * @param then [IExpression]
   */
  public addCase(when: IConditionalExpression, then: IExpression): CaseExpression {
    this.cases.push({
      $when: parse(when),
      $then: parse(then),
    })
    return this
  }

  /**
   * set ELSE expression
   * @param $else [IExpression]
   */
  public setElse($else: IExpression): CaseExpression {
    this.$else = parse($else)
    return this
  }

  // @override
  public toJson(): ICaseExpression {
    this.check()
    return {
      classname: this.classname,
      cases: this.cases.map(({ $when, $then }) => ({ $when: $when.toJson(), $then: $then.toJson() })),
      $else: this.$else && this.$else.toJson(),
    }
  }

  // @override
  public toString(): string {
    this.check()
    return format('CASE {0} ELSE {1}',
      this.cases.map(({ $when, $then }) => format('WHEN {0} THEN {1}', $when.toString(), $then.toString())).join(' '),
      this.$else ? this.$else.toString() : 'NULL',
    )
  }

  protected check(): void {
    if (!this.cases.length) throw new Error('No cases is defined')
  }
}

register(CaseExpression)
