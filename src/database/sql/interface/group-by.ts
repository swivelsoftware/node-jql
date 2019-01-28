import { create } from './expression/create'
import { IExpression } from './expression/index'

export interface IGroupBy {
  expressions: IExpression[] | IExpression
  $having?: IExpression[] | IExpression
}

export class GroupBy implements IGroupBy {
  public expressions: IExpression[]
  public $having?: IExpression

  constructor(groupBy?: IGroupBy) {
    switch (typeof groupBy) {
      case 'object':
        let expressions = groupBy.expressions
        if (!Array.isArray(expressions)) { expressions = [expressions] }
        this.expressions = expressions.map((expression) => create(expression))
        if (groupBy.$having) { this.$having = Array.isArray(groupBy.$having) ? create({ classname: '$and', expressions: groupBy.$having }) : create(groupBy.$having) }
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'groupBy' object`)
    }
  }
}
