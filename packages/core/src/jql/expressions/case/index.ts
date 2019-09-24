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
  public readonly classname: string = CaseExpression.name

  // @override
  public readonly cases: Array<{ $when: ConditionalExpression, $then: Expression }>

  // @override
  public readonly $else?: Expression

  constructor(json: ICaseExpression)
  constructor(cases: Array<{ $when: ConditionalExpression, $then: Expression }>, $else?: Expression)
  constructor(...args: any[]) {
    super()

    // parse
    let cases: Array<{ $when: IConditionalExpression, $then: IExpression }>, $else: IExpression|undefined
    if (args.length === 1 && !Array.isArray(args[0])) {
      const json = args[0] as ICaseExpression
      cases = json.cases
      $else = json.$else
    }
    else {
      cases = args[0] as Array<{ $when: IConditionalExpression, $then: IExpression }>
      $else = args[1] as IExpression|undefined
    }

    // set
    this.cases = cases.map(({ $when, $then }) => ({ $when: parse($when), $then: parse($then) }))
    if ($else) this.$else = parse($else)
  }

  // @override
  public toJson(): ICaseExpression {
    return {
      classname: this.classname,
      cases: this.cases.map(({ $when, $then }) => ({ $when: $when.toJson(), $then: $then.toJson() })),
      $else: this.$else && this.$else.toJson(),
    }
  }

  // @override
  public toString(): string {
    return format('CASE {0} ELSE {1}',
      this.cases.map(({ $when, $then }) => format('WHEN {0} THEN {1}', $when.toString(), $then.toString())).join(' '),
      this.$else ? this.$else.toString() : 'NULL',
    )
  }
}

register(CaseExpression)
