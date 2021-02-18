import squel from 'squel'
import { GroupedExpressions } from '../grouped'

export class OrExpressions extends GroupedExpressions {
  public readonly classname = OrExpressions.name

  // @override
  public toSquel(type: squel.Flavour = 'mysql', { parentheses = true, ...options }: any = {}): squel.Expression {
    const squel_ = squel.useFlavour(type as any)
    let result = squel_.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel(type, options).toParam()
      result = result.or(text, ...values)
    }
    const { text, values } = result.toParam()
    return squel_.expr().or(parentheses && this.expressions.length > 1 ? `(${text})` : text, ...values)
  }
}
