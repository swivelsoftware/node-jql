import { JQL } from '../..'
import { Expression } from '../../expressions'
import { IExpression } from '../../expressions/index.if'
import { parse } from '../../expressions/parse'
import { IResultColumn } from './index.if'

/**
 * Selected column in the result set
 */
export class ResultColumn extends JQL implements IResultColumn {
  // @override
  public readonly classname = ResultColumn.name

  // @override
  public expression: Expression

  // @override
  public $as?: string

  constructor(json?: IResultColumn) {
    super()

    if (json) {
      this
        .setExpression(json.expression)
        .setAs(json.$as)
    }
  }

  /**
   * set selected expression
   * @param expr [IExpression]
   */
  public setExpression(expr: IExpression): ResultColumn {
    this.expression = parse(expr)
    return this
  }

  /**
   * set alias name
   * @param name [string]
   */
  public setAs(name?: string): ResultColumn {
    this.$as = name
    return this
  }

  // @override
  public toJson(): IResultColumn {
    if (!this.expression) throw new Error('Column expression is undefined')
    return {
      classname: this.classname,
      expression: this.expression.toJson(),
      $as: this.$as,
    }
  }

  // @override
  public toString(): string {
    let result = this.expression.toString()
    if (this.$as) result = `${result} AS \`${this.$as}\``
    return result
  }
}
