import squel from 'squel'
import { GroupedExpressions } from '../grouped'

export class OrExpressions extends GroupedExpressions {
  public readonly classname = OrExpressions.name

  // @override
  public toSquel(parentheses: boolean = true): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.or(text, ...values)
    }
    const { text, values } = result.toParam()
    return squel.expr().or(parentheses && this.expressions.length > 1 ? `(${text})` : text, ...values)
  }
}
