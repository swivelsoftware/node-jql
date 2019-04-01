import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression, IExpression } from '.'
import { IQuery, isQuery, Query } from '../query'
import { JQLError } from '../utils/error'
import { parse } from './parse'
import { IValue, Value } from './value'

export interface IInExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  right: any[]|IValue|IQuery
}

export class InExpression extends ConditionalExpression implements IInExpression {
  public readonly classname = 'InExpression'
  public left: Expression
  public $not?: boolean
  public right: Value|Query

  constructor(json: IInExpression) {
    super()
    this.$not = json.$not
    try {
      this.left = parse(json.left)
      if (json.right) {
        if (isQuery(json.right)) {
          this.right = new Query(json.right)
        }
        else {
          this.right = parse(json.right) as Value
        }
      }
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate InExpression', e)
    }
  }

  get template(): string {
    return `? ${this.$not ? 'NOT ' : ''}IN ?`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        this.template,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }
}
