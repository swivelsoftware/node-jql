import { ConditionalExpression, IConditionalExpression } from '.'
import { parse } from './parse'

/**
 * Raw JQL for conditional expressions
 */
export interface IGroupedExpressions extends IConditionalExpression {
  /**
   * Linked expressions
   */
  expressions: IConditionalExpression[]
}

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
   * @param expressions [Array<IConditionalExpression>]
   */
  constructor(expressions: IConditionalExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let expressions: IConditionalExpression[]
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
    this.expressions = expressions.map(expression => parse(expression) as ConditionalExpression)
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
