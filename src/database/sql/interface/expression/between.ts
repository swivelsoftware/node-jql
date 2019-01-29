import squel = require('squel')
import { create } from './create'
import { Expression, IExpression, IUnknownExpression } from './index'

export interface IBetweenExpression extends IUnknownExpression {
  $not?: boolean
  left: IExpression
  start?: IExpression
  end?: IExpression
}

export class BetweenExpression extends Expression implements IBetweenExpression {
  public readonly classname = '$between'
  public $not?: boolean
  public left: Expression
  public start?: Expression
  public end?: Expression

  constructor(json?: IBetweenExpression) {
    super(json)
    if (json) {
      this.$not = json.$not
      this.left = create(json.left)
      if (json.start) this.start = create(json.start)
      if (json.end) this.end = create(json.end)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const parameters = [...this.parameters || []]
    const result = squel.expr()
    const expr = this.$not ? '? NOT BETWEEN ? AND ?' : '? BETWEEN ? AND ?'
    const params: any[] = []
    params.push(this.left.toSquel())
    params.push(this.start ? this.start.toSquel() : parameters.shift())
    params.push(this.end ? this.end.toSquel() : parameters.shift())
    return result.and(expr, ...params)
  }
}
