import { ConditionalExpression } from '..'
import { IConditionalExpression } from '../index.if'
import { parse, register } from '../parse'
import { IGroupedExpressions } from './index.if'

/**
 * {expr1} - {expr2} - ... - {exprN}
 */
abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpressions {
  // @override
  public expressions: ConditionalExpression[] = []

  constructor(json: IGroupedExpressions)
  constructor(expressions: ConditionalExpression[])
  constructor(...args: any[]) {
    super()

    // parse
    let expressions: IConditionalExpression[]
    if (!Array.isArray(args[0])) {
      const json = args[0] as IGroupedExpressions
      expressions = json.expressions
    }
    else {
      expressions = args[0] as ConditionalExpression[]
    }

    // set
    this.expressions = expressions.map(e => parse(e))
  }

  // @override
  public toJson(): IGroupedExpressions {
    return {
      classname: this.classname,
      expressions: this.expressions.map(e => e.toJson()),
    }
  }
}

/**
 * {expr1} AND {expr2} AND ... AND {exprN}
 */
export class AndExpressions extends GroupedExpressions implements IGroupedExpressions {
  // @override
  public readonly classname: string = AndExpressions.name

  // @override
  public toString(): string {
    let result = this.expressions.map(e => e.toString()).join(' AND ')
    if (this.expressions.length > 1) result = `(${result})`
    return result
  }
}

/**
 * {expr1} OR {expr2} OR ... OR {exprN}
 */
export class OrExpressions extends GroupedExpressions implements IGroupedExpressions {
  // @override
  public readonly classname: string = OrExpressions.name

  // @override
  public toString(): string {
    let result = this.expressions.map(e => e.toString()).join(' OR ')
    if (this.expressions.length > 1) result = `(${result})`
    return result
  }
}

// register as parseable
register(AndExpressions)
register(OrExpressions)
