import { IConditionalExpression, IExpression } from '../index.if'

/**
 * CASE WHEN {$when} THEN {$then} ... ELSE {$else} END
 */
export interface ICaseExpression extends IExpression {
  cases: Array<{ $when: IConditionalExpression, $then: IExpression }>,
  $else?: IExpression
}
