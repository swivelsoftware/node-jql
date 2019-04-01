import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '.'
import { JQLError } from '../utils/error'
import { parse } from './parse'

export interface IIsNullExpression extends IConditionalExpression {
  left: any
  $not?: boolean
}

export class IsNullExpression extends ConditionalExpression implements IIsNullExpression {
  public readonly classname = 'IsNullExpression'
  public left: Expression
  public $not?: boolean

  constructor(json: IIsNullExpression) {
    super()
    try {
      this.left = parse(json.left)
      this.$not = json.$not
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate IsNullExpression', e)
    }
  }

  get template(): string {
    return `? IS ${this.$not ? 'NOT ' : ''}NULL`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        this.template,
        this.left.toSquel(),
      )
  }
}
