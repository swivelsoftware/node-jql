import { IConditionalExpression, IExpression } from '../index.if'

/**
 * CASE WHEN {$when} THEN {$then} ... ELSE {$else} END
 */
export interface ICaseExpression extends IExpression {
  /**
   * Cases
   */
  cases: Array<{ $when: IConditionalExpression, $then: IExpression }>,

  /**
   * ELSE case
   */
  $else?: IExpression
}
