import { ConditionalExpression } from '.'
import { IExpression, IGroupedExpressions } from './interface'
import { parseExpr } from './parse'

/**
 * JQL class for conditional expressions
 */
export abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpressions {
  public readonly classname: string = GroupedExpressions.name
  public expressions: ConditionalExpression[]

  /**
   * @param json [Partial<IGroupedExpressions>]
   */
  constructor(json: Partial<IGroupedExpressions>)

  /**
   * @param expressions [Array<IExpression>]
   */
  constructor(expressions: IExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let expressions: IExpression[]
    if (!Array.isArray(args[0])) {
      const json = args[0] as IGroupedExpressions
      expressions = json.expressions
    }
    else {
      expressions = args[0]
    }

    // check args
    if (!expressions) throw new SyntaxError('Missing expressions')

    // set args
    this.expressions = expressions.map(expression => parseExpr(expression) as ConditionalExpression)
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const expression of this.expressions) expression.validate(availableTables)
  }

  // @override
  public toJson(): IGroupedExpressions {
    return {
      classname: this.classname,
      expressions: this.expressions.map(expression => expression.toJson()),
    }
  }
}
