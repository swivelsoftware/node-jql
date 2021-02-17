import squel from 'squel'
import { GroupedExpressions } from '../grouped'

export class AndExpressions extends GroupedExpressions {
  public readonly classname = AndExpressions.name

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.Expression {
    const Squel = squel.useFlavour(type as any)
    const { parentheses } = options || {}
    let result = Squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel(type, options).toParam()
      result = result.and(text, ...values)
    }
    const { text, values } = result.toParam()
    return Squel.expr().and(parentheses && this.expressions.length > 1 ? `(${text})` : text, ...values)
  }
}
