import squel = require('squel')
import { Expression, IExpression } from './__base'
import { create } from './__create'

export interface IIsNullJson {
  $not?: boolean
  left: IExpression
}

export class IsNullExpression extends Expression implements IIsNullJson {
  public readonly classname = '$isNull'
  public $not?: boolean
  public left: Expression

  constructor(json?: IIsNullJson) {
    super(json)
    if (json) {
      this.$not = json.$not
      this.left = create(json.left)
    }
  }

  public toSquel(): squel.BaseBuilder {
    const result = squel.expr()
    const expr = this.$not ? '? IS NOT NULL' : '? IS NULL'
    const params: any[] = []
    params.push(this.left.toSquel())
    return result.and(expr, ...params)
  }
}
