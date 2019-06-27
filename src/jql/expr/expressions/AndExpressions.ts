import squel = require('squel')
import { GroupedExpressions } from '../grouped'

export class AndExpressions extends GroupedExpressions {
  public readonly classname = AndExpressions.name

  // @override
  public toSquel(parentheses: boolean = true): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.and(text, ...values)
    }
    const { text, values } = result.toParam()
    return squel.expr().and(parentheses && this.expressions.length > 1 ? `(${text})` : text, ...values)
  }
}