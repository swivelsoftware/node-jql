import { ConditionalExpression } from '..'
import { parse, register } from '../../parse'
import { IConditionalExpression } from '../index.if'
import { IGroupedExpressions } from './index.if'

/**
 * {expr1} - {expr2} - ... - {exprN}
 */
abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpressions {
  // @override
  public expressions: ConditionalExpression[] = []

  constructor(json?: IGroupedExpressions) {
    super()

    // parse
    if (json) {
      for (const expr of json.expressions) {
        this.addExpression(expr)
      }
    }
  }

  /**
   * add expression
   * @param expr [IConditionalExpression]
   */
  public addExpression(expr: IConditionalExpression): GroupedExpressions {
    this.expressions.push(parse(expr))
    return this
  }

  // @override
  public toJson(): IGroupedExpressions {
    this.check()
    return {
      classname: this.classname,
      expressions: this.expressions.map(e => e.toJson()),
    }
  }

  // @override
  protected check(): void {
    if (!this.expressions.length) throw new SyntaxError('No expressions is defined')
  }
}

/**
 * {expr1} AND {expr2} AND ... AND {exprN}
 */
export class AndExpressions extends GroupedExpressions implements IGroupedExpressions {
  // @override
  public readonly classname = AndExpressions.name

  // @override
  public toString(): string {
    this.check()
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
  public readonly classname = OrExpressions.name

  // @override
  public toString(): string {
    this.check()
    let result = this.expressions.map(e => e.toString()).join(' OR ')
    if (this.expressions.length > 1) result = `(${result})`
    return result
  }
}

// register as parseable
register(AndExpressions)
register(OrExpressions)
