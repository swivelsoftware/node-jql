import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ConditionalExpression, IConditionalExpression } from '../interface'

export type GroupedOperator = 'AND'|'OR'

export interface IGroupedExpression extends IConditionalExpression {
  expressions: IConditionalExpression[]
}

/**
 * a group of (conditional) expressions
 */
export abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpression {
  public readonly classname: string = 'GroupedExpressions'
  public expressions: ConditionalExpression[]

  constructor(json: IGroupedExpression) {
    super()
    try {
      this.expressions = json.expressions.map((expression) => parseExpression(expression) as ConditionalExpression)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate GroupedExpressions', e)
    }
  }

  // @override
  public validate(tables: string[]) {
    for (const expression of this.expressions) expression.validate(tables)
  }
}
