import squel = require('squel')
import { $column, $value } from '.'
import { JQLError } from '../../../../utils/error'
import { IQuery, Query } from '../../query'
import { Expression, IExpression, isIExpression } from './__base'
import { create } from './__create'

export interface IInJson {
  $not?: boolean
  left: IExpression
  right?: IExpression | IQuery
}

export class InExpression extends Expression implements IInJson {
  public readonly classname = '$in'
  public $not?: boolean
  public left: Expression
  public right?: Expression | Query

  constructor(json?: IInJson) {
    super(json)
    if (json) {
      this.$not = json.$not
      this.left = create(json.left)
      if (json.right) {
        if (isIExpression(json.right)) {
          const expression = this.right = create(json.right)
          if (!(expression instanceof $value) || !Array.isArray(expression.value)) throw new JQLError('operand for $in operator should be an array')
        }
        else {
          if (Array.isArray(json.right.$select) && json.right.$select.length !== 1) throw new JQLError('operand for $in operator should contain exactly 1 column')
          const query = this.right = new Query(json.right)
          if (query.$select[0].expression instanceof $column && query.$select[0].expression.name === '*') throw new JQLError('operand for $in operator should contain exactly 1 column')
        }
      }
    }
  }

  public toSquel(): squel.BaseBuilder {
    const result = squel.expr()
    const expr = this.$not ? '? NOT IN ?' : '? IN ?'
    const params: any[] = []
    params.push(this.left.toSquel())
    if (this.right) params.push(this.right.toSquel())
    return result.and(expr, ...params)
  }
}
