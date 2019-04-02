import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
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
      throw new InstantiateError('Fail to instantiate IsNullExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'IsNullExpression'
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
