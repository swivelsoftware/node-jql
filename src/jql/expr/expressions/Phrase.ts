import squel from 'squel'
import { GroupedExpressions } from '../grouped'

/**
 * JQL class for concatenating string
 */
export class Phrase extends GroupedExpressions {
  public readonly classname = Phrase.name

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options: any = {}): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    const texts: string[] = [], allValues: any[] = []
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel(type, options).toParam()
      texts.push(text)
      allValues.push(...values)
    }
    return squel_.rstr(texts.join(' '), ...allValues)
  }
}
