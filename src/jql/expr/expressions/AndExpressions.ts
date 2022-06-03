import squel from '@swivel-admin/squel'
import { GroupedExpressions } from '../grouped'

export class AndExpressions extends GroupedExpressions {
  public readonly classname = AndExpressions.name

  // @override
  public toSquel(type: squel.Flavour = 'mysql', { parentheses = true, ...options }: any = {}): squel.Expression {
    const squel_ = squel.useFlavour(type as any)
    let result = squel_.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel(type, options).toParam()
      result = result.and(text, ...values)
    }
    const { text, values } = result.toParam()
    return squel_.expr().and(parentheses && this.expressions.length > 1 ? `(${text})` : text, ...values)
  }
}
