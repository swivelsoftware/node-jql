import squel = require('squel')
import { ConditionalExpression, IConditionalExpression } from '.'
import { JQLError } from '../utils/error'
import { parse } from './parse'

export interface IGroupedExpressions extends IConditionalExpression {
  expressions: IConditionalExpression[]
}

export abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpressions {
  public readonly classname: string = 'GroupedExpressions'
  public expressions: ConditionalExpression[]

  constructor(json: IGroupedExpressions) {
    super()
    try {
      this.expressions = json.expressions.map((expression) => parse(expression) as ConditionalExpression)
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate GroupedExpressions', e)
    }
  }

  // @override
  public validate(availableTables: string[]) {
    for (const expression of this.expressions) expression.validate(availableTables)
  }
}

export class AndExpressions extends GroupedExpressions {
  public readonly classname = 'AndExpressions'

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.and(text, ...values)
    }
    return result
  }
}

export class OrExpressions extends GroupedExpressions {
  public readonly classname = 'OrExpressions'

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.or(text, ...values)
    }
    return result
  }
}
