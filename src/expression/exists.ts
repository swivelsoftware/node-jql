import squel = require('squel')
import { ConditionalExpression, IConditionalExpression } from '.'
import { IQuery, Query } from '../query'
import { JQLError } from '../utils/error'

export interface IExistsExpression extends IConditionalExpression {
  $not?: boolean
  query: IQuery
}

export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  public readonly classname = 'ExistsExpression'
  public $not?: boolean
  public query: Query

  constructor(json: IExistsExpression) {
    super()
    try {
      this.$not = json.$not
      this.query = new Query(json.query)
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate ExistsExpression', e)
    }
  }

  // @override
  public validate(availableTables: string[]) {
    this.query.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `${this.$not ? 'NOT ' : ''}EXISTS ?`,
        this.query.toSquel(),
      )
  }
}
