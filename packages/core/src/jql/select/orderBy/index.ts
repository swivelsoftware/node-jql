import { JQL } from '../..'
import { Expression } from '../../expressions'
import { IExpression } from '../../expressions/index.if'
import { parse } from '../../parse'
import { IOrderBy } from './index.if'

/**
 * Ordering
 */
export class OrderBy extends JQL implements IOrderBy {
  // @override
  public readonly classname = OrderBy.name

  // @override
  public expression: Expression

  // @override
  public direction: 'ASC'|'DESC' = 'ASC'

  constructor(json?: IOrderBy) {
    super()

    if (json) {
      this.setExpression(json.expression, json.direction)
    }
  }

  /**
   * set selected expression
   * @param expr [IExpression]
   * @param direction [string]
   */
  public setExpression(expr: IExpression, direction: 'ASC'|'DESC' = 'ASC'): OrderBy {
    this.expression = parse(expr)
    this.direction = direction
    return this
  }

  // @override
  public toJson(): IOrderBy {
    if (!this.expression) throw new SyntaxError('Column expression is undefined')
    return {
      classname: this.classname,
      expression: this.expression.toJson(),
      direction: this.direction,
    }
  }

  // @override
  public toString(...args): string {
    return `${this.expression.toString()} ${this.direction}`
  }
}
