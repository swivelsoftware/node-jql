import squel = require('squel')
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { IQuery, isQuery, Query } from '../query'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'
import { Unknown } from './unknown'
import { IValue, Value } from './value'

export interface IInExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  right: Unknown|any[]|IValue|IQuery
}

export class InExpression extends ConditionalExpression implements IInExpression {
  public readonly classname = 'InExpression'
  public left: Expression
  public $not?: boolean
  public right: Unknown|Value|Query

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
          this.right = parse(json.right) as Unknown|Value
        }
      }
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate InExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'InExpression'
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
