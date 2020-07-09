import squel from 'squel'
import { JQL } from '..'
import { Expression } from '../expr'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { IExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { IOrderBy } from './interface'

/**
 * JQL class for ordering terms in query
 */
export class OrderBy extends JQL implements IOrderBy {
  public expression: Expression
  public order: 'ASC'|'DESC'

  /**
   * @param json [IOrderingTerm]
   */
  constructor(json: IOrderBy)

  /**
   * @param expression [IExpression|string]
   * @param order ['ASC'|'DESC']
   */
  constructor(expression: IExpression|string, order?: 'ASC'|'DESC')

  constructor(...args: any[]) {
    super()

    // parse args
    let expression: IExpression|string, order: 'ASC'|'DESC'
    if (typeof args[0] !== 'string' && !('classname' in args[0])) {
      const json = args[0] as IOrderBy
      expression = json.expression
      order = json.order || 'ASC'
    }
    else {
      expression = typeof args[0] === 'string' ? new ColumnExpression(args[0]) : args[0]
      order = args[1] || 'ASC'
    }

    // set args
    this.expression = parseExpr(expression)
    this.order = order
  }

  // @override
  get [Symbol.toStringTag](): string {
    return OrderBy.name
  }

  // @override
  public validate(availableTables: string[]): void {
    this.expression.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    let builder = squel.select({}, [new squel.cls.GetFieldBlock()]) as squel.Select
    builder = builder.field(this.expression.toSquel())
    return squel.rstr(`? ${this.order}`, builder)
  }

  // @override
  public toJson(): IOrderBy {
    return {
      expression: this.expression.toJson(),
      order: this.order,
    }
  }
}
